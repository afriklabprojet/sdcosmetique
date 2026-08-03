import { db } from '@/shared/supabase/request.client';
import type { CategoryRow } from '@/features/catalog/category.repository';

export async function fetchActiveCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CategoryRow[];
  } catch {
    return [];
  }
}
