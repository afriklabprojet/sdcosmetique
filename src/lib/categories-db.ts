import { createClient } from '@/utils/supabase/client';

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
  try {
    const supabase = createClient();
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

// ─── Fetch toutes les catégories (admin) ─────────────────────────────────────
export async function fetchAllCategoriesAdmin(): Promise<CategoryRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CategoryRow[];
  } catch {
    return [];
  }
}

// ─── Créer une catégorie ──────────────────────────────────────────────────────
export async function addCategoryToDB(cat: Omit<CategoryRow, 'id' | 'created_at'>): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('categories').insert(cat);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Mettre à jour une catégorie ─────────────────────────────────────────────
export async function updateCategoryInDB(id: string, updates: Partial<Omit<CategoryRow, 'id' | 'created_at'>>): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) console.error('[categories-db] update:', error.message);
  } catch (e) {
    console.error('[categories-db] update exception:', e);
  }
}

// ─── Supprimer une catégorie ─────────────────────────────────────────────────
export async function deleteCategoryFromDB(id: string): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('[categories-db] delete:', error.message);
  } catch (e) {
    console.error('[categories-db] delete exception:', e);
  }
}
