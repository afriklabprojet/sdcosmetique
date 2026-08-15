/**
 * products-server.ts — Fonctions asynchrones pour Server Components uniquement.
 * Ne jamais importer dans un Client Component ('use client').
 *
 * [PERF-M1] Ces lectures utilisent le client service-role (pas de cookies())
 * + `unstable_cache`, pour que les pages produits/boutique restent statiques
 * (ISR) au lieu d'être forcées en dynamique par un appel à cookies() côté
 * SSR. Invalidé via revalidateTag('products') dans admin/actions.ts et
 * api/admin/products/route.ts à chaque écriture.
 */
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/shared/supabase/service.client';
import { Product, Category, Review } from '@/shared/types/domain.type';
import {
  PRODUCTS,
  getBestsellers,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
} from '@/features/catalog/product.query';
import { rowToProduct, rowToReview } from '@/features/catalog/catalog.mapper';

// ─── Fetch all products ───────────────────────────────────────────────────────
export const fetchProducts = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at');
      if (error || !data?.length) return PRODUCTS;
      return data.map(rowToProduct);
    } catch {
      return PRODUCTS;
    }
  },
  ['products-all'],
  { revalidate: 60, tags: ['products'] },
);

// ─── Fetch by slug ────────────────────────────────────────────────────────────
export const fetchProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error || !data) return getProductBySlug(slug) ?? null;
      return rowToProduct(data);
    } catch {
      return getProductBySlug(slug) ?? null;
    }
  },
  ['products-by-slug'],
  { revalidate: 60, tags: ['products'] },
);

// ─── Fetch by category ────────────────────────────────────────────────────────
export const fetchProductsByCategory = unstable_cache(
  async (category: string): Promise<Product[]> => {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('is_bestseller', { ascending: false });
      if (error || !data?.length) return getProductsByCategory(category as Category);
      return data.map(rowToProduct);
    } catch {
      return getProductsByCategory(category as Category);
    }
  },
  ['products-by-category'],
  { revalidate: 60, tags: ['products'] },
);

// ─── Fetch bestsellers ────────────────────────────────────────────────────────
export const fetchBestsellerProducts = unstable_cache(
  async (limit = 5): Promise<Product[]> => {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .limit(limit);
      if (error || !data?.length) return getBestsellers().slice(0, limit);
      return data.map(rowToProduct);
    } catch {
      return getBestsellers().slice(0, limit);
    }
  },
  ['products-bestsellers'],
  { revalidate: 60, tags: ['products'] },
);

// ─── Fetch related products ───────────────────────────────────────────────────
export const fetchRelatedProducts = unstable_cache(
  async (productId: string, category: Category, limit = 4): Promise<Product[]> => {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', productId)
        .limit(limit);
      if (error || !data?.length) {
        const p = getProductById(productId);
        return p ? getRelatedProducts(p, limit) : [];
      }
      return data.map(rowToProduct);
    } catch {
      const p = getProductById(productId);
      return p ? getRelatedProducts(p, limit) : [];
    }
  },
  ['products-related'],
  { revalidate: 60, tags: ['products'] },
);

// ─── Fetch reviews by product ─────────────────────────────────────────────────
// Non mis en cache : sujet à changer plus fréquemment (avis clients).
export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToReview);
  } catch {
    return [];
  }
}
