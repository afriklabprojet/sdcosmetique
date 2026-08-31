/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapDeliveryMethod, toDeliveryMethodPayload } from '@/shared/api/mappers/delivery';
import type { LaravelDeliveryMethod } from '@/shared/api/types';
import type { ShippingOption } from '@/features/site-config/site-config.type';

export namespace Delivery {
  export async function list(): Promise<ShippingOption[]> {
    const body = await api<{ data: LaravelDeliveryMethod[] }>('/admin/delivery-methods');
    return unwrapData(body).map(mapDeliveryMethod);
  }

  export async function save(option: ShippingOption, fresh: boolean): Promise<void> {
    const payload = toDeliveryMethodPayload(option);
    if (fresh || option.id.startsWith('opt-')) {
      await api('/admin/delivery-methods', { method: 'POST', body: JSON.stringify(payload) });
      return;
    }
    await api(`/admin/delivery-methods/${option.id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/delivery-methods/${id}`, { method: 'DELETE' });
  }
}
