/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapCart, type MappedCart } from '@/shared/api/mappers/cart';
import type { LaravelCart } from '@/shared/api/types';

export namespace Item {
  export async function add(slug: string, quantity = 1): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>('/cart-items', {
      method: 'POST',
      body: JSON.stringify({ product: slug, quantity }),
    });
    return mapCart(unwrapData(body));
  }

  export async function update(id: number, quantity: number): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>(`/cart-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return mapCart(unwrapData(body));
  }

  export async function remove(id: number): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>(`/cart-items/${id}`, {
      method: 'DELETE',
    });
    return mapCart(unwrapData(body));
  }
}
