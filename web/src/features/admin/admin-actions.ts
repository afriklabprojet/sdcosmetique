'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { siteConfig } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';
import type { SiteConfig } from '@/features/site-config/site-config.type';

export async function saveSiteConfigSection(
  key: keyof SiteConfig,
  value: SiteConfig[typeof key],
): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const existing = await db.select({ key: siteConfig.key }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
  if (existing.length) {
    await db.update(siteConfig).set({ value: value as Record<string, unknown> }).where(eq(siteConfig.key, key));
  } else {
    await db.insert(siteConfig).values({ key, value: value as Record<string, unknown> });
  }

  revalidateTag('site-config', 'default');
  revalidatePath('/', 'layout');
  revalidatePath('/produit/[slug]', 'layout');
  revalidatePath('/teint/[slug]', 'layout');
  revalidatePath('/boutique', 'layout');
}

