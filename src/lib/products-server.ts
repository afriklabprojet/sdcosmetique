/**
 * products-server.ts — Fonctions asynchrones pour Server Components uniquement.
 * Ne jamais importer dans un Client Component ('use client').
 */
import { db } from '@/lib/db';
import { Product, Category, Review } from '@/types';
import { PRODUCTS, getRelatedProducts } from './products';
import { rowToProduct, rowToReview } from '@/lib/mappers';

// ─── Fetch all products ───────────────────────────────────────────────────────
export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at');
    if (error || !data?.length) return PRODUCTS;
    return data.map(rowToProduct);
  } catch {
    return PRODUCTS;
  }
}

// ─── Fetch by slug ────────────────────────────────────────────────────────────
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) return PRODUCTS.find(p => p.slug === slug) ?? null;
    return rowToProduct(data);
  } catch {
    return PRODUCTS.find(p => p.slug === slug) ?? null;
  }
}

// ─── Fetch by category ────────────────────────────────────────────────────────
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('is_bestseller', { ascending: false });
    if (error || !data?.length) return PRODUCTS.filter(p => p.category === category);
    return data.map(rowToProduct);
  } catch {
    return PRODUCTS.filter(p => p.category === category);
  }
}

// ─── Fetch bestsellers ────────────────────────────────────────────────────────
export async function fetchBestsellerProducts(limit = 5): Promise<Product[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_bestseller', true)
      .limit(limit);
    if (error || !data?.length) return PRODUCTS.filter(p => p.isBestseller).slice(0, limit);
    return data.map(rowToProduct);
  } catch {
    return PRODUCTS.filter(p => p.isBestseller).slice(0, limit);
  }
}

// ─── Fetch related products ───────────────────────────────────────────────────
export async function fetchRelatedProducts(productId: string, category: Category, limit = 4): Promise<Product[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', productId)
      .limit(limit);
    if (error || !data?.length) {
      const p = PRODUCTS.find(x => x.id === productId);
      return p ? getRelatedProducts(p, limit) : [];
    }
    return data.map(rowToProduct);
  } catch {
    const p = PRODUCTS.find(x => x.id === productId);
    return p ? getRelatedProducts(p, limit) : [];
  }
}

// ─── Fetch reviews by product ─────────────────────────────────────────────────
export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const supabase = await db();
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
