import type { ClientRow } from '@/features/admin/admin.type';
import type { NewsletterSub } from '@/features/admin/admin.type';
import type { LaravelCustomer, LaravelNewsletterSub } from '@/shared/api/types';

export function mapCustomer(dto: LaravelCustomer): ClientRow {
  return {
    email: dto.email ?? '',
    name: dto.name ?? dto.email ?? `Client #${dto.id}`,
    orders: dto.orders_count ?? 0,
    total: dto.total_value,
    lastDate: dto.updated_at,
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
