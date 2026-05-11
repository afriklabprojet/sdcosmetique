import { NextRequest, NextResponse } from 'next/server';
import {
  createRedirectPayment,
  PAYMENT_METHOD_TO_JEKO,
  JekoPayError,
  type JekoPayProvider,
} from '@/lib/jeko-pay/client';
import { rateLimit, getIp, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';

interface CheckoutBody {
  orderNumber: string;        // notre référence interne (ex: "SDC-2024-0001")
  amountXof: number;          // montant en XOF (entier)
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

  if (!body.orderNumber || !body.amountXof || body.amountXof <= 0 || !body.paymentMethod) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const provider = resolveProvider(body.paymentMethod);
  if (!provider) {
    return NextResponse.json(
      { error: 'unsupported_payment_method', method: body.paymentMethod },
      { status: 400 },
    );
  }

  const base = siteUrl();
  const ref = encodeURIComponent(body.orderNumber);

  try {
    const payment = await createRedirectPayment({
      amountCents:         body.amountXof * 100,
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
        amountXof: body.amountXof,
        orderNumber: body.orderNumber,
      });
      return NextResponse.json(
        { error: 'jeko_error', status: e.status, body: e.body },
        { status: e.status >= 500 ? 502 : e.status },
      );
    }
    
    console.error('[jeko-pay] Erreur interne:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error', message: e instanceof Error ? e.message : 'unknown' }, { status: 500 });
  }
}
