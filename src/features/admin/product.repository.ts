/**
 * product.repository.ts (admin)
 */
import { eq, asc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { products } from '@/shared/db/schema';
import type { Product } from '@/shared/types/domain.type';
import { rowToProduct } from '@/features/catalog/catalog.mapper';

export async function fetchProducts(): Promise<Product[] | null> {
  try {
    const data = await db.select().from(products).orderBy(asc(products.category));
    return data.map(rowToProduct);
  } catch {
    return null;
  }
}
