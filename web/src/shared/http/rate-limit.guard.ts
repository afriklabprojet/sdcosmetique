/**
 * In-process rate limiter for the two Next route handlers that stay in ./web
 * (`/api/revalidate`, `/api/csp-report`). Counters are per instance.
 */
import { RateLimiterMemory, type RateLimiterRes } from 'rate-limiter-flexible';

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimitPolicy {
  /** Max requests in the window. */
  limit: number;
  /** Sliding window, in milliseconds. */
  windowMs: number;
}

const limiters = new Map<string, RateLimiterMemory>();

function getLimiter(limit: number, windowSeconds: number): RateLimiterMemory {
  const key = `${limit}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new RateLimiterMemory({ points: limit, duration: windowSeconds });
    limiters.set(key, limiter);
  }
  return limiter;
}

function toResult(limit: number, res: RateLimiterRes, ok: boolean): RateLimitResult {
  return {
    ok,
    limit,
    remaining: Math.max(0, res.remainingPoints),
    resetAt: Date.now() + res.msBeforeNext,
  };
}

export async function rateLimit(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
  const { limit, windowMs } = policy;
  const limiter = getLimiter(limit, Math.max(1, Math.ceil(windowMs / 1000)));

  try {
    const res = await limiter.consume(key, 1);
    return toResult(limit, res, true);
  } catch (rej) {
    if (rej instanceof Error) throw rej;
    return toResult(limit, rej as RateLimiterRes, false);
  }
}

export function getIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return 'unknown';
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
  };
}
