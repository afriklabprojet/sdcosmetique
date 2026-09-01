/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapNewsletterSub } from '@/shared/api/mappers/customer';
import type { LaravelNewsletterSub } from '@/shared/api/types';
import type { NewsletterSub } from '@/features/admin/admin.type';

export namespace Newsletter {
  export async function list(): Promise<NewsletterSub[]> {
    const body = await api<Paginated<LaravelNewsletterSub>>('/admin/newsletter-subscriptions');
    return body.data.map(mapNewsletterSub);
  }

  export async function update(id: string, payload: { unsubscribed?: boolean }): Promise<NewsletterSub> {
    const body = await api<{ data: LaravelNewsletterSub }>(`/admin/newsletter-subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return mapNewsletterSub(body.data);
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/newsletter-subscriptions/${id}`, { method: 'DELETE' });
  }
}
