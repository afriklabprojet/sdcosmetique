import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequest, JekoPayError } from '@/features/payment/jeko-pay.client';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

/**
 * GET /api/jeko-pay/status/[id]
 * Récupère l'état d'une demande de paiement Jeko (utile en fallback du webhook,
 * notamment depuis la page successUrl).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Limite l'énumération des identifiants de paiement.
  const rl = await rateLimit(`jeko-status:${getIp(req)}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  try {
    const pr = await getPaymentRequest(id);
    return NextResponse.json({
      id:            pr.id,
      reference:     pr.reference,
      status:        pr.status,
      paymentMethod: pr.paymentMethod,
      transaction:   pr.transaction ?? null,
      errorReason:   pr.errorReason ?? null,
    });
  } catch (e) {
    if (e instanceof JekoPayError) {
      return NextResponse.json(
        { error: 'jeko_error', status: e.status, body: e.body },
        { status: e.status >= 500 ? 502 : e.status },
      );
    }
    
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
