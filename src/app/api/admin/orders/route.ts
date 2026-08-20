import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders, orderItems } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';
import type { OrderDraft } from '@/features/orders/order.store';

const VALID_STATUS: ReadonlySet<string> = new Set([
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  try {
    const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allItems = await db.select().from(orderItems);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const it of allItems) {
      const list = itemsByOrder.get(it.orderId) ?? [];
      list.push(it);
      itemsByOrder.set(it.orderId, list);
    }

    const results: OrderDraft[] = orderRows.map((row) => ({
      orderNumber: row.orderNumber,
      paymentStatus: (row.paymentStatus as OrderDraft['paymentStatus']) ?? 'pending',
      date: row.createdAt.toISOString(),
      subtotal: Number(row.subtotal),
      shippingCost: Number(row.shippingCost),
      total: Number(row.total),
      paymentMethod: row.paymentMethod ?? '',
      status: (row.status as OrderDraft['status']) ?? 'pending_payment',
      delivery: {
        firstName: row.deliveryFirstName ?? '',
        lastName: row.deliveryLastName ?? '',
        email: row.deliveryEmail ?? '',
        phone: row.deliveryPhone ?? '',
        address: row.deliveryAddress ?? '',
        city: row.deliveryCity ?? '',
        country: row.deliveryCountry ?? '',
      },
      items: (itemsByOrder.get(row.id) ?? []).map((i) => ({
        product: {
          id: i.productId,
          slug: i.productSlug ?? '',
          name: i.name,
          price: Number(i.price),
          images: i.imageUrl ? [i.imageUrl] : [],
          category: 'face',
          skinTones: [],
          badges: [],
          rating: 0,
          reviewCount: 0,
          shortDescription: '',
          description: '',
          benefits: [],
          usage: '',
          inStock: true,
          newArrival: false,
          bestseller: false,
        },
        quantity: i.quantity,
      })),
    }));

    return NextResponse.json({ orders: results });
  } catch (err) {
    console.error('[admin/orders GET] db error:', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const body = await req.json();
  const orderNumber = String(body?.orderNumber ?? '').trim();
  const status = String(body?.status ?? '').trim();
  const paymentStatus = String(body?.paymentStatus ?? '').trim();

  if (!orderNumber) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  if (status && !VALID_STATUS.has(status)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  if (paymentStatus && !['paid', 'failed'].includes(paymentStatus)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }
  if (!status && !paymentStatus) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      updateData.paymentPaidAt = paymentStatus === 'paid' ? new Date() : null;
      if (paymentStatus === 'paid' && !status) {
        updateData.status = 'confirmed';
      }
    }

    await db.update(orders).set(updateData).where(eq(orders.orderNumber, orderNumber));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/orders PATCH] db error:', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}
