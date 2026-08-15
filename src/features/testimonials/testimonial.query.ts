import { db } from '@/shared/supabase/request.client';
import type { TestimonialRow } from '@/features/testimonials/testimonial.repository';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

// ─── Fetch les témoignages approuvés pour la homepage ────────────────────────
export async function fetchApprovedTestimonials(): Promise<TestimonialRow[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data ?? []) as TestimonialRow[];
  } catch {
    // Fallback : convertit les défauts du site_config au format TestimonialRow
    return DEFAULT_SITE_CONFIG.testimonials_home.map((t, i) => ({
      id: `default-${i}`,
      name: t.name,
      text: t.text,
      avatar_url: t.avatar,
      approved: true,
      created_at: new Date().toISOString(),
    }));
  }
}
