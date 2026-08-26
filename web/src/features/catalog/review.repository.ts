'use server';

/**
 * review.repository.ts — Acces aux avis produits avec Drizzle ORM.
 */
import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { reviews } from '@/shared/db/schema';
import type { Review, SkinTone } from '@/shared/types/domain.type';

// ─── Fetch tous les avis (admin) ──────────────────────────────────────────────
export async function fetchAllReviews(): Promise<(Review & { productId?: string })[]> {
  try {
    const data = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return data.map(row => ({
      id: String(row.id),
      author: String(row.author),
      rating: Number(row.rating),
      comment: String(row.text || ''),
      date: row.createdAt.toISOString(),
      skinTone: row.skinTone ?? undefined,
      verified: Boolean(row.verified),
      productId: row.productId ?? undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Supprimer un avis ────────────────────────────────────────────────────────
export async function deleteReview(id: string): Promise<void> {
  try {
    await db.delete(reviews).where(eq(reviews.id, id));
  } catch (e) {
    console.error('[review.repository] deleteReview error:', e);
  }
}

// ─── Approuver / retirer un avis (toggle verified) ───────────────────────────
export async function approveReview(id: string, verified: boolean): Promise<void> {
  try {
    await db.update(reviews).set({ verified }).where(eq(reviews.id, id));
  } catch (e) {
    console.error('[review.repository] approveReview error:', e);
  }
}
