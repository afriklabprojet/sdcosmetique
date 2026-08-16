/**
 * orders-db.ts — Fonctions Supabase pour la gestion des commandes.
 * Utilise le browser client → peut être appelé depuis des Client Components.
 *
 * La DB est la seule source de verite de l'historique : plus aucun repli sur
 * `localStorage`, qui ressuscitait des commandes jamais payees (PAY-05).
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

// [PAY-06] `saveOrder` et `fetchAllOrders` ont ete supprimes ici.
// `saveOrder` etait un vestige du double-save client remplace par
// POST /api/orders/create (ARCH-01/02) et portait encore la regle fautive
// « commande creee = commande payee » ; `fetchAllOrders` n'avait plus
// d'appelant, l'admin passant par GET /api/admin/orders. Les garder revenait
// a laisser deux copies divergentes de la logique de paiement.

// ─── Commandes d'un utilisateur (compte) ─────────────────────────────────────
/**
 * Historique des commandes du client.
 *
 * [PAY-05] Ne renvoie QUE les commandes reellement payees (`payment_status =
 * 'paid'`), le paiement etant la seule source de verite. Une commande creee
 * puis abandonnee, echouee ou annulee au moment de payer n'a jamais sa place
 * dans un historique.
 *
 * Le repli sur `localStorage` a ete supprime : il republiait des commandes
 * mises en cache par le checkout AVANT la redirection vers Jeko, donc jamais
 * payees — elles reapparaissaient indefiniment dans « mes commandes ». En cas
 * d'erreur reseau, mieux vaut un historique vide qu'un historique faux.
 */
export async function fetchUserOrders(userId: string): Promise<OrderDraft[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });
    if (error || !data?.length) return [];
    return (data as OrderRow[]).map(rowToOrder);
  } catch {
    return [];
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
