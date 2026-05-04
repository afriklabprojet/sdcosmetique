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

// ─── Fallback en mémoire (dev / CI) ──────────────────────────────────────────

type WindowEntry = { count: number; resetAt: number };
const memStore = new Map<string, WindowEntry>();

function memRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
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
 * @param key        Clé unique : ex. `contact:192.168.1.1`
 * @param limit      Nombre max de requêtes dans la fenêtre
 * @param windowMs   Fenêtre glissante en millisecondes
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!hasUpstash) {
    return memRateLimit(key, limit, windowMs);
  }

  const windowSeconds = Math.ceil(windowMs / 1000);
  const limiter = getLimiter(limit, windowSeconds);
  const { success, remaining, reset } = await limiter.limit(key);

  return {
    ok: success,
    limit,
    remaining,
    resetAt: reset, // Upstash retourne le timestamp en ms
  };
}

/** Extrait l'IP du client depuis les headers standards (proxy-aware). */
export function getIp(req: Request): string {
  return (
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
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
