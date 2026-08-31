/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder, LaravelPaymentInit } from '@/shared/api/types';

export namespace Order {
  export async function commit(): Promise<MappedOrder> {
    const body = await api<{ data: LaravelOrder }>('/orders', { method: 'POST' });
    return mapOrder(unwrapData(body));
  }

  export async function initiate(reference: string): Promise<LaravelPaymentInit> {
    const body = await api<{ data: LaravelPaymentInit }>(
      `/orders/${encodeURIComponent(reference)}/payments`,
      { method: 'POST' },
    );
    return unwrapData(body);
  }

  export async function read(reference: string): Promise<MappedOrder> {
    const body = await api<{ data: LaravelOrder }>(`/orders/${encodeURIComponent(reference)}`);
    return mapOrder(unwrapData(body));
  }
}
