import { fetchReviews, fetchAdminReviews, patchAdminReview, deleteAdminReview, type ReviewRow } from '@/shared/api/reviews';

export type { ReviewRow };

export async function fetchAllReviews(): Promise<ReviewRow[]> {
  return fetchAdminReviews();
}

export async function deleteReview(id: string): Promise<void> {
  await deleteAdminReview(id);
}

export async function approveReview(id: string, verified: boolean): Promise<void> {
  await patchAdminReview(id, { approved: verified, verified });
}

export { fetchReviews };
