import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequest, JekoPayError } from '@/features/payment/jeko-pay.client';
import { settleOrderPayment } from '@/features/payment/payment-settlement.service';
import { createServiceClient } from '@/shared/supabase/service.client';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/jeko-pay/reconcile  { orderNumber }
 *
 * Filet de securite du webhook. Interroge Jeko sur l'etat REEL de la demande de
 * paiement d'une commande et applique le resultat via la meme regle que le
 * webhook. Appele par la page de confirmation au retour du checkout heberge :
 * si le webhook n'arrive jamais (URL non configuree, indisponibilite, signature
 * invalide), la commande ne reste plus bloquee en « en attente de paiement »
 * alors que le client a paye.
 *
 * Jeko reste la source de verite : cette route ne fait que LIRE l'etat chez le
 * PSP. Le corps de la requete ne peut jamais decider qu'une commande est payee.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`jeko-reconcile:${getIp(req)}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let orderNumber: string;
  try {
    const body = (await req.json()) as { orderNumber?: string };
    orderNumber = String(body?.orderNumber ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!orderNumber) {
    return NextResponse.json({ error: 'missing_order_number' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('payment_status, payment_request_id')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  // Deja reglee (le webhook a fait son travail) → rien a interroger.
  if (order.payment_status === 'paid') {
    return NextResponse.json({ paymentStatus: 'paid', changed: false });
  }

  // Commande anterieure au stockage de l'id, ou paiement jamais initie.
  if (!order.payment_request_id) {
    return NextResponse.json({ paymentStatus: order.payment_status, changed: false, reason: 'no_payment_request' });
  }

  let payment;
  try {
    payment = await getPaymentRequest(order.payment_request_id);
  } catch (e) {
    const status = e instanceof JekoPayError && e.status >= 500 ? 502 : 500;
    console.error('[jeko-reconcile] Echec interrogation Jeko', {
      orderNumber,
      paymentRequestId: order.payment_request_id,
      message: e instanceof Error ? e.message : e,
    });
    return NextResponse.json({ error: 'jeko_unreachable' }, { status });
  }

  // Tant que Jeko dit « pending », la commande reste en attente : on ne
  // transforme jamais une absence de reponse en paiement valide.
  if (payment.status === 'pending') {
    return NextResponse.json({ paymentStatus: order.payment_status, changed: false, jekoStatus: 'pending' });
  }

  const outcome = await settleOrderPayment(supabase, {
    reference:      orderNumber,
    succeeded:      payment.status === 'success',
    receivedAmount: payment.transaction?.amount?.amount ?? 0,
    txnId:          payment.transaction?.id ?? null,
    source:         'reconcile',
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.reason === 'db_error' ? 500 : 409 });
  }

  return NextResponse.json({
    paymentStatus: payment.status === 'success' ? 'paid' : 'failed',
    changed:       outcome.changed,
    jekoStatus:    payment.status,
  });
}
