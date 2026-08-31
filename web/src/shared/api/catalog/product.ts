/* eslint-disable @typescript-eslint/no-namespace */
import { ApiError, api, type Paginated } from '@/shared/api/client';
import { mapStorefrontProduct } from '@/shared/api/mappers/product';
import type { LaravelStorefrontProduct } from '@/shared/api/types';
import type { Product as ProductType } from '@/shared/types/domain.type';

function relatedList(related: LaravelStorefrontProduct[] | { data: LaravelStorefrontProduct[] } | undefined): LaravelStorefrontProduct[] {
  if (!related) return [];
  return Array.isArray(related) ? related : related.data;
}

export namespace Product {
  export async function list(options?: {
    category?: string;
    featured?: boolean;
    perPage?: number;
  }): Promise<ProductType[]> {
    try {
      const query = new URLSearchParams();
      if (options?.category) query.set('category', options.category);
      if (options?.featured) query.set('featured', '1');
      query.set('perPage', String(options?.perPage ?? 100));
      const body = await api<Paginated<LaravelStorefrontProduct>>(`/products?${query}`);
      return body.data.map(mapStorefrontProduct);
    } catch {
      return [];
    }
  }

  export async function find(slug: string): Promise<{ product: ProductType; related: ProductType[] } | null> {
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
}
