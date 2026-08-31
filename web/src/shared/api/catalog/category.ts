/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapStorefrontCategory } from '@/shared/api/mappers/category';
import type { LaravelStorefrontCategory } from '@/shared/api/types';
import type { CategoryRow } from '@/features/catalog/category.repository';

export namespace Category {
  export async function list(): Promise<CategoryRow[]> {
    try {
      const body = await api<{ data: LaravelStorefrontCategory[] }>('/categories');
      return unwrapData(body).map(mapStorefrontCategory);
    } catch {
      return [];
    }
  }
}
