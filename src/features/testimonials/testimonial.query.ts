import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { testimonials } from '@/shared/db/schema';
import type { TestimonialRow } from '@/features/testimonials/testimonial.repository';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

export async function fetchApprovedTestimonials(): Promise<TestimonialRow[]> {
  try {
    const data = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.approved, true))
      .orderBy(desc(testimonials.createdAt))
      .limit(6);

    if (!data.length) throw new Error('No testimonials');

    return data.map(r => ({
      id: r.id,
      name: r.name,
      text: r.text,
      avatar_url: r.avatarUrl ?? '',
      approved: true,
      created_at: r.createdAt.toISOString(),
    }));
  } catch {
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
