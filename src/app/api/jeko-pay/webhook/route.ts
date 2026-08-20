import { NextRequest, NextResponse } from 'next/server';
import { verifyJekoSignature, type JekoWebhookPayload } from '@/features/payment/jeko-pay-webhook.validator';
import { extractReference } from '@/features/payment/payment-rules';
import { settleOrderPayment } from '@/features/payment/payment-settlement.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('jeko-signature');

  if (!verifyJekoSignature(raw, sig)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: JekoWebhookPayload;
  try {
    payload = JSON.parse(raw) as JekoWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const reference = extractReference(payload);
  const txnId     = payload.id;
  const succeeded = payload.status === 'success';

  if (!reference) {
    console.warn('[jeko-webhook] Aucune référence exploitable dans le payload', {
      txnId,
      status: payload.status,
      keys: Object.keys(payload),
      transactionDetails: payload.transactionDetails,
    });
    return NextResponse.json({ received: true, skipped: 'no_reference' }, { status: 200 });
  }

  try {
    const outcome = await settleOrderPayment({
      reference,
      succeeded,
      receivedAmount: payload.amount?.amount ?? 0,
      txnId,
      source: 'webhook',
    });

    if (!outcome.ok && outcome.reason === 'db_error') {
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    if (!outcome.ok) {
      return NextResponse.json({ received: true, error: outcome.reason }, { status: 200 });
    }
  } catch (e) {
    console.error('[jeko-webhook] Erreur inattendue', reference, e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
