'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SiteConfig } from '@/lib/site-config';
import type { Product } from '@/types';

// ⚠️ Ne PAS importer depuis @/utils/supabase/service ici :
// ce fichier a `import 'server-only'` qui déclenche un bug Turbopack dev-mode
// (module factory not available) quand une Server Action est importée depuis un Client Component.
// Le service role key n'est jamais exposé côté client (variable non NEXT_PUBLIC_).
let _serviceClient: SupabaseClient | null = null;
function getServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('[actions] SUPABASE env vars manquantes');
  _serviceClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _serviceClient;
}

/**
 * Sauvegarde une section de site_config côté serveur.
 * - Vérifie que l'appelant est admin (auth serveur).
 * - Utilise le service role pour bypasser les RLS.
 */
export async function saveSiteConfigSection(
  key: keyof SiteConfig,
  value: SiteConfig[typeof key],
): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);

  // Invalide immédiatement le cache Next.js
  revalidateTag('site-config');
  revalidatePath('/', 'layout');
  revalidatePath('/produit/[slug]', 'layout');
  revalidatePath('/teint/[slug]', 'layout');
  revalidatePath('/boutique', 'layout');
}

// ─── Produits ────────────────────────────────────────────────────────────────

export async function addProduct(product: Product): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const supabase = getServiceClient();
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    original_price: product.originalPrice ?? null,
    images: product.images.filter((url) => url.trim() !== ''),

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
  }, { onConflict: 'id' });

  if (error) throw new Error(error.message);

  revalidatePath('/boutique');
  revalidatePath('/');
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id'>>,
): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const d = buildUpdatePayload(updates);
  const supabase = getServiceClient();
  const { error } = await supabase.from('products').update(d).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/boutique');
  revalidatePath('/');
  revalidatePath(`/produit/${updates.slug ?? id}`);
}

function buildUpdatePayload(u: Partial<Omit<Product, 'id'>>): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  const map: Array<[keyof typeof u, string]> = [
    ['name', 'name'],
    ['slug', 'slug'],
    ['category', 'category'],
    ['price', 'price'],
    ['images', 'images'],  // sera filtré ci-dessous
    ['skinTones', 'skin_tones'],
    ['badges', 'badges'],
    ['shortDescription', 'short_description'],
    ['description', 'description'],
    ['benefits', 'benefits'],
    ['usage', 'usage'],
    ['inStock', 'in_stock'],
    ['isNew', 'is_new'],
    ['isBestseller', 'is_bestseller'],
  ];
  for (const [jsKey, dbKey] of map) {
    if (jsKey in u) {
      const val = u[jsKey];
      // Filtrer les chaînes vides des tableaux d'images
      d[dbKey] = Array.isArray(val) && dbKey === 'images'
        ? (val as string[]).filter((s) => s.trim() !== '')
        : val;
    }
  }
  // nullable fields (must use 'in' to allow null)
  if ('originalPrice' in u)       d.original_price    = u.originalPrice ?? null;
  if ('ingredients' in u)         d.ingredients       = u.ingredients ?? null;
  if ('stockQty' in u)            d.stock_qty         = u.stockQty ?? null;
  if ('lowStockThreshold' in u)   d.low_stock_threshold = u.lowStockThreshold ?? null;
  return d;
}

export async function deleteProduct(id: string): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const supabase = getServiceClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/boutique');
  revalidatePath('/');
}
