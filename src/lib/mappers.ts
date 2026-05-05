/**
 * mappers.ts — Convertisseurs DB row → types métier.
 * Ce fichier est isomorphe : importable côté client ET serveur.
 */
import type { Product, SkinTone, Category, Review } from '@/types';

export function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    category: row.category as Category,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    images: ((row.images as string[]) ?? []).filter(Boolean),
    skinTones: (row.skin_tones as SkinTone[]) ?? [],
    badges: (row.badges as string[]) ?? [],
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    shortDescription: row.short_description != null ? String(row.short_description) : '',
    description: row.description != null ? String(row.description) : '',
    benefits: (row.benefits as string[]) ?? [],
    usage: row.usage != null ? String(row.usage) : '',
    ingredients: row.ingredients != null ? String(row.ingredients) : undefined,
    inStock: Boolean(row.in_stock),
    stockQty: row.stock_qty != null ? Number(row.stock_qty) : undefined,
    lowStockThreshold: row.low_stock_threshold != null ? Number(row.low_stock_threshold) : undefined,
    isNew: Boolean(row.is_new),
    isBestseller: Boolean(row.is_bestseller),
    resultsTitle: row.results_title != null ? String(row.results_title) : undefined,
    resultsSubtitle: row.results_subtitle != null ? String(row.results_subtitle) : undefined,
  };
}

export function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    author: String(row.author),
    rating: Number(row.rating),
    comment: row.comment != null ? String(row.comment) : '',
    date: String(row.created_at),
    skinTone: (row.skin_tone as SkinTone) ?? undefined,
    verified: Boolean(row.verified),
  };
}
