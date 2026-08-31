'use server';

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

// ─── Fetch toutes les catégories actives (frontend) ──────────────────────────
export async function fetchActiveCategories(): Promise<CategoryRow[]> {
  const { listCategories } = await import('@/shared/api/catalog');
  try {
    return await listCategories();
  } catch {
    return [];
  }
}
