'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SkinTone, SKIN_TONES, Product } from '@/types';
import { fetchActiveConcerns, fetchActiveRoutines } from '@/lib/quiz-db';
import ProductCard from '@/components/ui/ProductCard';
import styles from './quiz.module.css';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { QuizHeroConfig } from '@/lib/site-config';


type QuizStep = 'welcome' | 'q1' | 'q2' | 'q3' | 'result';

interface QuizAnswers {
  skinTone?: SkinTone;
  concern?: string;
  routine?: string;
}

type QuizItem = { id: string; label: string; meta: string; glyph: string };

const DEFAULT_CONCERNS: QuizItem[] = [
  { id: 'taches',       label: 'Taches & hyperpigmentation', meta: 'Unifier le grain de peau',     glyph: '◐' },
  { id: 'eclat',        label: 'Manque d\u2019éclat',         meta: 'Réveiller la luminosité',      glyph: '☼' },
  { id: 'hydratation',  label: 'Peau sèche, déshydratée',     meta: 'Restaurer le confort',         glyph: '◌' },
  { id: 'unification',  label: 'Teint irrégulier',            meta: 'Harmoniser la carnation',      glyph: '◯' },
  { id: 'antiage',      label: 'Anti-âge, fermeté',           meta: 'Lisser & raffermir',           glyph: '❋' },
];

const DEFAULT_ROUTINES: QuizItem[] = [
  { id: 'simple',    label: 'Routine essentielle',  meta: '1 à 2 produits — geste minimaliste',   glyph: '◇' },
  { id: 'complete',  label: 'Routine complète',     meta: '3 à 5 produits — rituel quotidien',    glyph: '◆' },
  { id: 'intensive', label: 'Programme intensif',   meta: '6 produits & plus — soin sur-mesure',  glyph: '✧' },
];

const STEPS: QuizStep[] = ['welcome', 'q1', 'q2', 'q3', 'result'];

export default function QuizPage() {
  const [step, setStep] = useState<QuizStep>('welcome');
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [concerns, setConcerns] = useState<QuizItem[]>(DEFAULT_CONCERNS);
  const [routines, setRoutines] = useState<QuizItem[]>(DEFAULT_ROUTINES);
  const [hero, setHero] = useState<QuizHeroConfig>(DEFAULT_SITE_CONFIG.hero_quiz);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    fetchActiveConcerns().then(data => { if (data.length) setConcerns(data); }).catch(() => {});
    fetchActiveRoutines().then(data => { if (data.length) setRoutines(data); }).catch(() => {});
    fetch('/api/config/hero_quiz')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHero(d.value as QuizHeroConfig); })
      .catch(() => {});
  }, []);

  // Fetch recommandations via API quand on arrive sur "result"
  useEffect(() => {
    if (step !== 'result' || !answers.skinTone) {
      setRecommendations([]);
      return;
    }
    const params = new URLSearchParams({ skinTone: answers.skinTone, limit: '4' });
    fetch(`/api/products?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Product[]) => setRecommendations(data.slice(0, 4)))
      .catch(() => setRecommendations([]));
  }, [step, answers.skinTone]);

  useEffect(() => {
    if (step !== 'result') return;
    if (!answers.skinTone && !answers.concern && !answers.routine) return;
    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skin_tone: answers.skinTone, concern: answers.concern, routine: answers.routine }),
    }).catch(() => {});
  }, [step, answers.skinTone, answers.concern, answers.routine]);

  const stepIdx = STEPS.indexOf(step);
  const isQuestion = step === 'q1' || step === 'q2' || step === 'q3';
  const questionNum = isQuestion ? STEPS.indexOf(step) : 0;
  const progress = isQuestion ? (questionNum / 3) * 100 : 0;

  const goTo = (next: QuizStep, patch?: Partial<QuizAnswers>) => {
    if (patch) setAnswers(prev => ({ ...prev, ...patch }));
    setStep(next);
  };

  const goBack = () => {
    const prev = STEPS[Math.max(0, stepIdx - 1)];
    setStep(prev);
  };

  const reset = () => {
    setAnswers({});
    setStep('welcome');
  };

  // recommendations est maintenant géré par useEffect (état API)

  const concernLabel  = concerns.find(c => c.id === answers.concern)?.label ?? '—';
  const routineLabel  = routines.find(r => r.id === answers.routine)?.label ?? '—';
  const skinToneLabel = SKIN_TONES.find(t => t.id === answers.skinTone)?.label ?? '—';

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <div className={styles.shell}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <nav className={styles.crumbs} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className={styles.crumbsSep}>›</span>
            <span className={styles.crumbsCurrent}>Diagnostic beauté</span>
          </nav>
          {step !== 'welcome' && (
            <button type="button" className={styles.exitLink} onClick={reset}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Quitter
            </button>
          )}
        </div>

        {/* PROGRESS RAIL — questions only */}
        {isQuestion && (
          <div className={styles.progressRail} aria-hidden="true">
            <span className={styles.progressLabel}>0{questionNum}</span>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>03</span>
          </div>
        )}

        {/* WELCOME */}
        {step === 'welcome' && (
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
                <button type="button" className={styles.btnPrimary} onClick={() => goTo('q1')}>
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
        )}

        {/* Q1 — Carnation */}
        {step === 'q1' && (
          <section className={styles.question}>
            <aside className={styles.questionAside}>
              <div className={styles.questionNum}>
                01<span className={styles.questionNumOf}>/03</span>
              </div>
              <div className={styles.questionEyebrow}>Carnation</div>
              <h2 className={styles.questionTitle}>Quel est votre teint&nbsp;?</h2>
              <p className={styles.questionHint}>
                Sélectionnez la nuance la plus proche de votre peau. Cela calibre l&apos;intensité
                des actifs et la palette de soins recommandée.
              </p>
            </aside>

            <div className={`${styles.options} ${styles.optionsGrid}`}>
              {SKIN_TONES.map(tone => (
                <button
                  key={tone.id}
                  type="button"
                  className={styles.option}
                  onClick={() => goTo('q2', { skinTone: tone.id })}
                >
                  <span className={styles.optionToneSwatch} style={{ background: tone.color }} aria-hidden="true" />
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{tone.label}</span>
                    <span className={styles.optionMeta}>{tone.description}</span>
                  </span>
                  <svg className={styles.optionArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Q2 — Préoccupation */}
        {step === 'q2' && (
          <section className={styles.question}>
            <aside className={styles.questionAside}>
              <div className={styles.questionNum}>
                02<span className={styles.questionNumOf}>/03</span>
              </div>
              <div className={styles.questionEyebrow}>Besoin prioritaire</div>
              <h2 className={styles.questionTitle}>Que souhaitez-vous travailler&nbsp;?</h2>
              <p className={styles.questionHint}>
                Une seule préoccupation à la fois — c&apos;est ainsi qu&apos;on obtient les meilleurs
                résultats. Vous pourrez affiner ensuite.
              </p>
              <button type="button" className={styles.questionBack} onClick={goBack}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour
              </button>
            </aside>

            <div className={styles.options}>
              {concerns.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.option}
                  onClick={() => goTo('q3', { concern: c.id })}
                >
                  <span className={styles.optionGlyph} aria-hidden="true">{c.glyph}</span>
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{c.label}</span>
                    <span className={styles.optionMeta}>{c.meta}</span>
                  </span>
                  <svg className={styles.optionArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Q3 — Routine */}
        {step === 'q3' && (
          <section className={styles.question}>
            <aside className={styles.questionAside}>
              <div className={styles.questionNum}>
                03<span className={styles.questionNumOf}>/03</span>
              </div>
              <div className={styles.questionEyebrow}>Profondeur du rituel</div>
              <h2 className={styles.questionTitle}>Quelle routine vous ressemble&nbsp;?</h2>
              <p className={styles.questionHint}>
                Le bon rituel est celui que vous tenez dans la durée. Choisissez en fonction
                du temps que vous voulez vous accorder.
              </p>
              <button type="button" className={styles.questionBack} onClick={goBack}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour
              </button>
            </aside>

            <div className={styles.options}>
              {routines.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={styles.option}
                  onClick={() => goTo('result', { routine: r.id })}
                >
                  <span className={styles.optionGlyph} aria-hidden="true">{r.glyph}</span>
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{r.label}</span>
                    <span className={styles.optionMeta}>{r.meta}</span>
                  </span>
                  <svg className={styles.optionArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* RESULT */}
        {step === 'result' && (
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
              <button type="button" className={styles.btnGhost} onClick={reset}>
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
        )}
      </div>
    </div>
  );
}
