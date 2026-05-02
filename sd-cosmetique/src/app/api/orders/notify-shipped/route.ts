import { NextResponse } from 'next/server';
import type { OrderDraft } from '@/lib/orders';
import { sendOrderShipped } from '@/lib/emails';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/orders/notify-shipped
 * Body: { order: OrderDraft, trackingUrl?: string }
 */
export async function POST(req: Request) {
  const userClient = await db();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: { order: OrderDraft; trackingUrl?: string };
  try {
    body = (await req.json()) as { order: OrderDraft; trackingUrl?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const { order, trackingUrl } = body ?? {};
  if (!order?.orderNumber || !order?.delivery?.email) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }
  sendOrderShipped(order, trackingUrl).catch(e => console.error('[notify-shipped] email error:', e));
  return NextResponse.json({ ok: true });
}
