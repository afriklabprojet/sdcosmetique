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
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    // fallback sur données statiques
    return NextResponse.json(PRODUCTS);
  }
}
