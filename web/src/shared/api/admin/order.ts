/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapOrder, toLaravelOrderStatus, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder } from '@/shared/api/types';
import type { OrderDraft } from '@/features/orders/order.store';

export namespace Order {
  export async function list(): Promise<MappedOrder[]> {
    const body = await api<Paginated<LaravelOrder>>('/admin/orders?perPage=100');
    return body.data.map(mapOrder);
  }

  export async function patch(item: MappedOrder, status: OrderDraft['status']): Promise<void> {
    const target = toLaravelOrderStatus(status);
    if (!target) return;
    await api(`/admin/orders/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: target,
        reason: target === 'cancelled' ? 'Cancelled from administration' : undefined,
      }),
    });
  }

  export async function markPaid(item: MappedOrder): Promise<void> {
    await api(`/admin/orders/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'paid',
      }),
    });
  }
}
