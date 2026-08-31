import { NextResponse, type NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

const revalidateLimiter = new RateLimiterMemory({ points: 10, duration: 600 });
const cspLimiter = new RateLimiterMemory({ points: 30, duration: 600 });

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const limiter = pathname === '/api/revalidate'
    ? revalidateLimiter
    : pathname === '/api/csp-report'
      ? cspLimiter
      : null;

  if (limiter) {
    try {
      await limiter.consume(getIp(request), 1);
    } catch (rej) {
      if (rej instanceof Error) throw rej;
      const retryAfter = Math.max(1, Math.ceil((rej as { msBeforeNext?: number }).msBeforeNext ?? 60000) / 1000);
      return NextResponse.json(
        { error: 'rate_limit_exceeded' },
        {
          status: 429,
          headers: rateLimitHeaders({
            ok: false,
            limit: pathname === '/api/revalidate' ? 10 : 30,
            remaining: 0,
            resetAt: Date.now() + retryAfter * 1000,
          }),
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/revalidate', '/api/csp-report'],
};
