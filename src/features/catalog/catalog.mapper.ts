/**
 * mappers.ts — Convertisseurs DB row → types métier.
 * Ce fichier est isomorphe : importable côté client ET serveur.
 */
import type { Product, SkinTone, Category, Review } from '@/shared/types/domain.type';

export function rowToProduct(row: Record<string, unknown>): Product {
  const images = (row.images ?? []) as string[];
  const skinTones = (row.skinTones ?? row.skin_tones ?? []) as SkinTone[];
  const badges = (row.badges ?? []) as string[];
  const benefits = (row.benefits ?? []) as string[];

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    category: row.category as Category,
    price: Number(row.price),
    originalPrice: row.originalPrice != null ? Number(row.originalPrice) : (row.original_price != null ? Number(row.original_price) : undefined),
    images: Array.isArray(images) ? images.filter(Boolean) : [],
    skinTones: Array.isArray(skinTones) ? skinTones : [],
    badges: Array.isArray(badges) ? badges : [],
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.reviewCount ?? row.review_count ?? 0),
    shortDescription: String(row.shortDescription ?? row.short_description ?? ''),
    description: String(row.description ?? ''),
    benefits: Array.isArray(benefits) ? benefits : [],
    usage: String(row.usage ?? ''),
    ingredients: row.ingredients != null ? String(row.ingredients) : undefined,
    inStock: row.inStock != null ? Boolean(row.inStock) : Boolean(row.in_stock ?? true),
    stockQty: row.stockQty != null ? Number(row.stockQty) : (row.stock_qty != null ? Number(row.stock_qty) : undefined),
    lowStockThreshold: row.lowStockThreshold != null ? Number(row.lowStockThreshold) : (row.low_stock_threshold != null ? Number(row.low_stock_threshold) : undefined),
    newArrival: Boolean(row.isNew ?? row.newArrival ?? row.is_new),
    bestseller: Boolean(row.isBestseller ?? row.bestseller ?? row.is_bestseller),
    resultsTitle: row.resultsTitle != null ? String(row.resultsTitle) : (row.results_title != null ? String(row.results_title) : undefined),
    resultsSubtitle: row.resultsSubtitle != null ? String(row.resultsSubtitle) : (row.results_subtitle != null ? String(row.results_subtitle) : undefined),
  };
}

export function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    author: String(row.author),
    rating: Number(row.rating),
    comment: String(row.comment ?? row.text ?? ''),
    date: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    skinTone: (row.skinTone ?? row.skin_tone) as SkinTone | undefined,
    verified: Boolean(row.verified),
  };
}
