/**
 * Rate limiter distribué via Upstash Redis (sliding window).
 * Si les variables UPSTASH_REDIS_REST_URL / _TOKEN sont absentes
 * (ex. dev local), bascule automatiquement sur un fallback en mémoire.
 *
 * Variables requises en production :
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=xxx
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // timestamp ms
}

// ─── Upstash (production) ────────────────────────────────────────────────────

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function makeUpstashLimiter(limit: number, windowSeconds: number): Ratelimit {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds}s`),
    analytics: false,
    prefix: 'sd:rl',
  });
}

// Cache des limiters par signature (évite de recréer à chaque requête)
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowSeconds: number): Ratelimit {
  const key = `${limit}:${windowSeconds}`;
  if (!limiters.has(key)) {
    limiters.set(key, makeUpstashLimiter(limit, windowSeconds));
  }
  return limiters.get(key)!;
}

/**
 * Quota d'une route : un plafond et la fenêtre sur laquelle il s'applique.
 * Les deux valeurs n'ont aucun sens l'une sans l'autre.
 */
export interface RateLimitPolicy {
  /** Nombre max de requêtes dans la fenêtre. */
  limit: number;
  /** Fenêtre glissante, en millisecondes. */
  windowMs: number;
}

// ─── Fallback en mémoire (dev / CI) ──────────────────────────────────────────

type WindowEntry = { count: number; resetAt: number };
const memStore = new Map<string, WindowEntry>();

function memRateLimit(key: string, { limit, windowMs }: RateLimitPolicy): RateLimitResult {
  const now = Date.now();

  if (memStore.size > 10_000) {
    for (const [k, v] of memStore) {
      if (v.resetAt < now) memStore.delete(k);
    }
  }

  const entry = memStore.get(key);
  if (!entry || entry.resetAt < now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { ok: entry.count <= limit, limit, remaining, resetAt: entry.resetAt };
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * @param key     Clé unique : ex. `contact:192.168.1.1`
 * @param policy  Quota applique a cette clé.
 */
export async function rateLimit(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
  const { limit, windowMs } = policy;

  if (!hasUpstash) {
    return memRateLimit(key, policy);
  }

  const windowSeconds = Math.ceil(windowMs / 1000);

  try {
    const limiter = getLimiter(limit, windowSeconds);
    const { success, remaining, reset } = await limiter.limit(key);

    return {
      ok: success,
      limit,
      remaining,
      resetAt: reset, // Upstash retourne le timestamp en ms
    };
  } catch (e) {
    // Upstash injoignable (DNS, timeout, token invalide, quota) : ne JAMAIS laisser
    // le rejet s'échapper — sinon la route renvoie un 500 sans body ni content-type
    // et le client interprète l'échec de `res.json()` comme une « erreur réseau ».
    console.error('[rate-limit] Upstash indisponible, fallback mémoire:', e instanceof Error ? e.message : e);
    return memRateLimit(key, policy);
  }
}

/**
 * Extrait l'IP du client depuis les headers standards (proxy-aware).
 *
 * [SEC-H4] Le site est derrière LiteSpeed (voir server.js) : ce proxy est le
 * seul point d'entrée et écrase X-Real-IP à chaque requête, donc on peut lui
 * faire confiance. On NE prend PAS le premier maillon de X-Forwarded-For :
 * un attaquant qui parle directement à Node (ou passe par un proxy qui ajoute
 * bêtement son en-tête sans écraser l'existant) peut y injecter n'importe
 * quelle valeur, ce qui rendrait tous les rate limiters contournables.
 */
export function getIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback : le maillon le plus à droite est le plus proche de nous (LiteSpeed).
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return 'unknown';
}

/** Headers HTTP standard pour les réponses 429. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}
