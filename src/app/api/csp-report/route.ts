import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

/**
 * POST /api/csp-report
 * Collecteur pour la Content-Security-Policy-Report-Only déclarée dans
 * next.config.ts. Sans cette route, les navigateurs POSTent dans le vide et
 * on ne voit jamais les violations avant de passer en mode bloquant.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`csp-report:${getIp(req)}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const body = await req.text().catch(() => '');
  if (body) {
    // Les navigateurs envoient soit `csp-report` (legacy), soit le format
    // Reporting API — on logge le brut, on ne le parse pas pour rester tolérant.
    console.warn('[csp-report]', body.slice(0, 4000));
  }

  return new NextResponse(null, { status: 204 });
}
