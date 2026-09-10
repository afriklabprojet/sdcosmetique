import type { ClientDetail, ClientRow, CustomerMessageRow } from '@/features/admin/admin.type';
import type { NewsletterSub } from '@/features/admin/admin.type';
import type { LaravelCustomer, LaravelCustomerDetail, LaravelCustomerMessage, LaravelNewsletterSub } from '@/shared/api/types';

export function mapCustomer(dto: LaravelCustomer): ClientRow {
  return {
    id: String(dto.id),
    email: dto.email ?? '',
    name: dto.name ?? dto.email ?? `Client #${dto.id}`,
    orders: dto.orders_count ?? 0,
    total: dto.total_value,
    lastDate: dto.updated_at,
  };
}

export function mapCustomerDetail(dto: LaravelCustomerDetail): ClientDetail {
  return {
    id: String(dto.id),
    name: dto.name ?? dto.email ?? `Client #${dto.id}`,
    email: dto.email ?? '',
    phone: dto.phone,
    whatsapp: dto.whatsapp,
    address: dto.address,
    ordersCount: dto.orders_count,
    totalValue: dto.total_value,
    averageBasket: dto.average_basket,
    firstOrderAt: dto.first_order_at,
    lastOrderAt: dto.last_order_at,
    lastOrder: dto.last_order === null ? null : {
      reference: dto.last_order.reference,
      total: dto.last_order.total,
      status: dto.last_order.status,
      placedAt: dto.last_order.placed_at,
    },
    createdAt: dto.created_at,
  };
}

export function mapCustomerMessage(dto: LaravelCustomerMessage): CustomerMessageRow {
  return {
    id: String(dto.id),
    clientId: String(dto.client_id),
    clientName: dto.client_name,
    subject: dto.subject,
    body: dto.body,
    recipientEmail: dto.recipient_email,
    status: dto.status,
    error: dto.error,
    sentBy: dto.sent_by,
    sentAt: dto.sent_at,
    createdAt: dto.created_at,
  };
}

export function mapNewsletterSub(dto: LaravelNewsletterSub): NewsletterSub {
  return {
    id: String(dto.id),
    email: dto.email,
    source: null,
    unsubscribed: dto.unsubscribed_at != null,
    created_at: dto.created_at,
  };
}
