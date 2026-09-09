/* eslint-disable @typescript-eslint/no-namespace */
import { api, ApiError, unwrapData } from '@/shared/api/client';
import { mapPublicPage, type StaticPage } from '@/shared/api/mappers/page';
import type { LaravelPage } from '@/shared/api/types';

export namespace StorefrontPage {
  export async function find(slug: string): Promise<StaticPage | null> {
    try {
      const body = await api<{ data: LaravelPage }>(`/pages/${encodeURIComponent(slug)}`, {
        next: { revalidate: 60, tags: ['pages'] },
      } as RequestInit);
      return mapPublicPage(unwrapData(body));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      return null;
    }
  }
}
