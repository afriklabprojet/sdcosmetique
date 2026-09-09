import type { LaravelAdminPage, LaravelPage } from '@/shared/api/types';
import type { AdminPageRow } from '@/features/admin/admin.type';

export function mapAdminPage(dto: LaravelAdminPage): AdminPageRow {
  return {
    id: String(dto.id),
    slug: dto.slug,
    title: dto.title,
    content: dto.content ?? '',
    publishedAt: dto.published_at,
    created_at: dto.created_at,
  };
}

export interface StaticPage {
  slug: string;
  title: string;
  content: string;
}

export function mapPublicPage(dto: LaravelPage): StaticPage {
  return {
    slug: dto.slug,
    title: dto.title,
    content: dto.content ?? '',
  };
}
