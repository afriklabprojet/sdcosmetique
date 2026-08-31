/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { countryToIso } from '@/shared/api/mappers/account';
import type { LaravelCheckoutDraft } from '@/shared/api/types';
import type { DeliveryInfo } from '@/features/checkout/checkout.type';
import type { PaymentGateway } from '@/shared/types/domain.type';

export namespace Checkout {
  export async function draft(): Promise<LaravelCheckoutDraft> {
    const body = await api<{ data: LaravelCheckoutDraft }>('/checkout');
    return unwrapData(body);
  }

  export async function contact(email: string): Promise<void> {
    await api('/checkout/contact', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }

  export async function route(info: DeliveryInfo, id: number): Promise<void> {
    await api('/checkout/delivery', {
      method: 'PUT',
      body: JSON.stringify({
        delivery_method_id: id,
        first_name: info.firstName,
        last_name: info.lastName,
        line_1: info.address,
        city: info.city,
        country: countryToIso(info.country || "Côte d'Ivoire"),
        phone: info.phone || null,
      }),
    });
  }

  export async function pay(gateway: PaymentGateway): Promise<void> {
    await api('/checkout/payment', {
      method: 'PUT',
      body: JSON.stringify({ gateway }),
    });
  }
}
