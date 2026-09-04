import type { Category, Product, SkinTone } from '@/shared/types/domain.type';
import type { LaravelAdminProduct, LaravelAdminProductWrite, LaravelStorefrontProduct } from '@/shared/api/types';

export function asCategory(slug: string | null | undefined): Category {
  if (!slug || slug.trim() === '') return 'face';
  return slug.trim() as Category;
}

function ingredientsToString(value: string[] | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  const joined = value.filter(Boolean).join(', ');
  return joined || undefined;
}

function ingredientsToArray(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined;
  return value.split(/[\n,]+/).map((part) => part.trim()).filter(Boolean);
}

export function mapStorefrontProduct(dto: LaravelStorefrontProduct): Product {
  const child = dto.children?.[0];
  return {
    id: dto.slug,
    name: dto.title,
    slug: dto.slug,
    category: asCategory(dto.category?.slug),
    price: child?.price ?? dto.price,
    originalPrice: (child?.compare_at_price ?? dto.compare_at_price) ?? undefined,
    images: dto.images ?? [],
    skinTones: (dto.skin_tones ?? []) as SkinTone[],
    badges: dto.badges ?? [],
    rating: 4.8,
    reviewCount: 24,
    shortDescription: dto.summary ?? '',
    description: dto.description ?? '',
    benefits: [],
    usage: dto.usage ?? '',
    ingredients: ingredientsToString(dto.ingredients),
    inStock: child?.in_stock ?? dto.in_stock,
    stockQty: child?.stock ?? dto.stock,
    newArrival: dto.recent,
    bestseller: dto.bestseller ?? dto.featured ?? false,
    variantSlug: child?.slug ?? dto.slug,
  };
}

export function mapAdminProduct(dto: LaravelAdminProduct): Product {
  const regular = dto.regular_price ?? 0;
  const sale = dto.sale_price;
  return {
    id: String(dto.id),
    name: dto.title ?? '',
    slug: dto.slug,
    category: asCategory(dto.category_slug),
    price: sale ?? regular,
    originalPrice: sale != null ? regular : undefined,
    images: (dto.images ?? []).map((file) => file.url),
    skinTones: (dto.skin_tones ?? []) as SkinTone[],
    badges: (dto.badges ?? []).filter((b) => b.type !== 'bestseller').map((badge) => badge.label),
    rating: 0,
    reviewCount: 0,
    shortDescription: dto.summary ?? '',
    description: dto.description ?? '',
    benefits: [],
    usage: dto.usage ?? '',
    ingredients: ingredientsToString(dto.ingredients),
    inStock: dto.stock > 0,
    stockQty: dto.stock,
    newArrival: dto.recent ?? (dto.published_at != null ? (Date.now() - new Date(dto.published_at).getTime() < 30 * 24 * 3600 * 1000) : false),
    bestseller: (dto.badges ?? []).some((badge) => badge.type === 'bestseller'),
  };
}

export function toAdminProductPayload(
  product: Pick<Product, 'name' | 'slug' | 'shortDescription' | 'description' | 'usage' | 'ingredients' | 'price' | 'originalPrice' | 'stockQty' | 'inStock' | 'images' | 'skinTones' | 'bestseller' | 'badges' | 'newArrival'>,
  categoryId: number,
): LaravelAdminProductWrite {
  const hasSale = product.originalPrice != null && product.originalPrice > product.price;
  let publishedAt: string | null | undefined = undefined;
  if (product.newArrival === true) {
    publishedAt = new Date().toISOString();
  } else if (product.newArrival === false) {
    publishedAt = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
  }

  return {
    category_id: categoryId,
    slug: product.slug,
    title: product.name,
    summary: product.shortDescription || null,
    description: product.description || null,
    usage: product.usage || null,
    ingredients: ingredientsToArray(product.ingredients),
    regular_price: hasSale ? product.originalPrice ?? product.price : product.price,
    sale_price: hasSale ? product.price : null,
    stock: product.stockQty ?? (product.inStock ? 1 : 0),
    images: product.images,
    skin_tones: product.skinTones ?? [],
    bestseller: product.bestseller ?? false,
    badges: product.badges ?? [],
    ...(publishedAt !== undefined ? { published_at: publishedAt } : {}),
  };
}
