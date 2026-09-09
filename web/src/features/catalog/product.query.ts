/*
 * Catalogue fetchers go to Laravel.
 */
import { Product as StorefrontProductApi } from '@/shared/api/catalog';
import { Product, SkinTone } from '@/shared/types/domain.type';

/** Ré-exporté pour ne pas casser les imports existants — l'implémentation vit dans shared/format/price.ts (aucune dépendance, contrairement à ce fichier). */
export { formatPrice } from '@/shared/format/price';

export interface FetchProductsOptions {
  category?:    string;
  skinTone?:    SkinTone;
  bestsellers?: boolean;
  limit?:       number;
}

export async function fetchProducts(
  category?: string,
  options?: Omit<FetchProductsOptions, 'category'>
): Promise<Product[]> {
  let products = await StorefrontProductApi.list({
    category,
    bestseller: options?.bestsellers,
    perPage: options?.limit ?? 100,
  });
  if (options?.skinTone) {
    products = products.filter(p => p.skinTones.includes(options.skinTone!));
  }
  if (options?.limit != null) products = products.slice(0, options.limit);
  return products;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const result = await StorefrontProductApi.find(slug);
  return result?.product ?? null;
}
