import { db } from '@/lib/db';
import type { CategoryRow } from '@/lib/categories-db';

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
