/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapCustomerMessage } from '@/shared/api/mappers/customer';
import type { LaravelCustomerMessage } from '@/shared/api/types';
import type { CustomerMessageRow } from '@/features/admin/admin.type';

/** Messages > Messages envoyés (§11) — messages individuels admin → client, distincts des campagnes Marketing Bulk. */
export namespace CustomerMessage {
  /** Sans `clientId` : liste globale. Avec : historique d'un seul client (fiche client, §4). */
  export async function list(clientId?: string): Promise<CustomerMessageRow[]> {
    const qs = clientId ? `&client_id=${clientId}` : '';
    const body = await api<Paginated<LaravelCustomerMessage>>(`/admin/messages?perPage=100${qs}`);
    return body.data.map(mapCustomerMessage);
  }

  export async function resend(id: string): Promise<void> {
    await api(`/admin/messages/${id}/resend`, { method: 'POST' });
  }
}
