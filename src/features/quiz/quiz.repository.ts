import { eq, asc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { quizConcerns, quizRoutines } from '@/shared/db/schema';

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
  try {
    const data = await db
      .select()
      .from(quizConcerns)
      .where(eq(quizConcerns.active, true))
      .orderBy(asc(quizConcerns.sortOrder));
    return data.map(r => ({
      id: r.id,
      label: r.label,
      meta: r.meta,
      glyph: r.glyph,
      sort_order: r.sortOrder,
      active: r.active,
    }));
  } catch {
    return [];
  }
}

export async function fetchActiveRoutines(): Promise<QuizRoutine[]> {
  try {
    const data = await db
      .select()
      .from(quizRoutines)
      .where(eq(quizRoutines.active, true))
      .orderBy(asc(quizRoutines.sortOrder));
    return data.map(r => ({
      id: r.id,
      label: r.label,
      meta: r.meta,
      glyph: r.glyph,
      sort_order: r.sortOrder,
      active: r.active,
    }));
  } catch {
    return [];
  }
}

export async function fetchAllConcernsAdmin(): Promise<QuizConcern[]> {
  try {
    const data = await db.select().from(quizConcerns).orderBy(asc(quizConcerns.sortOrder));
    return data.map(r => ({
      id: r.id,
      label: r.label,
      meta: r.meta,
      glyph: r.glyph,
      sort_order: r.sortOrder,
      active: r.active,
    }));
  } catch {
    return [];
  }
}

export async function fetchAllRoutinesAdmin(): Promise<QuizRoutine[]> {
  try {
    const data = await db.select().from(quizRoutines).orderBy(asc(quizRoutines.sortOrder));
    return data.map(r => ({
      id: r.id,
      label: r.label,
      meta: r.meta,
      glyph: r.glyph,
      sort_order: r.sortOrder,
      active: r.active,
    }));
  } catch {
    return [];
  }
}

export async function upsertConcern(c: QuizConcern): Promise<void> {
  try {
    const existing = await db.select().from(quizConcerns).where(eq(quizConcerns.id, c.id)).limit(1);
    if (existing.length) {
      await db.update(quizConcerns).set({
        label: c.label,
        meta: c.meta,
        glyph: c.glyph,
        sortOrder: c.sort_order,
        active: c.active,
      }).where(eq(quizConcerns.id, c.id));
    } else {
      await db.insert(quizConcerns).values({
        id: c.id,
        label: c.label,
        meta: c.meta,
        glyph: c.glyph,
        sortOrder: c.sort_order,
        active: c.active,
      });
    }
  } catch (err) {
    console.error('[quiz.repository] upsertConcern error:', err);
  }
}

export async function upsertRoutine(r: QuizRoutine): Promise<void> {
  try {
    const existing = await db.select().from(quizRoutines).where(eq(quizRoutines.id, r.id)).limit(1);
    if (existing.length) {
      await db.update(quizRoutines).set({
        label: r.label,
        meta: r.meta,
        glyph: r.glyph,
        sortOrder: r.sort_order,
        active: r.active,
      }).where(eq(quizRoutines.id, r.id));
    } else {
      await db.insert(quizRoutines).values({
        id: r.id,
        label: r.label,
        meta: r.meta,
        glyph: r.glyph,
        sortOrder: r.sort_order,
        active: r.active,
      });
    }
  } catch (err) {
    console.error('[quiz.repository] upsertRoutine error:', err);
  }
}

export async function deleteConcern(id: string): Promise<void> {
  try {
    await db.delete(quizConcerns).where(eq(quizConcerns.id, id));
  } catch (err) {
    console.error('[quiz.repository] deleteConcern error:', err);
  }
}

export async function deleteRoutine(id: string): Promise<void> {
  try {
    await db.delete(quizRoutines).where(eq(quizRoutines.id, id));
  } catch (err) {
    console.error('[quiz.repository] deleteRoutine error:', err);
  }
}
