/**
 * Envoi des notifications de confirmation de commande (email + WhatsApp)
 * à partir du numéro de commande avec Drizzle ORM.
 */
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders, orderItems } from '@/shared/db/schema';
import { sendOrderConfirmation, sendOrderShipped } from '@/shared/notifications/email.service';
import { sendWaOrderConfirmation, sendWaOrderShipped } from '@/shared/notifications/whatsapp.service';
import type { OrderDraft } from '@/features/orders/order.store';
import type { CartItem } from '@/shared/types/domain.type';

/** Recharge une commande depuis DB et la reconstruit en `OrderDraft`. */
async function loadOrderByNumber(orderNumber: string): Promise<OrderDraft | null> {
  const rowList = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!rowList.length) {
    console.error('[order-notifications] Commande introuvable', orderNumber);
    return null;
  }

  const row = rowList[0];

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, row.id));

  const items: CartItem[] = itemRows.map(r => ({
    quantity: r.quantity,
    product: {
      id: r.productId,
      slug: r.productSlug ?? '',
      name: r.name,
      price: Number(r.price),
      images: r.imageUrl ? [r.imageUrl] : [],
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
  }));

  return {
    orderNumber: row.orderNumber,
    date: row.createdAt.toISOString(),
    items,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shippingCost),
    total: Number(row.total),
    delivery: {
      firstName: row.deliveryFirstName ?? '',
      lastName: row.deliveryLastName ?? '',
      email: row.deliveryEmail ?? '',
      phone: row.deliveryPhone ?? '',
      address: row.deliveryAddress ?? '',
      city: row.deliveryCity ?? '',
      country: row.deliveryCountry ?? '',
    },
    paymentMethod: row.paymentMethod ?? '',
    status: (row.status as OrderDraft['status']) ?? 'confirmed',
  };
}

export async function sendOrderConfirmationByNumber(orderNumber: string): Promise<void> {
  try {
    const order = await loadOrderByNumber(orderNumber);
    if (!order) return;

    if (!order.delivery.email) {
      console.error('[order-notifications] Aucun email pour la commande', orderNumber);
      return;
    }

    await sendOrderConfirmation(order).catch(err =>
      console.error('[order-notifications] sendOrderConfirmation error', orderNumber, err),
    );

    if (order.delivery.phone) {
      await sendWaOrderConfirmation(order).catch(err =>
        console.error('[order-notifications] sendWaOrderConfirmation error', orderNumber, err),
      );
    }
  } catch (e) {
    console.error('[order-notifications] Erreur inattendue', orderNumber, e);
  }
}

export async function sendOrderShippedByNumber(orderNumber: string, trackingUrl?: string): Promise<void> {
  try {
    const order = await loadOrderByNumber(orderNumber);
    if (!order) return;

    if (!order.delivery.email) {
      console.error('[order-notifications] Aucun email pour la commande', orderNumber);
      return;
    }

    await sendOrderShipped(order, trackingUrl).catch(err =>
      console.error('[order-notifications] sendOrderShipped error', orderNumber, err),
    );

    if (order.delivery.phone) {
      await sendWaOrderShipped(order, trackingUrl).catch(err =>
        console.error('[order-notifications] sendWaOrderShipped error', orderNumber, err),
      );
    }
  } catch (e) {
    console.error('[order-notifications] Erreur inattendue', orderNumber, e);
  }
}
