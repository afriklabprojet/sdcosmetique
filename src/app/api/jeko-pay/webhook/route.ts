import { NextRequest, NextResponse } from 'next/server';
import { verifyJekoSignature, type JekoWebhookPayload } from '@/features/payment/jeko-pay-webhook.validator';
import { extractReference } from '@/features/payment/payment-rules';
import { createServiceClient } from '@/shared/supabase/service.client';
import { settleOrderPayment } from '@/features/payment/payment-settlement.service';

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
  const reference = extractReference(payload);
  const txnId     = payload.id;
  const succeeded = payload.status === 'success';

  if (!reference) {
    // Paiement via payment_link non créé par l'API → ack mais skip update.
    // [LOG-02] Tracer le payload : jusqu'ici ce cas sortait silencieusement et
    // un paiement réel restait « en attente » sans laisser la moindre trace.
    console.warn('[jeko-webhook] Aucune référence exploitable dans le payload', {
      txnId,
      status: payload.status,
      keys: Object.keys(payload),
      transactionDetails: payload.transactionDetails,
    });
    return NextResponse.json({ received: true, skipped: 'no_reference' }, { status: 200 });
  }

  try {
    const supabase = createServiceClient();

    // [SEC] Le controle de montant et la mise a jour vivent dans
    // `settleOrderPayment` — regle unique partagee avec la reconciliation, pour
    // qu'un paiement produise le meme etat quel que soit le chemin emprunte.
    const outcome = await settleOrderPayment(supabase, {
      reference,
      succeeded,
      receivedAmount: payload.amount?.amount ?? 0,
      txnId,
      source: 'webhook',
    });

    if (!outcome.ok && outcome.reason === 'db_error') {
      // 5xx → Jeko retentera (3 tentatives espacées de 5 min).
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    if (!outcome.ok) {
      // Commande introuvable ou montant incoherent : acquitter pour couper les
      // retries, l'anomalie est deja loguee cote service.
      return NextResponse.json({ received: true, error: outcome.reason }, { status: 200 });
    }
  } catch (e) {
    // [LOG-01] Catch inattendu : logguer pour diagnostiquer
    console.error('[jeko-webhook] Erreur inattendue', reference, e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
