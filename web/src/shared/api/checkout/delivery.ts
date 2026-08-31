/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapStorefrontDeliveryMethod } from '@/shared/api/mappers/cart';
import type { LaravelStorefrontDeliveryMethod } from '@/shared/api/types';
import type { ShippingOption } from '@/features/site-config/site-config.type';

export namespace Delivery {
  export async function options(): Promise<ShippingOption[]> {
    const body = await api<{ data: LaravelStorefrontDeliveryMethod[] }>('/delivery-methods');
    return unwrapData(body).map(mapStorefrontDeliveryMethod);
  }
}
