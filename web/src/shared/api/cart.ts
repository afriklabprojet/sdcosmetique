import { api, unwrapData } from '@/shared/api/client';
import { mapCart, type MappedCart } from '@/shared/api/mappers/cart';
import type { LaravelCart } from '@/shared/api/types';

async function cartResponse(body: { data: LaravelCart } | LaravelCart): Promise<MappedCart> {
  return mapCart(unwrapData(body));
}

export async function fetchCart(): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>('/cart');
  return cartResponse(body);
}

export async function addCartItem(slug: string, quantity = 1): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>('/cart-items', {
    method: 'POST',
    body: JSON.stringify({ product: slug, quantity }),
  });
  return cartResponse(body);
}

export async function updateCartItem(lineId: number, quantity: number): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>(`/cart-items/${lineId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
  return cartResponse(body);
}

export async function removeCartItem(lineId: number): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>(`/cart-items/${lineId}`, {
    method: 'DELETE',
  });
  return cartResponse(body);
}

export async function applyCartCoupon(code: string): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>('/cart-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return cartResponse(body);
}

export async function removeCartCoupon(): Promise<MappedCart> {
  const body = await api<{ data: LaravelCart }>('/cart-coupon/current', {
    method: 'DELETE',
  });
  return cartResponse(body);
}
