/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapAdminPayment, mapAdminPaymentNotification } from '@/shared/api/mappers/payment';
import type { LaravelAdminPayment, LaravelAdminPaymentNotification } from '@/shared/api/types';
import type { AdminPaymentRow, AdminPaymentNotificationRow } from '@/features/admin/admin.type';

export namespace Payment {
  export async function list(): Promise<AdminPaymentRow[]> {
    const body = await api<Paginated<LaravelAdminPayment>>('/admin/payments');
    return body.data.map(mapAdminPayment);
  }
}

export namespace PaymentNotification {
  export async function list(): Promise<AdminPaymentNotificationRow[]> {
    const body = await api<Paginated<LaravelAdminPaymentNotification>>('/admin/payment-notifications');
    return body.data.map(mapAdminPaymentNotification);
  }

  export async function show(id: string): Promise<AdminPaymentNotificationRow> {
    const body = await api<{ data: LaravelAdminPaymentNotification }>(`/admin/payment-notifications/${id}`);
    return mapAdminPaymentNotification(body.data);
  }
}
