import { createClient } from '@/utils/supabase/client';

export interface QuizConcern {
  id: string;
  label: string;
  meta: string;
  glyph: string;
  sort_order: number;
  active: boolean;
}

export interface QuizRoutine {
  id: string;
  label: string;
  meta: string;
  glyph: string;
  sort_order: number;
  active: boolean;
}

export async function fetchActiveConcerns(): Promise<QuizConcern[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('quiz_concerns')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  return data ?? [];
}

export async function fetchActiveRoutines(): Promise<QuizRoutine[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('quiz_routines')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  return data ?? [];
}

export async function fetchAllConcernsAdmin(): Promise<QuizConcern[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('quiz_concerns')
    .select('*')
    .order('sort_order');
  return data ?? [];
}

export async function fetchAllRoutinesAdmin(): Promise<QuizRoutine[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('quiz_routines')
    .select('*')
    .order('sort_order');
  return data ?? [];
}

export async function upsertConcern(c: QuizConcern): Promise<void> {
  const supabase = createClient();
  await supabase.from('quiz_concerns').upsert(c);
}

export async function upsertRoutine(r: QuizRoutine): Promise<void> {
  const supabase = createClient();
  await supabase.from('quiz_routines').upsert(r);
}

export async function deleteConcern(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('quiz_concerns').delete().eq('id', id);
}

export async function deleteRoutine(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('quiz_routines').delete().eq('id', id);
}
