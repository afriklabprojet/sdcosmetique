/**
 * product.repository.ts — Fonctions asynchrones pour Server Components uniquement.
 * Utilise Drizzle ORM avec MariaDB + unstable_cache pour ISR.
 */
import { unstable_cache } from 'next/cache';
import { eq, desc, ne, and } from 'drizzle-orm';
import { db } from '@/shared/db';
import { products, reviews } from '@/shared/db/schema';
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
      const data = await db.select().from(products).orderBy(products.createdAt);
      if (!data?.length) return PRODUCTS;
      return data.map(rowToProduct);
    } catch (err) {
      console.warn('[product.repository] Falling back to default products:', err);
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
      const data = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      if (!data?.length) return getProductBySlug(slug) ?? null;
      return rowToProduct(data[0]);
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
      const data = await db
        .select()
        .from(products)
        .where(eq(products.category, category as Category))
        .orderBy(desc(products.isBestseller));
      if (!data?.length) return getProductsByCategory(category as Category);
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
      const data = await db
        .select()
        .from(products)
        .where(eq(products.isBestseller, true))
        .limit(limit);
      if (!data?.length) return getBestsellers().slice(0, limit);
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
      const data = await db
        .select()
        .from(products)
        .where(and(eq(products.category, category), ne(products.id, productId)))
        .limit(limit);
      if (!data?.length) {
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
export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const data = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    if (!data?.length) return [];
    return data.map(rowToReview);
  } catch {
    return [];
  }
}
