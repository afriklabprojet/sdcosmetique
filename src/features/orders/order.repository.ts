'use server';

/**
 * order.repository.ts — Acces commandes avec Drizzle ORM.
 */
import { eq, desc, and } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders, orderItems } from '@/shared/db/schema';
import type { OrderDraft } from '@/features/orders/order.store';
import type { Product } from '@/shared/types/domain.type';

export async function fetchUserOrders(userId: string): Promise<OrderDraft[]> {
  try {
    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.paymentStatus, 'paid')))
      .orderBy(desc(orders.createdAt));

    if (!orderRows.length) return [];

    const results: OrderDraft[] = [];

    for (const row of orderRows) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, row.id));

      results.push({
        orderNumber: row.orderNumber,
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
        items: items.map(i => ({
          product: {
            id: i.productId,
            slug: i.productSlug ?? '',
            name: i.name,
            price: Number(i.price),
            images: i.imageUrl ? [i.imageUrl] : [],
            category: 'face' as const,
            skinTones: [], badges: [], rating: 0, reviewCount: 0,
            shortDescription: '', description: '', benefits: [], usage: '',
            inStock: true, newArrival: false, bestseller: false,
          } as Product,
          quantity: i.quantity,
        })),
      });
    }

    return results;
  } catch (err) {
    console.error('[order.repository] fetchUserOrders error:', err);
    return [];
  }
}

export async function updateOrderStatus(orderNumber: string, status: OrderDraft['status']): Promise<void> {
  try {
    await db.update(orders).set({ status }).where(eq(orders.orderNumber, orderNumber));
  } catch (e) {
    console.error('[order.repository] updateOrderStatus error:', e);
  }
}
