import type { CategoryRow } from '@/features/catalog/category.repository';
import type { LaravelAdminCategory, LaravelStorefrontCategory } from '@/shared/api/types';

export function mapAdminCategory(dto: LaravelAdminCategory): CategoryRow {
  return {
    id: String(dto.id),
    slug: dto.slug,
    label: dto.name ?? dto.slug,
    sub_label: dto.description ?? '',
    image: dto.image ?? '',
    href: `/categorie/${dto.slug}`,
    icon: '',
    is_quiz: false,
    order_index: dto.order,
    active: true,
    created_at: dto.created_at,
  };
}

export function mapStorefrontCategory(dto: LaravelStorefrontCategory): CategoryRow {
  return {
    id: dto.slug,
    slug: dto.slug,
    label: dto.name,
    sub_label: dto.description ?? '',
    image: dto.image ?? '',
    href: `/categorie/${dto.slug}`,
    icon: '',
    is_quiz: false,
    order_index: dto.order,
    active: true,
    created_at: '',
  };
}

export function toAdminCategoryPayload(row: Pick<CategoryRow, 'slug' | 'label' | 'sub_label' | 'image' | 'order_index'>): {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  order: number;
} {
  return {
    slug: row.slug,
    name: row.label,
    description: row.sub_label || null,
    image: row.image || null,
    order: row.order_index,
  };
}
