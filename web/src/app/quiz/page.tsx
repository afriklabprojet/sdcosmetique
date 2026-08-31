'use client';

/*
 * Diagnostic beauté. Apres la vague `split` (F-116) la page tient l'etat du
 * parcours et le chassis — fil d'Ariane, barre de progression — et delegue
 * chaque ecran aux etapes de `features/quiz/steps/`.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/shared/types/domain.type';
import { fetchActiveConcerns, fetchActiveRoutines, fetchActiveSkinTones } from '@/features/quiz/quiz.repository';
import { submitQuiz } from '@/shared/api/quiz';
import { fetchSiteConfigSection } from '@/features/site-config/site-config.util';
import styles from '@/features/quiz/quiz.module.css';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { QuizHeroConfig } from '@/features/site-config/site-config.type';
import type { QuizAnswers, QuizItem, QuizOption, QuizStep } from '@/features/quiz/quiz.type';
import { DEFAULT_CONCERNS, DEFAULT_ROUTINES, DEFAULT_SKIN_TONES, EMPTY_RECOMMENDATIONS, STEPS, TONE_SWATCH } from '@/features/quiz/quiz.constant';
import WelcomeStep from '@/features/quiz/steps/welcome.step';
import QuestionStep from '@/features/quiz/steps/question.step';
import ResultStep from '@/features/quiz/steps/result.step';

/** Les items configurables portent un glyphe, les carnations une couleur. */
const toOptions = (items: QuizItem[]): QuizOption[] => items;

export default function QuizPage() {
  const [step, setStep] = useState<QuizStep>('welcome');
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [concerns, setConcerns] = useState<QuizItem[]>(DEFAULT_CONCERNS);
  const [routines, setRoutines] = useState<QuizItem[]>(DEFAULT_ROUTINES);
  const [tones, setTones] = useState<QuizItem[]>(DEFAULT_SKIN_TONES);
  const [hero, setHero] = useState<QuizHeroConfig>(DEFAULT_SITE_CONFIG.hero_quiz);
  // Les recommandations sont mémorisées avec la teinte qui les a produites :
  // hors de l'étape "result" (ou sur un autre teint) on retombe sur [] au rendu,
  // sans avoir à les réinitialiser via setState dans un effet.
  const [reco, setReco] = useState<{ skinTone: string; items: Product[] } | null>(null);
  const recoSkinTone = step === 'result' ? answers.skinTone : null;
  const recommendations = recoSkinTone && reco?.skinTone === recoSkinTone ? reco.items : EMPTY_RECOMMENDATIONS;

  useEffect(() => {
    fetchActiveConcerns().then(data => { if (data.length) setConcerns(data); }).catch(() => {});
    fetchActiveRoutines().then(data => { if (data.length) setRoutines(data); }).catch(() => {});
    fetchActiveSkinTones().then(data => { if (data.length) setTones(data); }).catch(() => {});
    fetchSiteConfigSection('hero_quiz').then(setHero).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 'result' || !recoSkinTone) return;

    const payload = [
      answers.skinTone ? { question: 'skin_tone', option: answers.skinTone } : null,
      answers.concern ? { question: 'skin_concern', option: answers.concern } : null,
      answers.routine ? { question: 'routine', option: answers.routine } : null,
    ].filter((row): row is { question: string; option: string } => row !== null);

    if (!payload.length) return;

    let active = true;
    submitQuiz({ answers: payload })
      .then((result) => {
        if (active) setReco({ skinTone: recoSkinTone, items: result.recommendations });
      })
      .catch(() => {
        if (active) setReco({ skinTone: recoSkinTone, items: [] });
      });

    return () => {
      active = false;
    };
  }, [step, recoSkinTone, answers.skinTone, answers.concern, answers.routine]);

  const stepIdx = STEPS.indexOf(step);
  const question = step === 'q1' || step === 'q2' || step === 'q3';
  const questionNum = question ? STEPS.indexOf(step) : 0;
  const progress = question ? (questionNum / 3) * 100 : 0;

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

  const toneOptions: QuizOption[] = tones.map(t => ({
    id: t.id,
    label: t.label,
    meta: t.meta,
    swatchColor: TONE_SWATCH[t.id],
  }));

  const concernLabel  = concerns.find(c => c.id === answers.concern)?.label ?? '—';
  const routineLabel  = routines.find(r => r.id === answers.routine)?.label ?? '—';
  const skinToneLabel = tones.find(t => t.id === answers.skinTone)?.label ?? '—';

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
        {question && (
          <div className={styles.progressRail} aria-hidden="true">
            <span className={styles.progressLabel}>0{questionNum}</span>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>03</span>
          </div>
        )}

        {step === 'welcome' && (
          <WelcomeStep hero={hero} start={() => goTo('q1')} />
        )}

        {/* Q1 — Carnation */}
        {step === 'q1' && (
          <QuestionStep
            num="01"
            eyebrow="Carnation"
            title={<>Quel est votre teint&nbsp;?</>}
            hint={<>Sélectionnez la nuance la plus proche de votre peau. Cela calibre l&apos;intensité des actifs et la palette de soins recommandée.</>}
            options={toneOptions}
            selectOption={id => goTo('q2', { skinTone: id })}
            grid
          />
        )}

        {/* Q2 — Préoccupation */}
        {step === 'q2' && (
          <QuestionStep
            num="02"
            eyebrow="Besoin prioritaire"
            title={<>Que souhaitez-vous travailler&nbsp;?</>}
            hint={<>Une seule préoccupation à la fois — c&apos;est ainsi qu&apos;on obtient les meilleurs résultats. Vous pourrez affiner ensuite.</>}
            options={toOptions(concerns)}
            selectOption={id => goTo('q3', { concern: id })}
            back={goBack}
          />
        )}

        {/* Q3 — Routine */}
        {step === 'q3' && (
          <QuestionStep
            num="03"
            eyebrow="Profondeur du rituel"
            title={<>Quelle routine vous ressemble&nbsp;?</>}
            hint={<>Le bon rituel est celui que vous tenez dans la durée. Choisissez en fonction du temps que vous voulez vous accorder.</>}
            options={toOptions(routines)}
            selectOption={id => goTo('result', { routine: id })}
            back={goBack}
          />
        )}

        {step === 'result' && (
          <ResultStep
            skinToneLabel={skinToneLabel}
            concernLabel={concernLabel}
            routineLabel={routineLabel}
            recommendations={recommendations}
            restart={reset}
          />
        )}
      </div>
    </div>
  );
}
