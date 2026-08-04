/*
 * Valeurs de repli du diagnostic, utilisees tant que l'admin n'a rien
 * configure. Extraites de `app/quiz/page.tsx` (F-116).
 */
import type { QuizItem, QuizStep } from '@/features/quiz/quiz.type';
import type { Product } from '@/shared/types/domain.type';

export const DEFAULT_CONCERNS: QuizItem[] = [
  { id: 'taches',       label: 'Taches & hyperpigmentation', meta: 'Unifier le grain de peau',     glyph: '◐' },
  { id: 'eclat',        label: 'Manque d’éclat',         meta: 'Réveiller la luminosité',      glyph: '☼' },
  { id: 'hydratation',  label: 'Peau sèche, déshydratée',     meta: 'Restaurer le confort',         glyph: '◌' },
  { id: 'unification',  label: 'Teint irrégulier',            meta: 'Harmoniser la carnation',      glyph: '◯' },
  { id: 'antiage',      label: 'Anti-âge, fermeté',           meta: 'Lisser & raffermir',           glyph: '❋' },
];

export const DEFAULT_ROUTINES: QuizItem[] = [
  { id: 'simple',    label: 'Routine essentielle',  meta: '1 à 2 produits — geste minimaliste',   glyph: '◇' },
  { id: 'complete',  label: 'Routine complète',     meta: '3 à 5 produits — rituel quotidien',    glyph: '◆' },
  { id: 'intensive', label: 'Programme intensif',   meta: '6 produits & plus — soin sur-mesure',  glyph: '✧' },
];

export const STEPS: QuizStep[] = ['welcome', 'q1', 'q2', 'q3', 'result'];

// Référence stable : évite de recréer un tableau vide à chaque rendu.
export const EMPTY_RECOMMENDATIONS: Product[] = [];
