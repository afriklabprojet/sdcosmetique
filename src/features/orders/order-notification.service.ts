/**
 * Envoi des notifications de confirmation de commande (email + WhatsApp)
 * à partir du **numéro de commande uniquement**.
 *
 * La commande est rechargée depuis Supabase : aucun payload client n'est
 * jamais utilisé comme source de vérité (cf. l'ancien /api/orders/notify,
 * qui acceptait n'importe quel body non authentifié → relais d'email ouvert).
 */

import { createServiceClient } from '@/shared/supabase/service.client';
import { sendOrderConfirmation, sendOrderShipped } from '@/shared/notifications/email.service';
import { sendWaOrderConfirmation, sendWaOrderShipped } from '@/shared/notifications/whatsapp.service';
import type { OrderDraft } from '@/features/orders/order.store';
import type { CartItem } from '@/shared/types/domain.type';

interface OrderItemRow {
  product_id: string | null;
  product_slug: string | null;
  name: string | null;
  price: number | null;
  quantity: number | null;
  image_url: string | null;
}

/** Reconstruit les CartItem attendus par les templates (name / price / quantity). */
function toCartItems(rows: OrderItemRow[]): CartItem[] {
  return rows.map(r => ({
    quantity: r.quantity ?? 1,
    product: {
      id:    r.product_id ?? '',
      slug:  r.product_slug ?? '',
      name:  r.name ?? '',
      price: r.price ?? 0,
      images: r.image_url ? [r.image_url] : [],
    } as CartItem['product'],
  }));
}

/** Recharge une commande depuis Supabase et la reconstruit en `OrderDraft`. */
async function loadOrderByNumber(orderNumber: string): Promise<OrderDraft | null> {
  const supabase = createServiceClient();

  const { data: row, error } = await supabase
    .from('orders')
    .select('id, order_number, created_at, subtotal, shipping_cost, total, payment_method, status, delivery_first_name, delivery_last_name, delivery_email, delivery_phone, delivery_address, delivery_city, delivery_country')
    .eq('order_number', orderNumber)
    .single();

  if (error || !row) {
    console.error('[order-notifications] Commande introuvable', orderNumber, error?.message);
    return null;
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, product_slug, name, price, quantity, image_url')
    .eq('order_id', row.id);

  if (itemsError) {
    console.error('[order-notifications] Échec lecture order_items', orderNumber, itemsError.message);
  }

  return {
    orderNumber:  row.order_number,
    date:         row.created_at ?? new Date().toISOString(),
    items:        toCartItems((itemRows ?? []) as OrderItemRow[]),
    subtotal:     row.subtotal ?? 0,
    shippingCost: row.shipping_cost ?? 0,
    total:        row.total ?? 0,
    delivery: {
      firstName: row.delivery_first_name ?? '',
      lastName:  row.delivery_last_name ?? '',
      email:     row.delivery_email ?? '',
      phone:     row.delivery_phone ?? '',
      address:   row.delivery_address ?? '',
      city:      row.delivery_city ?? '',
      country:   row.delivery_country ?? '',
    },
    paymentMethod: row.payment_method ?? '',
    status:        'confirmed',
  };
}

/**
 * Envoie l'email (+ WhatsApp) de confirmation pour `orderNumber`.
 * Ne throw jamais : les erreurs sont loggées et avalées, pour ne pas faire
 * échouer l'appelant (webhook Jeko notamment, qui doit répondre 2xx < 5s).
 */
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

/**
 * Envoie l'email (+ WhatsApp) d'expédition pour `orderNumber`.
 * Recharge la commande (et son adresse email) depuis la DB — jamais du body
 * client, qui pourrait sinon pointer vers une adresse arbitraire.
 */
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
