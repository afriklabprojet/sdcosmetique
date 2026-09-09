/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapAdminPage } from '@/shared/api/mappers/page';
import type { LaravelAdminPage } from '@/shared/api/types';
import type { AdminPageRow } from '@/features/admin/admin.type';

export namespace Page {
  export async function list(): Promise<AdminPageRow[]> {
    const body = await api<{ data: LaravelAdminPage[] }>('/admin/pages');
    return unwrapData(body).map(mapAdminPage);
  }

  export async function save(row: AdminPageRow, fresh: boolean): Promise<void> {
    const payload = {
      slug: row.slug,
      title: row.title,
      content: row.content,
      published_at: row.publishedAt,
    };
    if (fresh) {
      await api('/admin/pages', { method: 'POST', body: JSON.stringify(payload) });
      return;
    }
    await api(`/admin/pages/${row.id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  export async function remove(id: string): Promise<void> {
    await api(`/admin/pages/${id}`, { method: 'DELETE' });
  }
}
