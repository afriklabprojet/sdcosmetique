/**
 * Server-component catalog reads. Products and related items come from Laravel.
 * Reviews stay on Drizzle until M6.
 */
import { unstable_cache } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { reviews } from '@/shared/db/schema';
import { Product, Category, Review } from '@/shared/types/domain.type';
import { listProducts, showProduct } from '@/shared/api/catalog';
import { rowToReview } from '@/features/catalog/catalog.mapper';

export const fetchProducts = unstable_cache(
  async (): Promise<Product[]> => listProducts({ perPage: 100 }),
  ['products-all'],
  { revalidate: 60, tags: ['products'] },
);

export const fetchProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const result = await showProduct(slug);
    return result?.product ?? null;
  },
  ['products-by-slug'],
  { revalidate: 60, tags: ['products'] },
);

export const fetchProductsByCategory = unstable_cache(
  async (category: string): Promise<Product[]> => listProducts({ category, perPage: 100 }),
  ['products-by-category'],
  { revalidate: 60, tags: ['products'] },
);

export const fetchBestsellerProducts = unstable_cache(
  async (limit = 5): Promise<Product[]> => {
    const products = await listProducts({ featured: true, perPage: 100 });
    return products.slice(0, limit);
  },
  ['products-bestsellers'],
  { revalidate: 60, tags: ['products'] },
);

export const fetchRelatedProducts = unstable_cache(
  async (productId: string, category: Category, limit = 4): Promise<Product[]> => {
    const shown = await showProduct(productId);
    if (shown?.related.length) return shown.related.slice(0, limit);
    const products = await listProducts({ category, perPage: 100 });
    return products.filter((item) => item.id !== productId && item.slug !== productId).slice(0, limit);
  },
  ['products-related'],
  { revalidate: 60, tags: ['products'] },
);

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
