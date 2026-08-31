/*
 * Vocabulaire du diagnostic. Extrait de `app/quiz/page.tsx` (F-116) : la page
 * et les quatre etapes le partagent depuis la vague `split`.
 */

export type QuizStep = 'welcome' | 'q1' | 'q2' | 'q3' | 'result';

export interface QuizAnswers {
  skinTone?: string;
  concern?: string;
  routine?: string;
}

export type QuizItem = { id: string; label: string; meta: string; glyph: string };

/** Une option affichable : soit une pastille de teint, soit un glyphe. */
export type QuizOption = {
  id: string;
  label: string;
  meta: string;
  glyph?: string;
  swatchColor?: string;
};
