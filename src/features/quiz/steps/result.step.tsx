'use client';

/*
 * Restitution du diagnostic : recapitulatif des trois reponses et selection de
 * soins. Extrait de `app/quiz/page.tsx` (F-116).
 */

import Link from 'next/link';
import type { Product } from '@/shared/types/domain.type';
import ProductCard from '@/features/catalog/cards/product.card';
import styles from '@/features/quiz/quiz.module.css';

interface ResultStepProps {
  readonly skinToneLabel: string;
  readonly concernLabel: string;
  readonly routineLabel: string;
  readonly recommendations: Product[];
  readonly restart: () => void;
}

export default function ResultStep({ skinToneLabel, concernLabel, routineLabel, recommendations, restart }: ResultStepProps) {
  return (
          <section className={styles.result}>
            <header className={styles.resultHeader}>
              <span className={styles.resultBadge}>Votre diagnostic</span>
              <h2 className={styles.resultTitle}>
                {'Votre rituel, composé sur-mesure '}
                <span className={styles.resultTitleAccent}>par nos experts.</span>
              </h2>
              <p className={styles.resultLede}>
                Voici une sélection de soins SD Cosmétique alignés avec votre profil.
                Glissez-les dans votre routine ou ajoutez-les au panier en un geste.
              </p>
            </header>

            <div className={styles.recap}>
              <div className={styles.recapItem}>
                <div className={styles.recapLabel}>Carnation</div>
                <div className={styles.recapValue}><em>{skinToneLabel}</em></div>
              </div>
              <div className={styles.recapItem}>
                <div className={styles.recapLabel}>Besoin</div>
                <div className={styles.recapValue}>{concernLabel}</div>
              </div>
              <div className={styles.recapItem}>
                <div className={styles.recapLabel}>Rituel</div>
                <div className={styles.recapValue}>{routineLabel}</div>
              </div>
            </div>

            <h3 className={styles.resultSectionTitle}>Sélection recommandée</h3>

            {recommendations.length > 0 ? (
              <div className={styles.resultGrid}>
                {recommendations.map(product => (
                  <div key={product.id} className={styles.resultGridItem}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.resultEmpty}>
                <p className={styles.resultEmptyText}>
                  Aucun produit ne correspond précisément. Découvrez l&apos;ensemble de nos gammes.
                </p>
              </div>
            )}

            <div className={styles.resultActions}>
              <button type="button" className={styles.btnGhost} onClick={restart}>
                Refaire le diagnostic
              </button>
              <Link href="/categorie/gammes" className={styles.btnPrimary}>
                Explorer toutes les gammes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </section>
  );
}
