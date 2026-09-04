/*
 * Catalogue fetchers go to Laravel. formatPrice stays here so account and
 * admin tabs can import it without pulling fetchers.
 */
import { Product as StorefrontProductApi } from '@/shared/api/catalog';
import { Product, SkinTone } from '@/shared/types/domain.type';

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

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
