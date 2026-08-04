'use client';

/*
 * Ecran d'accueil du diagnostic. Extrait de `app/quiz/page.tsx` (F-116).
 */

import Image from 'next/image';
import Link from 'next/link';
import type { QuizHeroConfig } from '@/features/site-config/site-config.type';
import styles from '@/features/quiz/quiz.module.css';

interface WelcomeStepProps {
  readonly hero: QuizHeroConfig;
  readonly onStart: () => void;
}

export default function WelcomeStep({ hero, onStart }: WelcomeStepProps) {
  return (
          <section className={styles.welcome}>
            <div className={styles.welcomeText}>
              <span className={styles.welcomeEyebrow}>{hero.eyebrow}</span>
              <h1 className={styles.welcomeTitle}>
                {hero.title}
                <span className={styles.welcomeTitleAccent}>{hero.titleAccent}</span>
              </h1>
              <p className={styles.welcomeLede}>
                {hero.lead}
              </p>

              <div className={styles.welcomeMeta}>
                <div className={styles.welcomeMetaItem}>
                  <span className={styles.welcomeMetaNum}>3</span>
                  <span className={styles.welcomeMetaLabel}>Questions</span>
                </div>
                <div className={styles.welcomeMetaItem}>
                  <span className={styles.welcomeMetaNum}>2 min</span>
                  <span className={styles.welcomeMetaLabel}>Temps</span>
                </div>
                <div className={styles.welcomeMetaItem}>
                  <span className={styles.welcomeMetaNum}>4</span>
                  <span className={styles.welcomeMetaLabel}>Soins suggérés</span>
                </div>
              </div>

              <div className={styles.welcomeActions}>
                <button type="button" className={styles.btnPrimary} onClick={onStart}>
                  Commencer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <Link href="/categorie/gammes" className={styles.btnGhost}>
                  Voir nos gammes
                </Link>
              </div>
            </div>

            <div className={styles.welcomeVisual}>
              <div className={styles.welcomeVisualMain}>
                <Image
                  src={hero.image}
                  alt="Rituel beauté SD Cosmétique"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className={styles.welcomeFloater}>
                <div className={styles.welcomeFloaterLabel}>{hero.floaterLabel}</div>
                <p className={styles.welcomeFloaterText}>
                  {hero.floaterText}
                </p>
              </div>
            </div>
          </section>
  );
}
