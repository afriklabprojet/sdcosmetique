/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder } from '@/shared/api/types';

export namespace Order {
  export async function read(): Promise<MappedOrder[]> {
    const body = await api<{ data: LaravelOrder[] }>('/account/orders');
    return unwrapData(body).map(mapOrder);
  }
}
