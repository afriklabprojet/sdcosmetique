import { ApiError, api, unwrapData, type Paginated } from '@/shared/api/client';
import { mapStorefrontCategory } from '@/shared/api/mappers/category';
import { mapStorefrontProduct } from '@/shared/api/mappers/product';
import type { LaravelStorefrontCategory, LaravelStorefrontProduct } from '@/shared/api/types';
import type { CategoryRow } from '@/features/catalog/category.repository';
import type { Product } from '@/shared/types/domain.type';

function relatedList(related: LaravelStorefrontProduct[] | { data: LaravelStorefrontProduct[] } | undefined): LaravelStorefrontProduct[] {
  if (!related) return [];
  return Array.isArray(related) ? related : related.data;
}

export async function listProducts(params?: {
  category?: string;
  featured?: boolean;
  perPage?: number;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.featured) query.set('featured', '1');
    query.set('perPage', String(params?.perPage ?? 100));
    const body = await api<Paginated<LaravelStorefrontProduct>>(`/products?${query}`);
    return body.data.map(mapStorefrontProduct);
  } catch {
    return [];
  }
}

export async function showProduct(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const body = await api<{
      data: LaravelStorefrontProduct;
      related?: LaravelStorefrontProduct[] | { data: LaravelStorefrontProduct[] };
    }>(`/products/${encodeURIComponent(slug)}`);
    return {
      product: mapStorefrontProduct(body.data),
      related: relatedList(body.related).map(mapStorefrontProduct),
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}

export async function listCategories(): Promise<CategoryRow[]> {
  try {
    const body = await api<{ data: LaravelStorefrontCategory[] }>('/categories');
    return unwrapData(body).map(mapStorefrontCategory);
  } catch {
    return [];
  }
}
