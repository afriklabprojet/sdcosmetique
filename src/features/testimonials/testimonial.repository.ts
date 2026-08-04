import { createClient } from '@/shared/supabase/browser.client';
import type { WriteResult } from '@/shared/types/operation-result.type';

export interface TestimonialRow {
  id: string;
  name: string;
  text: string;
  avatar_url: string;
  approved: boolean;
  created_at: string;
}

// ─── Soumettre un témoignage (public) ────────────────────────────────────────
export async function submitTestimonial(data: {
  name: string;
  text: string;
  avatar_url?: string;
}): Promise<WriteResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').insert({
      name: data.name.trim(),
      text: data.text.trim(),
      avatar_url: data.avatar_url ?? '',
    });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Fetch tous les témoignages (admin) ──────────────────────────────────────
export async function fetchAllTestimonialsAdmin(): Promise<TestimonialRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TestimonialRow[];
  } catch {
    return [];
  }
}

// ─── Approuver / retirer un témoignage ───────────────────────────────────────
export async function approveTestimonial(id: string, approved: boolean): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('testimonials')
      .update({ approved })
      .eq('id', id);
    
  } catch (e) {
    
  }
}

// ─── Supprimer un témoignage ─────────────────────────────────────────────────
export async function deleteTestimonial(id: string): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    
  } catch (e) {
    
  }
}
