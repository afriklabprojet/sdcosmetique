/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapCoupon, toCouponPayload } from '@/shared/api/mappers/coupon';
import type { LaravelCoupon } from '@/shared/api/types';
import type { PromoCode } from '@/features/site-config/site-config.type';

export namespace Coupon {
  export async function list(): Promise<(PromoCode & { id: string })[]> {
    const body = await api<Paginated<LaravelCoupon>>('/admin/coupons');
    return body.data.map(mapCoupon);
  }

  export async function save(code: PromoCode & { id?: string }, fresh: boolean): Promise<void> {
    const payload = toCouponPayload(code);
    if (fresh || !code.id) {
      await api('/admin/coupons', { method: 'POST', body: JSON.stringify(payload) });
      return;
    }
    await api(`/admin/coupons/${code.id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/coupons/${id}`, { method: 'DELETE' });
  }
}
