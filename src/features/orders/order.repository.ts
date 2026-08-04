/**
 * orders-db.ts — Fonctions Supabase pour la gestion des commandes.
 * Utilise le browser client → peut être appelé depuis des Client Components.
 * Fallback automatique sur localStorage si la DB est indisponible.
 *
 * Schéma DB :
 *   orders       — colonnes delivery_* plates + colonnes de totaux
 *   order_items  — 1 ligne par produit (FK → orders.id)
 *
 * Les ecritures produit et les avis sont partis d'ici (F-087, F-117) :
 * `@/features/admin/product.repository` et `@/features/catalog/review.repository`.
 */
import { createClient } from '@/shared/supabase/browser.client';
import type { OrderDraft } from '@/features/orders/order.store';
import { cacheOrder, getOrders } from '@/features/orders/order.store';
import type { Product } from '@/shared/types/domain.type';

// ─── Type intermédiaire pour les rows Supabase ────────────────────────────────
type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  status: string;
  delivery_first_name: string;
  delivery_last_name: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_country: string;
  order_items?: Array<{
    product_id: string;
    product_slug: string | null;
    name: string;
    price: number;
    quantity: number;
    image_url: string | null;
    shade: string | null;
  }>;
};

// ─── Convertisseur row → OrderDraft ──────────────────────────────────────────
function rowToOrder(row: OrderRow): OrderDraft {
  return {
    orderNumber: row.order_number,
    date: row.created_at,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    paymentMethod: row.payment_method ?? '',
    status: (row.status as OrderDraft['status']) ?? 'pending_payment',
    delivery: {
      firstName: row.delivery_first_name ?? '',
      lastName: row.delivery_last_name ?? '',
      email: row.delivery_email ?? '',
      phone: row.delivery_phone ?? '',
      address: row.delivery_address ?? '',
      city: row.delivery_city ?? '',
      country: row.delivery_country ?? '',
    },
    items: (row.order_items ?? []).map(i => ({
      product: {
        id: i.product_id,
        slug: i.product_slug ?? '',
        name: i.name,
        price: Number(i.price),
        images: i.image_url ? [i.image_url] : [],
        category: 'face' as const,
        skinTones: [], badges: [], rating: 0, reviewCount: 0,
        shortDescription: '', description: '', benefits: [], usage: '',
        inStock: true, newArrival: false, bestseller: false,
      } as Product,
      quantity: i.quantity,
    })),
  };
}

// ─── Sauvegarder une commande (DB + localStorage) ─────────────────────────────
export async function saveOrder(order: OrderDraft, userId?: string | null): Promise<void> {
  // Toujours sauvegarder en localStorage (fallback)
  cacheOrder(order);
  try {
    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from('orders')
      .insert({
        order_number:        order.orderNumber,
        user_id:             userId ?? null,
        subtotal:            order.subtotal,
        shipping_cost:       order.shippingCost,
        total:               order.total,
        payment_method:      order.paymentMethod,
        // 'pending_payment' n'est pas un statut DB valide → mapper sur confirmed + payment_status
        status:              (order.status === 'pending_payment') ? 'confirmed' : (order.status ?? 'confirmed'),
        payment_status:      (order.status === 'pending_payment') ? 'pending' : 'paid',
        delivery_first_name: order.delivery?.firstName ?? '',
        delivery_last_name:  order.delivery?.lastName ?? '',
        delivery_email:      order.delivery?.email ?? '',
        delivery_phone:      order.delivery?.phone ?? '',
        delivery_address:    order.delivery?.address ?? '',
        delivery_city:       order.delivery?.city ?? '',
        delivery_country:    order.delivery?.country ?? '',
      })
      .select('id')
      .single();

    if (error || !inserted) {
      
      return;
    }

    // Insérer les lignes d'articles
    if (order.items?.length) {
      const items = order.items.map(item => ({
        order_id:     inserted.id,
        product_id:   item.product.id,
        product_slug: item.product.slug,
        name:         item.product.name,
        price:        item.product.price,
        quantity:     item.quantity,
        image_url:    item.product.images[0] ?? null,
        shade:        null,
      }));
      await supabase.from('order_items').insert(items);
    }
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Toutes les commandes (admin) ─────────────────────────────────────────────
export async function fetchAllOrders(): Promise<OrderDraft[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error || !data?.length) return getOrders();
    return (data as OrderRow[]).map(rowToOrder);
  } catch {
    return getOrders();
  }
}

// ─── Commandes d'un utilisateur (compte) ─────────────────────────────────────
export async function fetchUserOrders(userId: string): Promise<OrderDraft[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data?.length) return getOrders();
    return (data as OrderRow[]).map(rowToOrder);
  } catch {
    return getOrders();
  }
}

// ─── Mettre à jour le statut d'une commande ───────────────────────────────────
export async function updateOrderStatus(orderNumber: string, status: OrderDraft['status']): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({ status })
      .eq('order_number', orderNumber);
  } catch (e) {
    console.error('orders-db:', e);
  }
}
