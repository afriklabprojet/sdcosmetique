'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { products, siteConfig } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';
import type { SiteConfig } from '@/features/site-config/site-config.type';
import type { Product } from '@/shared/types/domain.type';

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

export async function addProduct(product: Product): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const payload = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    images: product.images.filter((url) => url.trim() !== ''),
    skinTones: product.skinTones,
    badges: product.badges ?? [],
    rating: String(product.rating),
    reviewCount: product.reviewCount,
    shortDescription: product.shortDescription,
    description: product.description,
    benefits: product.benefits,
    usage: product.usage,
    ingredients: product.ingredients ?? null,
    inStock: product.inStock,
    stockQty: product.stockQty ?? null,
    lowStockThreshold: product.lowStockThreshold ?? null,
    isNew: product.newArrival ?? false,
    isBestseller: product.bestseller ?? false,
    resultsTitle: product.resultsTitle ?? null,
    resultsSubtitle: product.resultsSubtitle ?? null,
  };

  const existing = await db.select({ id: products.id }).from(products).where(eq(products.id, product.id)).limit(1);
  if (existing.length) {
    await db.update(products).set(payload).where(eq(products.id, product.id));
  } else {
    await db.insert(products).values(payload);
  }

  revalidateTag('products', 'default');
  revalidatePath('/boutique');
  revalidatePath('/');
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id'>>,
): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const updatePayload: Record<string, unknown> = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.slug !== undefined) updatePayload.slug = updates.slug;
  if (updates.category !== undefined) updatePayload.category = updates.category;
  if (updates.price !== undefined) updatePayload.price = updates.price;
  if (updates.originalPrice !== undefined) updatePayload.originalPrice = updates.originalPrice;
  if (updates.images !== undefined) updatePayload.images = updates.images.filter(s => s.trim() !== '');
  if (updates.skinTones !== undefined) updatePayload.skinTones = updates.skinTones;
  if (updates.badges !== undefined) updatePayload.badges = updates.badges;
  if (updates.shortDescription !== undefined) updatePayload.shortDescription = updates.shortDescription;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.benefits !== undefined) updatePayload.benefits = updates.benefits;
  if (updates.usage !== undefined) updatePayload.usage = updates.usage;
  if (updates.ingredients !== undefined) updatePayload.ingredients = updates.ingredients;
  if (updates.inStock !== undefined) updatePayload.inStock = updates.inStock;
  if (updates.stockQty !== undefined) updatePayload.stockQty = updates.stockQty;
  if (updates.lowStockThreshold !== undefined) updatePayload.lowStockThreshold = updates.lowStockThreshold;
  if (updates.newArrival !== undefined) updatePayload.isNew = updates.newArrival;
  if (updates.bestseller !== undefined) updatePayload.isBestseller = updates.bestseller;
  if (updates.resultsTitle !== undefined) updatePayload.resultsTitle = updates.resultsTitle;
  if (updates.resultsSubtitle !== undefined) updatePayload.resultsSubtitle = updates.resultsSubtitle;

  await db.update(products).set(updatePayload).where(eq(products.id, id));

  revalidateTag('products', 'default');
  revalidatePath('/boutique');
  revalidatePath('/');
  revalidatePath(`/produit/${updates.slug ?? id}`);
}

export async function deleteProduct(id: string): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  await db.delete(products).where(eq(products.id, id));

  revalidateTag('products', 'default');
  revalidatePath('/boutique');
  revalidatePath('/');
}
