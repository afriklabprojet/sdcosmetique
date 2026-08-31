/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapAdminCategory, toAdminCategoryPayload } from '@/shared/api/mappers/category';
import type { LaravelAdminCategory } from '@/shared/api/types';
import type { CategoryRow } from '@/features/catalog/category.repository';

export namespace Category {
  export async function list(): Promise<CategoryRow[]> {
    const body = await api<{ data: LaravelAdminCategory[] }>('/admin/categories');
    return unwrapData(body).map(mapAdminCategory);
  }

  export async function save(row: CategoryRow, fresh: boolean): Promise<void> {
    const payload = toAdminCategoryPayload(row);
    if (fresh) {
      await api('/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
      return;
    }
    await api(`/admin/categories/${row.id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/categories/${id}`, { method: 'DELETE' });
  }
}
