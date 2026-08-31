/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapCart, type MappedCart } from '@/shared/api/mappers/cart';
import type { LaravelCart } from '@/shared/api/types';

export namespace Coupon {
  export async function apply(code: string): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>('/cart-coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return mapCart(unwrapData(body));
  }

  export async function remove(): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>('/cart-coupon/current', {
      method: 'DELETE',
    });
    return mapCart(unwrapData(body));
  }
}
