import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders } from '@/shared/db/schema';
import {
  createRedirectPayment,
  PAYMENT_METHOD_TO_JEKO,
  JekoPayError,
  type JekoPayProvider,
} from '@/features/payment/jeko-pay.client';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

interface CheckoutBody {
  orderNumber: string;
  paymentMethod: string;
  payerPhone?: string;
  forceProviderDirect?: boolean;
}

function siteUrl(): string {
  return process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

function normalizePhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replaceAll(/[\s\-().]/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('225') && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+225${digits}`;
  if (digits.length >= 8 && digits.length <= 9) return `+225${digits}`;
  return digits;
}

function resolveProvider(method: string): JekoPayProvider | null {
  if (method in PAYMENT_METHOD_TO_JEKO) return PAYMENT_METHOD_TO_JEKO[method];
  const direct = ['wave', 'orange', 'mtn', 'moov', 'djamo'] as const;
  return (direct as readonly string[]).includes(method) ? (method as JekoPayProvider) : null;
}

export async function POST(req: NextRequest) {
  try {
    return await goToCheckout(req);
  } catch (e) {
    console.error('[jeko-pay] Erreur non gérée:', e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: 'internal_error', message: 'unknown' },
      { status: 500 },
    );
  }
}

async function goToCheckout(req: NextRequest) {
  const rl = await rateLimit(`checkout:${getIp(req)}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.orderNumber || !body.paymentMethod) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const provider = resolveProvider(body.paymentMethod);
  if (!provider) {
    return NextResponse.json(
      { error: 'unsupported_payment_method', method: body.paymentMethod },
      { status: 400 },
    );
  }

  const ordRows = await db
    .select({
      total: orders.total,
      paymentStatus: orders.paymentStatus,
    })
    .from(orders)
    .where(eq(orders.orderNumber, body.orderNumber))
    .limit(1);

  if (!ordRows.length) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 400 });
  }
  const ord = ordRows[0];
  if (ord.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 });
  }

  const amountXof = Number(ord.total);
  if (!amountXof || amountXof <= 0) {
    return NextResponse.json({ error: 'invalid_order_total' }, { status: 400 });
  }

  const base = siteUrl();
  const ref = encodeURIComponent(body.orderNumber);

  try {
    const payment = await createRedirectPayment({
      amountCents:         amountXof * 100,
      reference:           body.orderNumber,
      paymentMethod:       provider,
      successUrl:          `${base}/confirmation?ref=${ref}&status=success`,
      errorUrl:            `${base}/checkout?ref=${ref}&status=error`,
      payerPhone:          normalizePhone(body.payerPhone),
      forceProviderDirect: body.forceProviderDirect,
    });

    await db
      .update(orders)
      .set({
        paymentRequestId: payment.id,
        paymentProvider:   'jeko',
      })
      .where(eq(orders.orderNumber, body.orderNumber));

    return NextResponse.json({
      id:          payment.id,
      reference:   payment.reference,
      status:      payment.status,
      redirectUrl: payment.redirectUrl,
    });
  } catch (e) {
    if (e instanceof JekoPayError) {
      console.error('[jeko-pay] Erreur API Jeko:', {
        httpStatus: e.status,
        jekoMessage: e.body?.message,
        jekoId: e.body?.id,
        jekoExtras: e.body?.extras,
        provider,
        amountXof,
        orderNumber: body.orderNumber,
      });
      return NextResponse.json(
        { error: 'jeko_error', status: e.status, body: e.body },
        { status: e.status >= 500 ? 502 : e.status },
      );
    }
    
    console.error('[jeko-pay] Erreur interne:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error', message: 'unknown' }, { status: 500 });
  }
}
