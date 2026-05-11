import { NextResponse } from 'next/server';
import type { OrderDraft } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/emails';
import { sendWaOrderConfirmation } from '@/lib/whatsapp';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/orders/notify
 * Body: OrderDraft
 * No-op si RESEND_API_KEY est absent.
 */
export async function POST(req: Request) {
  const userClient = await db();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let order: OrderDraft;
  try {
    order = (await req.json()) as OrderDraft;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!order?.orderNumber || !order?.delivery?.email) {
    return NextResponse.json({ error: 'invalid_order' }, { status: 400 });
  }
  // Fire and forget — on ne fait pas attendre le client en cas de panne.
  // [PERF-02] Log les erreurs pour détecter les pannes silencieuses Resend/WhatsApp.
  sendOrderConfirmation(order).catch((err) =>
    console.error('[notify] sendOrderConfirmation error', order.orderNumber, err)
  );
  // WhatsApp en parallèle si le client a un numéro
  if (order.delivery.phone) {
    sendWaOrderConfirmation(order).catch((err) =>
      console.error('[notify] sendWaOrderConfirmation error', order.orderNumber, err)
    );
  }
  return NextResponse.json({ ok: true });
}
