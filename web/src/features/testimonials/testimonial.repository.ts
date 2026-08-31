import {
  fetchApprovedTestimonials as fetchApproved,
  fetchAdminTestimonials,
  submitTestimonial as postTestimonial,
  patchAdminTestimonial,
  deleteAdminTestimonial,
  type TestimonialRow,
} from '@/shared/api/testimonials';

export type { TestimonialRow };

export async function fetchApprovedTestimonials(): Promise<TestimonialRow[]> {
  return fetchApproved();
}

export async function fetchAllTestimonialsAdmin(): Promise<TestimonialRow[]> {
  return fetchAdminTestimonials();
}

export async function submitTestimonial(data: {
  name: string;
  text: string;
  avatar_url?: string;
}): Promise<{ error?: string }> {
  return postTestimonial(data);
}

export async function approveTestimonial(id: string, approved: boolean): Promise<void> {
  await patchAdminTestimonial(id, approved);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteAdminTestimonial(id);
}
