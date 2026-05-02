import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequest, JekoPayError } from '@/lib/jeko-pay/client';

export const runtime = 'nodejs';

/**
 * GET /api/jeko-pay/status/[id]
 * Récupère l'état d'une demande de paiement Jeko (utile en fallback du webhook,
 * notamment depuis la page successUrl).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    console.error('[jeko-pay/status]', e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
