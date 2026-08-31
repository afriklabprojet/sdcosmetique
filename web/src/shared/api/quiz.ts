import { api, unwrapData } from '@/shared/api/client';
import type { QuizItem } from '@/features/quiz/quiz.type';
import type { Product } from '@/shared/types/domain.type';
import { mapStorefrontProduct } from '@/shared/api/mappers/product';
import type { LaravelStorefrontProduct } from '@/shared/api/types';

export type LaravelQuizOption = {
  id: number;
  label: string;
  description: string | null;
  value_code: string;
  glyph: string | null;
  sort_order: number;
  archived?: boolean;
};

export type LaravelQuizQuestion = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  question_type: string;
  sort_order: number;
  archived?: boolean;
  options: LaravelQuizOption[];
};

export type QuizConcern = QuizItem & { sort_order: number; active: boolean };
export type QuizRoutine = QuizConcern;

function optionToItem(option: LaravelQuizOption): QuizConcern {
  return {
    id: option.value_code,
    label: option.label,
    meta: option.description ?? '',
    glyph: option.glyph ?? '◯',
    sort_order: option.sort_order,
    active: !option.archived,
  };
}

export async function fetchQuizQuestions(): Promise<LaravelQuizQuestion[]> {
  try {
    const body = await api<{ data: LaravelQuizQuestion[] }>('/quiz-questions');
    return unwrapData(body);
  } catch {
    return [];
  }
}

export function itemsFromQuestion(questions: LaravelQuizQuestion[], slug: string): QuizConcern[] {
  const question = questions.find((row) => row.slug === slug);
  return (question?.options ?? []).map(optionToItem);
}

export async function submitQuiz(input: {
  email?: string;
  first_name?: string;
  phone?: string;
  answers: { question: string; option: string }[];
}): Promise<{ recommendations: Product[] }> {
  const body = await api<{
    data: {
      recommendations?: LaravelStorefrontProduct[] | { data: LaravelStorefrontProduct[] };
    };
  }>('/quiz-submissions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const rec = unwrapData(body).recommendations;
  const list = Array.isArray(rec) ? rec : rec?.data ?? [];
  return { recommendations: list.map(mapStorefrontProduct) };
}

export async function fetchAdminQuizQuestions(): Promise<LaravelQuizQuestion[]> {
  const body = await api<{ data: LaravelQuizQuestion[] }>('/admin/quiz-questions');
  return unwrapData(body);
}

export async function saveAdminQuizQuestion(
  question: LaravelQuizQuestion,
  options: Array<{
    id?: number;
    label: string;
    description?: string | null;
    value_code: string;
    glyph?: string | null;
    sort_order?: number;
    archived?: boolean;
  }>,
): Promise<LaravelQuizQuestion> {
  const body = await api<{ data: LaravelQuizQuestion }>(`/admin/quiz-questions/${question.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      slug: question.slug,
      title: question.title,
      subtitle: question.subtitle,
      question_type: question.question_type,
      sort_order: question.sort_order,
      options,
    }),
  });
  return unwrapData(body);
}

export type LaravelQuizSubmission = {
  id: number;
  email: string | null;
  answers: { question: string; option: string }[];
  created_at: string;
};

export async function fetchAdminQuizSubmissions(): Promise<LaravelQuizSubmission[]> {
  const body = await api<{ data: LaravelQuizSubmission[] }>('/admin/quiz-submissions');
  return unwrapData(body);
}
