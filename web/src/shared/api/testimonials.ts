import { api, unwrapData } from '@/shared/api/client';

export type TestimonialRow = {
  id: string;
  name: string;
  text: string;
  avatar_url: string;
  approved: boolean;
  created_at: string;
};

type LaravelTestimonial = {
  id: number;
  name: string;
  text: string;
  avatar_url: string | null;
  approved?: boolean;
  created_at: string;
};

function mapRow(row: LaravelTestimonial): TestimonialRow {
  return {
    id: String(row.id),
    name: row.name,
    text: row.text,
    avatar_url: row.avatar_url ?? '',
    approved: Boolean(row.approved),
    created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
  };
}

export async function fetchApprovedTestimonials(): Promise<TestimonialRow[]> {
  try {
    const body = await api<{ data: LaravelTestimonial[] }>('/testimonials', {
      next: { revalidate: 60, tags: ['testimonials'] },
    } as RequestInit);
    return unwrapData(body).map((row) => ({ ...mapRow(row), approved: true }));
  } catch {
    return [];
  }
}

export async function submitTestimonial(input: {
  name: string;
  text: string;
  avatar_url?: string;
}): Promise<{ error?: string }> {
  try {
    await api('/testimonials', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function fetchAdminTestimonials(): Promise<TestimonialRow[]> {
  const body = await api<{ data: LaravelTestimonial[] }>('/admin/testimonials');
  return unwrapData(body).map(mapRow);
}

export async function patchAdminTestimonial(id: string, approved: boolean): Promise<void> {
  await api(`/admin/testimonials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ approved }),
  });
}

export async function deleteAdminTestimonial(id: string): Promise<void> {
  await api(`/admin/testimonials/${id}`, { method: 'DELETE' });
}
