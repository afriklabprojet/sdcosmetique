import { NextRequest, NextResponse } from 'next/server';
import { verifyJekoSignature, type JekoWebhookPayload } from '@/lib/jeko-pay/webhook';
import { createServiceClient } from '@/utils/supabase/service';

export const runtime = 'nodejs';
// Désactive tout cache pour les webhooks
export const dynamic = 'force-dynamic';

/**
 * POST /api/jeko-pay/webhook
 * Reçoit `transaction.completed` de Jeko Africa.
 *
 * Sécurité :
 *  - Lit le body brut (req.text) AVANT tout parse JSON.
 *  - Vérifie la signature HMAC-SHA256 via le header `Jeko-Signature`.
 *  - Doit répondre 2xx en < 5s (sinon Jeko retente jusqu'à 3 fois).
 */
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

  // Idempotence : la même transaction peut arriver plusieurs fois (retry policy).
  const reference = payload.transactionDetails?.reference;
  const txnId     = payload.id;
  const isSuccess = payload.status === 'success';

  if (!reference) {
    // Paiement via payment_link non créé par l'API → ack mais skip update.
    
    return NextResponse.json({ received: true, skipped: 'no_reference' }, { status: 200 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status:          isSuccess ? 'paid' : 'failed',
        payment_provider:        'jeko',
        payment_provider_txn_id: txnId,
        payment_reference:       reference,
        payment_paid_at:         isSuccess ? new Date().toISOString() : null,
        updated_at:              new Date().toISOString(),
      })
      .eq('order_number', reference)
      // Ne pas écraser un paiement déjà confirmé
      .neq('payment_status', 'paid');

    if (error) {
      
      // 5xx → Jeko retentera
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
  } catch (e) {
    
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
