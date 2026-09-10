/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapCustomer, mapCustomerDetail } from '@/shared/api/mappers/customer';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelCustomer, LaravelCustomerDetail, LaravelOrder } from '@/shared/api/types';
import type { ClientDetail, ClientRow } from '@/features/admin/admin.type';

export namespace Customer {
  export async function list(): Promise<ClientRow[]> {
    const body = await api<Paginated<LaravelCustomer>>('/admin/customers?perPage=100');
    return body.data.map(mapCustomer);
  }

  /** Fiche client complète (§4). */
  export async function get(id: string): Promise<ClientDetail> {
    const body = await api<{ data: LaravelCustomerDetail }>(`/admin/customers/${id}`);
    return mapCustomerDetail(body.data);
  }

  /** Historique des commandes du client, plus récentes d'abord (§4). */
  export async function orders(id: string): Promise<MappedOrder[]> {
    const body = await api<Paginated<LaravelOrder>>(`/admin/customers/${id}/orders?perPage=50`);
    return body.data.map(mapOrder);
  }

  /** « Envoyer un message » depuis la fiche client / « Nouveau message » (§5, §10). */
  export async function sendMessage(id: string, payload: { subject: string; body: string }): Promise<void> {
    await api(`/admin/customers/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
