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
    originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    images: ((row.images as string[]) ?? []).filter(Boolean),
    skinTones: (row.skin_tones as SkinTone[]) ?? [],
    badges: (row.badges as string[]) ?? [],
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    shortDescription: row.short_description == null ? '' : (row.short_description as string),
    description: row.description == null ? '' : (row.description as string),
    benefits: (row.benefits as string[]) ?? [],
    usage: row.usage == null ? '' : (row.usage as string),
    ingredients: row.ingredients == null ? undefined : (row.ingredients as string),
    inStock: Boolean(row.in_stock),
    stockQty: row.stock_qty == null ? undefined : Number(row.stock_qty),
    lowStockThreshold: row.low_stock_threshold == null ? undefined : Number(row.low_stock_threshold),
    isNew: Boolean(row.is_new),
    isBestseller: Boolean(row.is_bestseller),
    resultsTitle: row.results_title == null ? undefined : (row.results_title as string),
    resultsSubtitle: row.results_subtitle == null ? undefined : (row.results_subtitle as string),
  };
}

export function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    author: String(row.author),
    rating: Number(row.rating),
    comment: row.comment == null ? '' : (row.comment as string),
    date: String(row.created_at),
    skinTone: (row.skin_tone as SkinTone) ?? undefined,
    verified: Boolean(row.verified),
  };
}
