'use server';

import { eq, asc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { categories } from '@/shared/db/schema';
import type { WriteResult } from '@/shared/types/operation-result.type';

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

function mapRow(r: typeof categories.$inferSelect): CategoryRow {
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    sub_label: r.subLabel,
    image: r.image,
    href: r.href ?? '',
    icon: r.icon ?? '',
    is_quiz: Boolean(r.isQuiz),
    order_index: r.orderIndex ?? 0,
    active: Boolean(r.active),
    created_at: r.createdAt.toISOString(),
  };
}

// ─── Fetch toutes les catégories actives (frontend) ──────────────────────────
export async function fetchActiveCategories(): Promise<CategoryRow[]> {
  try {
    const data = await db
      .select()
      .from(categories)
      .where(eq(categories.active, true))
      .orderBy(asc(categories.orderIndex));
    return data.map(mapRow);
  } catch {
    return [];
  }
}

// ─── Fetch toutes les catégories (admin) ─────────────────────────────────────
export async function fetchAllCategoriesAdmin(): Promise<CategoryRow[]> {
  try {
    const data = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.orderIndex));
    return data.map(mapRow);
  } catch {
    return [];
  }
}

// ─── Créer une catégorie ──────────────────────────────────────────────────────
export async function addCategory(cat: Omit<CategoryRow, 'id' | 'created_at'>): Promise<WriteResult> {
  try {
    await db.insert(categories).values({
      slug: cat.slug,
      label: cat.label,
      subLabel: cat.sub_label,
      image: cat.image,
      href: cat.href,
      icon: cat.icon,
      isQuiz: cat.is_quiz,
      orderIndex: cat.order_index,
      active: cat.active,
    });
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

// ─── Mettre à jour une catégorie ─────────────────────────────────────────────
export async function updateCategory(id: string, updates: Partial<Omit<CategoryRow, 'id' | 'created_at'>>): Promise<void> {
  try {
    const values: Record<string, unknown> = {};
    if (updates.slug !== undefined) values.slug = updates.slug;
    if (updates.label !== undefined) values.label = updates.label;
    if (updates.sub_label !== undefined) values.subLabel = updates.sub_label;
    if (updates.image !== undefined) values.image = updates.image;
    if (updates.href !== undefined) values.href = updates.href;
    if (updates.icon !== undefined) values.icon = updates.icon;
    if (updates.is_quiz !== undefined) values.isQuiz = updates.is_quiz;
    if (updates.order_index !== undefined) values.orderIndex = updates.order_index;
    if (updates.active !== undefined) values.active = updates.active;

    await db.update(categories).set(values).where(eq(categories.id, id));
  } catch {
    // erreur silencieuse
  }
}

// ─── Supprimer une catégorie ─────────────────────────────────────────────
export async function deleteCategory(id: string): Promise<void> {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch {
    // erreur silencieuse
  }
}
