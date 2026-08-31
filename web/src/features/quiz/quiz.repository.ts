import {
  fetchAdminQuizQuestions,
  fetchQuizQuestions,
  itemsFromQuestion,
  saveAdminQuizQuestion,
  type LaravelQuizOption,
  type LaravelQuizQuestion,
  type QuizConcern,
  type QuizRoutine,
} from '@/shared/api/quiz';

export type { QuizConcern, QuizRoutine };

const CONCERN_SLUG = 'skin_concern';
const ROUTINE_SLUG = 'routine';
const TONE_SLUG = 'skin_tone';

function toPayload(option: LaravelQuizOption): {
  id?: number;
  label: string;
  description: string | null;
  value_code: string;
  glyph: string | null;
  sort_order: number;
  archived?: boolean;
} {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    value_code: option.value_code,
    glyph: option.glyph,
    sort_order: option.sort_order,
    archived: option.archived,
  };
}

function questionBySlug(questions: LaravelQuizQuestion[], slug: string): LaravelQuizQuestion {
  const question = questions.find((row) => row.slug === slug);
  if (!question) {
    throw new Error(`Quiz question "${slug}" is missing`);
  }
  return question;
}

export async function fetchActiveConcerns(): Promise<QuizConcern[]> {
  const questions = await fetchQuizQuestions();
  return itemsFromQuestion(questions, CONCERN_SLUG).filter((item) => item.active);
}

export async function fetchActiveRoutines(): Promise<QuizRoutine[]> {
  const questions = await fetchQuizQuestions();
  return itemsFromQuestion(questions, ROUTINE_SLUG).filter((item) => item.active);
}

export async function fetchActiveSkinTones(): Promise<QuizConcern[]> {
  const questions = await fetchQuizQuestions();
  return itemsFromQuestion(questions, TONE_SLUG).filter((item) => item.active);
}

export async function fetchAllConcernsAdmin(): Promise<QuizConcern[]> {
  const questions = await fetchAdminQuizQuestions();
  return itemsFromQuestion(questions, CONCERN_SLUG);
}

export async function fetchAllRoutinesAdmin(): Promise<QuizRoutine[]> {
  const questions = await fetchAdminQuizQuestions();
  return itemsFromQuestion(questions, ROUTINE_SLUG);
}

async function persistOption(slug: string, item: QuizConcern): Promise<void> {
  const question = questionBySlug(await fetchAdminQuizQuestions(), slug);
  const options = question.options.map(toPayload);
  const index = options.findIndex((option) => option.value_code === item.id);
  const next = {
    label: item.label,
    description: item.meta,
    value_code: item.id,
    glyph: item.glyph,
    sort_order: item.sort_order,
    archived: !item.active,
  };
  if (index >= 0) {
    options[index] = { ...options[index], ...next };
  } else {
    options.push(next);
  }
  await saveAdminQuizQuestion(question, options);
}

async function removeOption(slug: string, valueCode: string): Promise<void> {
  const question = questionBySlug(await fetchAdminQuizQuestions(), slug);
  await saveAdminQuizQuestion(
    question,
    question.options.filter((option) => option.value_code !== valueCode).map(toPayload),
  );
}

export async function upsertConcern(concern: QuizConcern): Promise<void> {
  await persistOption(CONCERN_SLUG, concern);
}

export async function upsertRoutine(routine: QuizRoutine): Promise<void> {
  await persistOption(ROUTINE_SLUG, routine);
}

export async function deleteConcern(id: string): Promise<void> {
  await removeOption(CONCERN_SLUG, id);
}

export async function deleteRoutine(id: string): Promise<void> {
  await removeOption(ROUTINE_SLUG, id);
}
