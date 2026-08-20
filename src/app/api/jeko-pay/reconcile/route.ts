import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders } from '@/shared/db/schema';
import { getPaymentRequest, JekoPayError } from '@/features/payment/jeko-pay.client';
import { settleOrderPayment } from '@/features/payment/payment-settlement.service';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const orderRows = await db
    .select({
      paymentStatus: orders.paymentStatus,
      paymentRequestId: orders.paymentRequestId,
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!orderRows.length) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  const order = orderRows[0];

  if (order.paymentStatus === 'paid') {
    return NextResponse.json({ paymentStatus: 'paid', changed: false });
  }

  if (!order.paymentRequestId) {
    return NextResponse.json({ paymentStatus: order.paymentStatus, changed: false, reason: 'no_payment_request' });
  }

  let payment;
  try {
    payment = await getPaymentRequest(order.paymentRequestId);
  } catch (e) {
    const status = e instanceof JekoPayError && e.status >= 500 ? 502 : 500;
    console.error('[jeko-reconcile] Echec interrogation Jeko', {
      orderNumber,
      paymentRequestId: order.paymentRequestId,
      message: e instanceof Error ? e.message : e,
    });
    return NextResponse.json({ error: 'jeko_unreachable' }, { status });
  }

  if (payment.status === 'pending') {
    return NextResponse.json({ paymentStatus: order.paymentStatus, changed: false, jekoStatus: 'pending' });
  }

  const outcome = await settleOrderPayment({
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
