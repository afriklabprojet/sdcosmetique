import { NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/auth/admin.guard';
import { sendOrderShippedByNumber } from '@/features/orders/order-notification.service';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

/**
 * POST /api/orders/notify-shipped
 * Body: { orderNumber: string, trackingUrl?: string }
 *
 * [SEC] Réservé aux admins. La commande (email, téléphone, articles) est
 * rechargée depuis la DB par numéro — jamais depuis le body client, qui
 * pourrait sinon contenir une adresse arbitraire (relais d'email/WhatsApp).
 */
export async function POST(req: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(`notify-shipped:${getIp(req)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: { orderNumber?: string; trackingUrl?: string };
  try {
    body = (await req.json()) as { orderNumber?: string; trackingUrl?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { orderNumber, trackingUrl } = body ?? {};
  if (!orderNumber) {
    return NextResponse.json({ error: 'missing_orderNumber' }, { status: 400 });
  }

  sendOrderShippedByNumber(orderNumber, trackingUrl).catch(err =>
    console.error('[notify-shipped] error', orderNumber, err)
  );

  return NextResponse.json({ ok: true });
}
