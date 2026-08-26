import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { products } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';
import { rowToProduct } from '@/features/catalog/catalog.mapper';
import type { Product } from '@/shared/types/domain.type';

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const data = await db.select().from(products).orderBy(asc(products.createdAt));
    return NextResponse.json((data ?? []).map(rowToProduct));
  } catch (err) {
    console.error('[admin/products GET] unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const product: Product = await req.json();

    const payload = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      images: product.images.filter((url: string) => url.trim() !== ''),
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

    try {
      revalidateTag('products', 'default');
      revalidatePath('/boutique');
      revalidatePath('/');
    } catch {
      // non-bloquant
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products POST] unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'id manquant' }, { status: 400 });
    }

    await db.delete(products).where(eq(products.id, id));

    try {
      revalidateTag('products', 'default');
      revalidatePath('/boutique');
      revalidatePath('/');
    } catch {
      // non bloquant
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products DELETE] unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
