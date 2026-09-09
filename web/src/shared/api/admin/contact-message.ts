/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapContactMessage } from '@/shared/api/mappers/contact-message';
import type { LaravelContactMessage } from '@/shared/api/types';
import type { ContactMessageRow } from '@/features/admin/admin.type';

export namespace ContactMessage {
  export async function list(): Promise<ContactMessageRow[]> {
    const body = await api<Paginated<LaravelContactMessage>>('/admin/contact-messages');
    return body.data.map(mapContactMessage);
  }

  export async function setHandled(id: string, handled: boolean): Promise<ContactMessageRow> {
    const body = await api<{ data: LaravelContactMessage }>(`/admin/contact-messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ handled }),
    });
    return mapContactMessage(body.data);
  }
}
