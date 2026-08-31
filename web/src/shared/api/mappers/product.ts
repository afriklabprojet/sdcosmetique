import type { Category, Product } from '@/shared/types/domain.type';
import type { LaravelAdminProduct, LaravelAdminProductWrite, LaravelStorefrontProduct } from '@/shared/api/types';

const CATEGORY_SLUGS: readonly Category[] = [
  'body',
  'face',
  'gammes',
  'kits',
  'duo',
  'kit-levre',
  'minceur',
];

export function asCategory(slug: string | null | undefined): Category {
  return CATEGORY_SLUGS.includes(slug as Category) ? (slug as Category) : 'face';
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
  return {
    id: dto.slug,
    name: dto.title,
    slug: dto.slug,
    category: asCategory(dto.category?.slug),
    price: dto.price,
    originalPrice: dto.compare_at_price ?? undefined,
    images: dto.images ?? [],
    skinTones: [],
    badges: dto.badges ?? [],
    rating: 0,
    reviewCount: 0,
    shortDescription: dto.summary ?? '',
    description: dto.description ?? '',
    benefits: [],
    usage: dto.usage ?? '',
    ingredients: ingredientsToString(dto.ingredients),
    inStock: dto.in_stock,
    stockQty: dto.stock,
    newArrival: dto.recent,
    bestseller: dto.featured,
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
    skinTones: [],
    badges: (dto.badges ?? []).map((badge) => badge.label),
    rating: 0,
    reviewCount: 0,
    shortDescription: dto.summary ?? '',
    description: dto.description ?? '',
    benefits: [],
    usage: dto.usage ?? '',
    ingredients: ingredientsToString(dto.ingredients),
    inStock: dto.stock > 0,
    stockQty: dto.stock,
    newArrival: dto.published_at != null,
    bestseller: (dto.badges ?? []).some((badge) => badge.type === 'featured'),
  };
}

export function toAdminProductPayload(
  product: Pick<Product, 'name' | 'slug' | 'shortDescription' | 'description' | 'usage' | 'ingredients' | 'price' | 'originalPrice' | 'stockQty' | 'inStock'>,
  categoryId: number,
): LaravelAdminProductWrite {
  const hasSale = product.originalPrice != null && product.originalPrice > product.price;
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
  };
}
