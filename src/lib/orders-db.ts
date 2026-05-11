/**
 * orders-db.ts — Fonctions Supabase pour la gestion des commandes.
 * Utilise le browser client → peut être appelé depuis des Client Components.
 * Fallback automatique sur localStorage si la DB est indisponible.
 *
 * Schéma DB :
 *   orders       — colonnes delivery_* plates + colonnes de totaux
 *   order_items  — 1 ligne par produit (FK → orders.id)
 */
import { createClient } from '@/utils/supabase/client';
import type { OrderDraft } from './orders';
import { saveOrder, getOrders } from './orders';
import type { Product, Review, SkinTone } from '@/types';

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
        inStock: true, isNew: false, isBestseller: false,
      } as Product,
      quantity: i.quantity,
    })),
  };
}

// ─── Sauvegarder une commande (DB + localStorage) ─────────────────────────────
export async function saveOrderToDB(order: OrderDraft, userId?: string | null): Promise<void> {
  // Toujours sauvegarder en localStorage (fallback)
  saveOrder(order);
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
export async function fetchAllOrdersFromDB(): Promise<OrderDraft[]> {
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
export async function fetchUserOrdersFromDB(userId: string): Promise<OrderDraft[]> {
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
export async function updateOrderStatusInDB(orderNumber: string, status: OrderDraft['status']): Promise<void> {
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

// ─── Mettre à jour un produit (admin – tous les champs) ─────────────────────
function buildProductPayload(updates: Partial<Omit<Product, 'id'>>): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) d[k] = v; };

  set('name',              updates.name);
  set('slug',              updates.slug);
  set('category',          updates.category);
  set('price',             updates.price);
  set('images',            updates.images);
  set('skin_tones',        updates.skinTones);
  set('badges',            updates.badges);
  set('short_description', updates.shortDescription);
  set('description',       updates.description);
  set('benefits',          updates.benefits);
  set('usage',             updates.usage);
  set('in_stock',          updates.inStock);
  set('is_new',            updates.isNew);
  set('is_bestseller',     updates.isBestseller);

  if ('originalPrice' in updates)     d.original_price = updates.originalPrice ?? null;
  if ('ingredients' in updates)       d.ingredients = updates.ingredients ?? null;
  if ('stockQty' in updates)          d.stock_qty = updates.stockQty ?? null;
  if ('lowStockThreshold' in updates) d.low_stock_threshold = updates.lowStockThreshold ?? null;

  return d;
}

export async function updateProductInDB(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('products').update(buildProductPayload(updates)).eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Ajouter un produit ───────────────────────────────────────────────────────
export async function addProductToDB(product: Product): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('products').insert({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice ?? null,
      images: product.images,
      skin_tones: product.skinTones,
      badges: product.badges ?? [],
      rating: product.rating,
      review_count: product.reviewCount,
      short_description: product.shortDescription,
      description: product.description,
      benefits: product.benefits,
      usage: product.usage,
      ingredients: product.ingredients ?? null,
      in_stock: product.inStock,
      stock_qty: product.stockQty ?? null,
      low_stock_threshold: product.lowStockThreshold ?? null,
      is_new: product.isNew ?? false,
      is_bestseller: product.isBestseller ?? false,
    });
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Supprimer un produit ─────────────────────────────────────────────────────
export async function deleteProductFromDB(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Fetch tous les produits (admin, client-side) ─────────────────────────────
export async function fetchProductsFromDB() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category');
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── Fetch tous les avis (admin) ──────────────────────────────────────────────
export async function fetchAllReviewsFromDB(): Promise<(Review & { productId?: string })[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(row => ({
      id: String(row.id),
      author: String(row.author),
      rating: Number(row.rating),
      comment: String(row.comment ?? ''),
      date: String(row.created_at),
      skinTone: (row.skin_tone as SkinTone) ?? undefined,
      verified: Boolean(row.verified),
      productId: row.product_id ? String(row.product_id) : undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Supprimer un avis ────────────────────────────────────────────────────────
export async function deleteReviewFromDB(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}

// ─── Approuver / retirer un avis (toggle verified) ───────────────────────────
export async function approveReviewInDB(id: string, verified: boolean): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('reviews').update({ verified }).eq('id', id);
  } catch (e) {
    console.error('orders-db:', e);
  }
}
