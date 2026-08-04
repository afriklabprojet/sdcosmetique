/**
 * Ecritures Supabase sur le catalogue, cote admin.
 * Utilise le browser client → appelable depuis des Client Components.
 *
 * Ces fonctions vivaient dans `order.repository.ts` (F-087) : leur corps mute
 * `Product`, jamais `Order`. Elles ne rejoignent pas
 * `catalog/product.repository.ts`, qui est server-only (`unstable_cache` +
 * client service-role) : ce sont des ecritures declenchees par l'admin depuis
 * le navigateur, l'admin en est le proprietaire.
 *
 * ATTENTION : aucun consommateur a ce jour — la console admin passe par les
 * routes `/api/admin/products`. Le code est place ici pour que la question de
 * sa suppression se pose au bon endroit en vague `drift`, pas ailleurs.
 */
import { createClient } from '@/shared/supabase/browser.client';
import type { Product } from '@/shared/types/domain.type';

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
