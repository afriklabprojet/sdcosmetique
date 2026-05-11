import { NextRequest, NextResponse } from 'next/server';
import {
  fetchProducts,
  fetchProductsByCategory,
  fetchBestsellerProducts,
} from '@/lib/products-server';
import { PRODUCTS } from '@/lib/products';
import { SkinTone } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category    = searchParams.get('category') ?? undefined;
    const skinTone    = searchParams.get('skinTone') as SkinTone | null;
    const bestsellers = searchParams.get('bestsellers') === 'true';
    const limit       = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    let products;
    if (bestsellers) {
      products = await fetchBestsellerProducts(limit);
    } else if (category) {
      products = await fetchProductsByCategory(category);
    } else {
      products = await fetchProducts();
    }

    if (skinTone) {
      products = products.filter(p => p.skinTones.includes(skinTone));
    }

    if (limit && !bestsellers) {
      products = products.slice(0, limit);
    }

    return NextResponse.json(products, {
      // [PERF-01] Catalogue public : mise en cache CDN 60s, s-w-r 5 min.
      // Évite de frapper Supabase à chaque page vue boutique.
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    // fallback sur données statiques
    console.error('[api/products] Erreur DB, fallback statique:', err);
    return NextResponse.json(PRODUCTS);
  }
}
