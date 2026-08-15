'use client';

/*
 * Une question du diagnostic. Extrait de `app/quiz/page.tsx` (F-116).
 *
 * La page rendait trois fois le meme balisage — un aside de cadrage, une liste
 * d'options cliquables — et n'en variait que le numero, les textes, la source
 * des options et la presence du bouton retour. La q1 pose une pastille de
 * couleur la ou les q2/q3 posent un glyphe : c'est la seule difference de
 * rendu, et `QuizOption` la porte.
 */

import type { QuizOption } from '@/features/quiz/quiz.type';
import styles from '@/features/quiz/quiz.module.css';

interface QuestionStepProps {
  /** Numero affiche, deja formate : '01', '02', '03'. */
  readonly num: string;
  readonly eyebrow: string;
  readonly title: React.ReactNode;
  readonly hint: React.ReactNode;
  readonly options: QuizOption[];
  readonly selectOption: (id: string) => void;
  /** Absent sur la premiere question : il n'y a nulle part ou revenir. */
  readonly back?: () => void;
  /** La carnation s'affiche en grille, les listes textuelles en colonne. */
  readonly grid?: boolean;
}

export default function QuestionStep({ num, eyebrow, title, hint, options, selectOption, back, grid = false }: QuestionStepProps) {
  return (
          <section className={styles.question}>
            <aside className={styles.questionAside}>
              <div className={styles.questionNum}>
                {num}<span className={styles.questionNumOf}>/03</span>
              </div>
              <div className={styles.questionEyebrow}>{eyebrow}</div>
              <h2 className={styles.questionTitle}>{title}</h2>
              <p className={styles.questionHint}>{hint}</p>
              {back && (
                <button type="button" className={styles.questionBack} onClick={back}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Retour
                </button>
              )}
            </aside>

            <div className={grid ? `${styles.options} ${styles.optionsGrid}` : styles.options}>
              {options.map(o => (
                <button
                  key={o.id}
                  type="button"
                  className={styles.option}
                  onClick={() => selectOption(o.id)}
                >
                  {o.swatchColor
                    ? <span className={styles.optionToneSwatch} style={{ background: o.swatchColor }} aria-hidden="true" />
                    : <span className={styles.optionGlyph} aria-hidden="true">{o.glyph}</span>}
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{o.label}</span>
                    <span className={styles.optionMeta}>{o.meta}</span>
                  </span>
                  <svg className={styles.optionArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
  );
}
