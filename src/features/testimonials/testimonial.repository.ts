import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { testimonials } from '@/shared/db/schema';
import type { WriteResult } from '@/shared/types/operation-result.type';

export interface TestimonialRow {
  id: string;
  name: string;
  text: string;
  avatar_url: string;
  approved: boolean;
  created_at: string;
}

export async function submitTestimonial(data: {
  name: string;
  text: string;
  avatar_url?: string;
}): Promise<WriteResult> {
  try {
    await db.insert(testimonials).values({
      name: data.name.trim(),
      text: data.text.trim(),
      avatarUrl: data.avatar_url ?? '',
      approved: false,
    });
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchAllTestimonialsAdmin(): Promise<TestimonialRow[]> {
  try {
    const data = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    return data.map(r => ({
      id: r.id,
      name: r.name,
      text: r.text,
      avatar_url: r.avatarUrl ?? '',
      approved: Boolean(r.approved),
      created_at: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function approveTestimonial(id: string, approved: boolean): Promise<void> {
  try {
    await db.update(testimonials).set({ approved }).where(eq(testimonials.id, id));
  } catch (e) {
    console.error('[testimonial.repository] approve error:', e);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  } catch (e) {
    console.error('[testimonial.repository] delete error:', e);
  }
}
