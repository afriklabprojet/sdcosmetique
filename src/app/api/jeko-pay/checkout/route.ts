import { NextRequest, NextResponse } from 'next/server';
import {
  createRedirectPayment,
  PAYMENT_METHOD_TO_JEKO,
  JekoPayError,
  type JekoPayProvider,
} from '@/features/payment/jeko-pay.client';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';
import { createServiceClient } from '@/shared/supabase/service.client';

export const runtime = 'nodejs';

interface CheckoutBody {
  orderNumber: string;        // notre référence interne (ex: "SDC-2024-0001")
  paymentMethod: string;      // 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | provider direct
  payerPhone?: string;
  forceProviderDirect?: boolean;
}

function siteUrl(): string {
  // SITE_URL est lu au runtime (pas inliné au build) — priorité sur NEXT_PUBLIC_SITE_URL
  // qui lui est inliné au build-time et peut être figé à http://localhost:3000
  return process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/**
 * Normalise un numéro de téléphone ivoirien au format international +225XXXXXXXXXX
 * Exemples acceptés : "0700123456", "07 00 12 34 56", "225 07 00 12 34 56", "+22507...
 */
function normalizePhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Supprimer espaces, tirets, parenthèses
  const digits = raw.replaceAll(/[\s\-().]/g, '');
  if (!digits) return undefined;
  // Déjà au format international
  if (digits.startsWith('+')) return digits;
  // Format 225XXXXXXXXXX → +225XXXXXXXXXX
  if (digits.startsWith('225') && digits.length >= 11) return `+${digits}`;
  // Format local 0XXXXXXXXX (10 chiffres, commence par 0) → +2250XXXXXXXXX... non:
  // En CI les numéros locaux font 10 chiffres : 07 00 XX XX XX → +225 07 00 XX XX XX
  if (digits.startsWith('0') && digits.length === 10) return `+225${digits}`;
  // Si déjà 8 ou 9 chiffres sans indicatif → préfixer +225
  if (digits.length >= 8 && digits.length <= 9) return `+225${digits}`;
  return digits; // laisser passer et laisser Jeko valider
}

function resolveProvider(method: string): JekoPayProvider | null {
  // Accepte soit le code interne soit directement un provider Jeko
  if (method in PAYMENT_METHOD_TO_JEKO) return PAYMENT_METHOD_TO_JEKO[method];
  const direct = ['wave', 'orange', 'mtn', 'moov', 'djamo'] as const;
  return (direct as readonly string[]).includes(method) ? (method as JekoPayProvider) : null;
}

/**
 * POST /api/jeko-pay/checkout
 * Initie un paiement Jeko Africa et renvoie l'URL de redirection.
 */
export async function POST(req: NextRequest) {
  try {
    return await handleCheckout(req);
  } catch (e) {
    // Filet de sécurité : la route doit TOUJOURS répondre avec un body JSON,
    // jamais un 500 vide (que le client ne peut pas parser → « erreur réseau »).
    console.error('[jeko-pay] Erreur non gérée:', e instanceof Error ? e.message : e);
    // [SEC-M3] Ne jamais renvoyer le texte de l'exception au client (peut
    // contenir des détails internes) — le champ `message` reste présent
    // (générique) pour que le body JSON soit toujours parseable côté client.
    return NextResponse.json(
      { error: 'internal_error', message: 'unknown' },
      { status: 500 },
    );
  }
}

async function handleCheckout(req: NextRequest) {
  // 10 tentatives de paiement / 10 min par IP
  const rl = await rateLimit(`checkout:${getIp(req)}`, 10, 10 * 60 * 1000);
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

  // [SEC] Le montant à facturer vient TOUJOURS de la commande en DB (calculée
  // par /api/orders/create côté serveur), jamais du body client.
  const supabase = createServiceClient();
  const { data: ord, error: ordErr } = await supabase
    .from('orders')
    .select('total, payment_status')
    .eq('order_number', body.orderNumber)
    .single();

  if (ordErr || !ord) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 400 });
  }
  if (ord.payment_status === 'paid') {
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
