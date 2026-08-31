/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapCart, type MappedCart } from '@/shared/api/mappers/cart';
import type { LaravelCart } from '@/shared/api/types';
import { Item as CartItemNamespace } from './item';
import { Coupon as CartCouponNamespace } from './coupon';

export namespace Cart {
  export async function read(): Promise<MappedCart> {
    const body = await api<{ data: LaravelCart }>('/cart');
    return mapCart(unwrapData(body));
  }

  export import Item = CartItemNamespace;
  export import Coupon = CartCouponNamespace;
}
