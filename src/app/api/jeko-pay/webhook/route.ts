import { NextRequest, NextResponse } from 'next/server';
import { verifyJekoSignature, type JekoWebhookPayload } from '@/features/payment/jeko-pay-webhook.validator';
import { createServiceClient } from '@/shared/supabase/service.client';
import { sendOrderConfirmationByNumber } from '@/features/orders/order-notification.service';

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
  const succeeded = payload.status === 'success';

  if (!reference) {
    // Paiement via payment_link non créé par l'API → ack mais skip update.
    
    return NextResponse.json({ received: true, skipped: 'no_reference' }, { status: 200 });
  }

  try {
    const supabase = createServiceClient();

    // [SEC] Vérifier que le montant reçu correspond bien au total de la commande
    // avant de la marquer payée — sinon un webhook falsifié (ou un montant
    // partiel) pourrait valider une commande pour moins que son prix réel.
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('total, payment_status')
      .eq('order_number', reference)
      .single();

    if (orderErr || !orderRow) {
      console.error('[jeko-webhook] Commande introuvable:', reference);
      return NextResponse.json({ received: true, skipped: 'order_not_found' }, { status: 200 });
    }

    const expectedCents = Math.round(Number(orderRow.total) * 100);
    const receivedCents = payload.amount?.amount ?? 0;

    if (succeeded && receivedCents !== expectedCents) {
      console.error('[jeko-webhook] Montant incohérent', { reference, expectedCents, receivedCents });
      // Ne PAS marquer comme payée — logguer et acquitter (200) pour éviter les retries Jeko.
      return NextResponse.json({ received: true, error: 'amount_mismatch' }, { status: 200 });
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        payment_status:          succeeded ? 'paid' : 'failed',
        // Paiement validé → commande confirmée ; échec → reste en attente (retry possible)
        ...(succeeded ? { status: 'confirmed' } : {}),
        payment_provider:        'jeko',
        payment_provider_txn_id: txnId,
        payment_reference:       reference,
        payment_paid_at:         succeeded ? new Date().toISOString() : null,
        updated_at:              new Date().toISOString(),
      })
      .eq('order_number', reference)
      // Ne pas écraser un paiement déjà confirmé
      .neq('payment_status', 'paid')
      .select('order_number');

    if (error) {
      // [LOG-01] Logguer l'erreur DB pour débogage — Jeko retentera automatiquement
      // car on retourne 500 (retry policy Jeko : 3 tentatives espacées de 5 min).
      console.error('[jeko-webhook] Erreur DB update ordre', reference, error);
      // 5xx → Jeko retentera
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    // Email de confirmation : uniquement si CE webhook est celui qui a fait
    // passer la commande à `paid`. Un retry Jeko ne matche plus aucune ligne
    // (à cause du .neq('payment_status','paid')) → pas de second envoi.
    if (succeeded && updated && updated.length > 0) {
      await sendOrderConfirmationByNumber(reference);
    }
  } catch (e) {
    // [LOG-01] Catch inattendu : logguer pour diagnostiquer
    console.error('[jeko-webhook] Erreur inattendue', reference, e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
