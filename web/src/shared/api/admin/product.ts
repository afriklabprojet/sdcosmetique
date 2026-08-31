/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapAdminProduct, toAdminProductPayload } from '@/shared/api/mappers/product';
import type { LaravelAdminProduct } from '@/shared/api/types';
import type { Product as DomainProduct } from '@/shared/types/domain.type';

export namespace Product {
  export async function list(): Promise<DomainProduct[]> {
    const body = await api<Paginated<LaravelAdminProduct>>('/admin/products?parents_only=1&perPage=100');
    return body.data.map(mapAdminProduct);
  }

  export async function save(item: DomainProduct, category: number, fresh: boolean): Promise<void> {
    const payload = toAdminProductPayload(item, category);
    if (fresh) {
      await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      return;
    }
    await api(`/admin/products/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/products/${id}`, { method: 'DELETE' });
  }
}
