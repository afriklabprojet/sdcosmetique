import { listCategories } from '@/shared/api/catalog';

export interface CategoryRow {
  id: string;
  slug: string;
  label: string;
  sub_label: string;
  image: string;
  href: string;
  icon: string;
  is_quiz: boolean;
  order_index: number;
  active: boolean;
  created_at: string;
}

export async function fetchActiveCategories(): Promise<CategoryRow[]> {
  return listCategories();
}
