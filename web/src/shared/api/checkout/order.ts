/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder, LaravelPaymentInit } from '@/shared/api/types';
import type { PaymentMethod } from '@/shared/types/domain.type';

export namespace Order {
  export async function commit(): Promise<MappedOrder> {
    const body = await api<{ data: LaravelOrder }>('/orders', { method: 'POST' });
    return mapOrder(unwrapData(body));
  }

  /**
   * `email` authentifie l'accès à une commande invité (sans compte) — la
   * référence seule (courte et séquentielle, §audit) ne suffit plus depuis
   * qu'elle est prévisible.
   */
  export async function initiate(reference: string, paymentMethod: PaymentMethod, email?: string): Promise<LaravelPaymentInit> {
    const body = await api<{ data: LaravelPaymentInit }>(
      `/orders/${encodeURIComponent(reference)}/payments`,
      { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod, email }) },
    );
    return unwrapData(body);
  }

  export async function read(reference: string, email?: string): Promise<MappedOrder> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    const body = await api<{ data: LaravelOrder }>(`/orders/${encodeURIComponent(reference)}${qs}`);
    return mapOrder(unwrapData(body));
  }
}
