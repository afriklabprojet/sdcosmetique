import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { createServiceClient } from '@/utils/supabase/service';
import { rowToProduct } from '@/lib/mappers';
import type { Product } from '@/types';

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('[admin/products GET] db error:', error.message);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

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

    const supabase = createServiceClient();
    const { error } = await supabase.from('products').upsert(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice ?? null,
        images: product.images.filter((url: string) => url.trim() !== ''),
        skin_tones: product.skinTones,
        badges: product.badges ?? [],
        rating: product.rating,
        review_count: product.reviewCount,
        short_description: product.shortDescription,
        description: product.description,
        benefits: product.benefits,
        usage: product.usage,
        ingredients: product.ingredients ?? null,
        in_stock: product.inStock,
        stock_qty: product.stockQty ?? null,
        low_stock_threshold: product.lowStockThreshold ?? null,
        is_new: product.isNew ?? false,
        is_bestseller: product.isBestseller ?? false,
      },
      { onConflict: 'id' },
    );

    if (error) {
      console.error('[admin/products POST] db error:', error.message);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    try {
      revalidateTag('products', 'default');
      revalidatePath('/boutique');
      revalidatePath('/');
    } catch {
      // revalidatePath peut échouer sur certains hébergeurs — non bloquant
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

    const supabase = createServiceClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('[admin/products DELETE] db error:', error.message);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

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
