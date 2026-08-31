import { api, unwrapData } from '@/shared/api/client';
import type { Review } from '@/shared/types/domain.type';

export type LaravelReview = {
  id: number;
  author: string;
  city: string | null;
  rating: number;
  title: string | null;
  comment: string;
  skin_tone: string | null;
  verified: boolean;
  approved?: boolean;
  product_id: number;
  product_slug: string | null;
  product: string | null;
  created_at: string;
};

export type ReviewRow = Review & {
  productId?: string;
  productName?: string;
  city?: string;
  title?: string;
  verified: boolean;
};

function mapReview(row: LaravelReview): ReviewRow {
  return {
    id: String(row.id),
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    date: row.created_at,
    skinTone: (row.skin_tone as ReviewRow['skinTone']) ?? undefined,
    verified: row.approved ?? row.verified,
    productId: row.product_slug ?? undefined,
    productName: row.product ?? undefined,
    city: row.city ?? undefined,
    title: row.title ?? undefined,
  };
}

export async function fetchReviews(product?: string): Promise<ReviewRow[]> {
  try {
    const query = product ? `?product=${encodeURIComponent(product)}` : '';
    const body = await api<{ data: LaravelReview[] }>(`/reviews${query}`);
    return unwrapData(body).map(mapReview);
  } catch {
    return [];
  }
}

export async function submitReview(input: {
  product: string;
  author: string;
  rating: number;
  comment: string;
  city?: string;
}): Promise<ReviewRow> {
  const body = await api<{ data: LaravelReview }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return mapReview(unwrapData(body));
}

export async function fetchAdminReviews(): Promise<ReviewRow[]> {
  const body = await api<{ data: LaravelReview[] }>('/admin/reviews');
  return unwrapData(body).map(mapReview);
}

export async function patchAdminReview(id: string, flags: { approved?: boolean; verified?: boolean }): Promise<void> {
  await api(`/admin/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(flags),
  });
}

export async function deleteAdminReview(id: string): Promise<void> {
  await api(`/admin/reviews/${id}`, { method: 'DELETE' });
}
