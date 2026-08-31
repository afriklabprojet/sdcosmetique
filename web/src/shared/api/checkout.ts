import { api, unwrapData } from '@/shared/api/client';
import { countryToIso } from '@/shared/api/mappers/account';
import { mapStorefrontDeliveryMethod } from '@/shared/api/mappers/cart';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type {
  LaravelCheckoutDraft,
  LaravelOrder,
  LaravelPaymentInit,
  LaravelStorefrontDeliveryMethod,
} from '@/shared/api/types';
import type { DeliveryInfo } from '@/features/checkout/checkout.type';
import { PaymentMethod } from '@/shared/types/domain.type';
import type { ShippingOption } from '@/features/site-config/site-config.type';

export function toLaravelGateway(method: PaymentMethod): 'null' | 'jeko' | 'cinetpay' {
  return method === PaymentMethod.CASH_ON_DELIVERY ? 'null' : 'jeko';
}

export async function fetchDeliveryMethods(): Promise<ShippingOption[]> {
  const body = await api<{ data: LaravelStorefrontDeliveryMethod[] }>('/delivery-methods');
  return unwrapData(body).map(mapStorefrontDeliveryMethod);
}

export async function fetchCheckoutDraft(): Promise<LaravelCheckoutDraft> {
  const body = await api<{ data: LaravelCheckoutDraft }>('/checkout');
  return unwrapData(body);
}

export async function putCheckoutContact(email: string): Promise<void> {
  await api('/checkout/contact', {
    method: 'PUT',
    body: JSON.stringify({ email }),
  });
}

export async function putCheckoutDelivery(
  delivery: DeliveryInfo,
  methodId: number,
): Promise<void> {
  await api('/checkout/delivery', {
    method: 'PUT',
    body: JSON.stringify({
      delivery_method_id: methodId,
      first_name: delivery.firstName,
      last_name: delivery.lastName,
      line_1: delivery.address,
      city: delivery.city,
      country: countryToIso(delivery.country || "Côte d'Ivoire"),
      phone: delivery.phone || null,
    }),
  });
}

export async function putCheckoutPayment(gateway: 'null' | 'jeko' | 'cinetpay'): Promise<void> {
  await api('/checkout/payment', {
    method: 'PUT',
    body: JSON.stringify({ gateway }),
  });
}

export async function commitOrder(): Promise<MappedOrder> {
  const body = await api<{ data: LaravelOrder }>('/orders', { method: 'POST' });
  return mapOrder(unwrapData(body));
}

export async function startPayment(reference: string): Promise<LaravelPaymentInit> {
  const body = await api<{ data: LaravelPaymentInit }>(
    `/orders/${encodeURIComponent(reference)}/payments`,
    { method: 'POST' },
  );
  return unwrapData(body);
}

export async function fetchPlacedOrder(reference: string): Promise<MappedOrder> {
  const body = await api<{ data: LaravelOrder }>(`/orders/${encodeURIComponent(reference)}`);
  return mapOrder(unwrapData(body));
}
