import { api, unwrapData, type Paginated } from '@/shared/api/client';
import { mapAdminCategory, toAdminCategoryPayload } from '@/shared/api/mappers/category';
import { mapCoupon, toCouponPayload } from '@/shared/api/mappers/coupon';
import { mapCustomer, mapNewsletterSub } from '@/shared/api/mappers/customer';
import { mapDeliveryMethod, toDeliveryMethodPayload } from '@/shared/api/mappers/delivery';
import { mapOrder, toLaravelOrderStatus, type MappedOrder } from '@/shared/api/mappers/order';
import { mapAdminProduct, toAdminProductPayload } from '@/shared/api/mappers/product';
import type {
  LaravelAdminCategory,
  LaravelAdminProduct,
  LaravelAdminSession,
  LaravelCoupon,
  LaravelCustomer,
  LaravelDeliveryMethod,
  LaravelMetricsOverview,
  LaravelNewsletterSub,
  LaravelOrder,
} from '@/shared/api/types';
import type { CategoryRow } from '@/features/catalog/category.repository';
import type { ClientRow, NewsletterSub } from '@/features/admin/admin.type';
import type { OrderDraft } from '@/features/orders/order.store';
import type { Product } from '@/shared/types/domain.type';
import type { PromoCode, ShippingOption } from '@/features/site-config/site-config.type';

export async function fetchAdminSession() {
  return api<LaravelAdminSession>('/admin/session');
}

export async function fetchAdminOrders(): Promise<MappedOrder[]> {
  const body = await api<Paginated<LaravelOrder>>('/admin/orders?perPage=100');
  return body.data.map(mapOrder);
}

export async function patchAdminOrderStatus(order: MappedOrder, status: OrderDraft['status']): Promise<void> {
  const laravelStatus = toLaravelOrderStatus(status);
  if (!laravelStatus) return;
  await api(`/admin/orders/${order.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: laravelStatus,
      reason: laravelStatus === 'cancelled' ? 'Cancelled from administration' : undefined,
    }),
  });
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const body = await api<Paginated<LaravelAdminProduct>>('/admin/products?parents_only=1&perPage=100');
  return body.data.map(mapAdminProduct);
}

export async function saveAdminProduct(product: Product, categoryId: number, isNew: boolean): Promise<void> {
  const payload = toAdminProductPayload(product, categoryId);
  if (isNew) {
    await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
    return;
  }
  await api(`/admin/products/${product.id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function fetchAdminCategories(): Promise<CategoryRow[]> {
  const body = await api<{ data: LaravelAdminCategory[] }>('/admin/categories');
  return unwrapData(body).map(mapAdminCategory);
}

export async function saveAdminCategory(row: CategoryRow, isNew: boolean): Promise<void> {
  const payload = toAdminCategoryPayload(row);
  if (isNew) {
    await api('/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
    return;
  }
  await api(`/admin/categories/${row.id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await api(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function fetchAdminCustomers(): Promise<ClientRow[]> {
  const body = await api<Paginated<LaravelCustomer>>('/admin/customers?perPage=100');
  return body.data.map(mapCustomer);
}

export async function fetchAdminNewsletter(): Promise<NewsletterSub[]> {
  const body = await api<Paginated<LaravelNewsletterSub>>('/admin/newsletter-subscriptions');
  return body.data.map(mapNewsletterSub);
}

export async function deleteAdminNewsletter(id: string): Promise<void> {
  await api(`/admin/newsletter-subscriptions/${id}`, { method: 'DELETE' });
}

export async function fetchAdminCoupons(): Promise<(PromoCode & { id: string })[]> {
  const body = await api<Paginated<LaravelCoupon>>('/admin/coupons');
  return body.data.map(mapCoupon);
}

export async function saveAdminCoupon(code: PromoCode & { id?: string }, isNew: boolean): Promise<void> {
  const payload = toCouponPayload(code);
  if (isNew || !code.id) {
    await api('/admin/coupons', { method: 'POST', body: JSON.stringify(payload) });
    return;
  }
  await api(`/admin/coupons/${code.id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  await api(`/admin/coupons/${id}`, { method: 'DELETE' });
}

export async function fetchAdminDeliveryMethods(): Promise<ShippingOption[]> {
  const body = await api<{ data: LaravelDeliveryMethod[] }>('/admin/delivery-methods');
  return unwrapData(body).map(mapDeliveryMethod);
}

export async function saveAdminDeliveryMethod(option: ShippingOption, isNew: boolean): Promise<void> {
  const payload = toDeliveryMethodPayload(option);
  if (isNew || option.id.startsWith('opt-')) {
    await api('/admin/delivery-methods', { method: 'POST', body: JSON.stringify(payload) });
    return;
  }
  await api(`/admin/delivery-methods/${option.id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminDeliveryMethod(id: string): Promise<void> {
  await api(`/admin/delivery-methods/${id}`, { method: 'DELETE' });
}

export async function fetchAdminMetrics(): Promise<LaravelMetricsOverview> {
  return api<LaravelMetricsOverview>('/admin/metrics/overview');
}
