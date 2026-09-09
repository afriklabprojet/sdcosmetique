'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiErrorMessage } from '@/shared/api';
import { Session } from '@/shared/api/auth';
import { useAuthStatus } from '@/shared/hooks/auth-status.hook';
import styles from '../auth.module.css';

const RESEND_COOLDOWN_SECONDS = 45;

type LoginStep = 'email' | 'no-account' | 'choice' | 'password' | 'otp';

function EyeIcon({ open }: { readonly open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authenticated = useAuthStatus();

  useEffect(() => {
    if (authenticated) router.replace('/compte');
  }, [authenticated, router]);

  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(() => (
    searchParams.get('lien') === 'expire' ? 'Ce lien a expiré. Veuillez vous reconnecter.' : ''
  ));
  const [loading, setLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== 'otp') return;
    const timer = setInterval(() => {
      setCooldown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(timer);
  }, [step, resendAt]);

  useEffect(() => {
    if (step === 'otp') codeInputRef.current?.focus();
  }, [step]);

  const goToNext = () => {
    const next = new URLSearchParams(globalThis.location.search).get('next') ?? '/compte';
    globalThis.location.href = next;
  };

  const submitEmail = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { exists, hasPassword: withPassword } = await Session.checkEmail(email);
      setHasPassword(withPassword);
      if (!exists) {
        setStep('no-account');
      } else {
        setStep('choice');
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible de vérifier cette adresse pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await Session.requestOtp(email);
      setCode('');
      setResendAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('otp');
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'envoyer le code pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await Session.create(email, password, remember);
      goToNext();
    } catch (err) {
      setLoading(false);
      setError(apiErrorMessage(err, 'Email ou mot de passe incorrect.'));
    }
  };

  const submitOtp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await Session.verifyOtp(email, code);
      goToNext();
    } catch (err) {
      setLoading(false);
      setError(apiErrorMessage(err, 'Ce code est invalide ou a expiré.'));
    }
  };

  const backToEmail = () => {
    setStep('email');
    setError('');
    setPassword('');
    setCode('');
  };

  return (
    <div className={styles.page}>
      <aside className={styles.visual}>
        <Image
          src="/hero/model.png"
          alt="Beauté lumineuse SD Cosmétique"
          fill
          priority
          sizes="50vw"
          className={styles.visualImg}
        />
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <Link href="/" className={styles.visualTop}>
            <span className={styles.visualLogo}>SD</span>{' '}
            <span className={styles.visualName}>SD COSMETIQUE</span>
          </Link>

          <div className={styles.visualBottom}>
            <span className={styles.visualEyebrow}>Espace personnel</span>
            <h1 className={styles.visualSlogan}>
              Révélez votre éclat{' '}
              <span className={styles.visualSloganAccent}>naturel.</span>
            </h1>
            <p className={styles.visualSub}>
              Retrouvez vos commandes, vos rituels favoris et les recommandations
              composées sur-mesure par nos experts.
            </p>
          </div>
        </div>
      </aside>

      <main className={styles.formWrap}>
        <div className={styles.card}>

          {step === 'email' && (
            <>
              <header className={styles.formHead}>
                <span className={styles.formEyebrow}>Connexion</span>
                <h2 className={styles.formTitle}>
                  Connectez-vous à{' '}
                  <span className={styles.formTitleAccent}>votre compte.</span>
                </h2>
                <p className={styles.formSub}>
                  Indiquez votre adresse e-mail pour continuer.
                </p>
              </header>

              <form className={styles.fields} onSubmit={submitEmail}>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>Adresse e-mail</label>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="vous@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>

                {error && <p className={styles.errorBanner}>{error}</p>}

                <button type="submit" className={styles.submit} disabled={loading}>
                  {loading ? 'Vérification…' : 'Continuer'}
                  {!loading && <ArrowIcon />}
                </button>
              </form>

              <p className={styles.switch}>
                Nouvelle cliente&nbsp;?
                <Link href="/inscription" className={styles.switchLink}>
                  Créer un compte
                </Link>
              </p>
            </>
          )}

          {step === 'no-account' && (
            <>
              <header className={styles.formHead}>
                <span className={styles.formEyebrow}>Connexion</span>
                <h2 className={styles.formTitle}>Aucun compte trouvé</h2>
                <p className={styles.formSub}>
                  Nous n&apos;avons trouvé aucun compte associé à <strong>{email}</strong>. Vous
                  pouvez créer un compte, ou passer commande sans inscription préalable — un
                  espace client vous sera automatiquement proposé après votre achat.
                </p>
              </header>

              <div className={styles.fields}>
                <Link href="/inscription" className={styles.submit} style={{ textDecoration: 'none' }}>
                  Créer un compte
                </Link>
                <button type="button" className={styles.backLink} onClick={backToEmail}>
                  ← Essayer une autre adresse
                </button>
              </div>
            </>
          )}

          {step === 'choice' && (
            <>
              <header className={styles.formHead}>
                <span className={styles.formEyebrow}>Connexion</span>
                <h2 className={styles.formTitle}>Comment souhaitez-vous{' '}
                  <span className={styles.formTitleAccent}>vous connecter&nbsp;?</span>
                </h2>
                {hasPassword ? (
                  <p className={styles.formSub}>Choisissez la méthode qui vous convient pour {email}.</p>
                ) : (
                  <p className={styles.formSub}>
                    Vous n&apos;avez pas encore défini de mot de passe pour ce compte. Connectez-vous
                    avec un code envoyé par e-mail, ou créez votre mot de passe.
                  </p>
                )}
              </header>

              {error && <p className={styles.errorBanner}>{error}</p>}

              <div className={styles.choiceGrid}>
                {hasPassword && (
                  <button type="button" className={styles.choiceCard} onClick={() => setStep('password')}>
                    <span className={styles.choiceIcon}>🔒</span>
                    <span className={styles.choiceTitle}>Se connecter avec mon mot de passe</span>
                  </button>
                )}
                <button type="button" className={styles.choiceCard} onClick={sendOtp} disabled={loading}>
                  <span className={styles.choiceIcon}>✉️</span>
                  <span className={styles.choiceTitle}>Recevoir un code par e-mail</span>
                </button>
                {!hasPassword && (
                  <button type="button" className={styles.choiceCard} onClick={sendOtp} disabled={loading}>
                    <span className={styles.choiceIcon}>🔑</span>
                    <span className={styles.choiceTitle}>Définir mon mot de passe</span>
                  </button>
                )}
              </div>

              <button type="button" className={styles.backLink} onClick={backToEmail}>
                ← Utiliser une autre adresse
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <header className={styles.formHead}>
                <span className={styles.formEyebrow}>Connexion</span>
                <h2 className={styles.formTitle}>
                  Bon retour <span className={styles.formTitleAccent}>parmi nous.</span>
                </h2>
                <p className={styles.formSub}>Connexion avec le mot de passe de {email}.</p>
              </header>

              <form className={styles.fields} onSubmit={submitPassword}>
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>Mot de passe</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPwd(!showPwd)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}
                    >
                      <EyeIcon open={showPwd} />
                    </button>
                  </div>
                </div>

                <div className={styles.options}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />{' '}
                    Se souvenir de moi
                  </label>
                  <Link href="/mot-de-passe-oublie" className={styles.forgot}>
                    Mot de passe oublié&nbsp;?
                  </Link>
                </div>

                {error && <p className={styles.errorBanner}>{error}</p>}

                <button type="submit" className={styles.submit} disabled={loading}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                  {!loading && <ArrowIcon />}
                </button>
              </form>

              <button type="button" className={styles.backLink} onClick={() => setStep('choice')}>
                ← Recevoir un code par e-mail à la place
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <header className={styles.formHead}>
                <span className={styles.formEyebrow}>Connexion</span>
                <h2 className={styles.formTitle}>Vérifiez votre <span className={styles.formTitleAccent}>e-mail.</span></h2>
                <p className={styles.formSub}>
                  Nous avons envoyé un code à <strong>{email}</strong>.
                </p>
              </header>

              <form className={styles.fields} onSubmit={submitOtp}>
                <div className={styles.field}>
                  <label htmlFor="otp" className={styles.label}>Code de vérification</label>
                  <input
                    id="otp"
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`${styles.input} ${styles.otpInput}`}
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

                {error && <p className={styles.errorBanner}>{error}</p>}

                <button type="submit" className={styles.submit} disabled={loading || code.length !== 6}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                  {!loading && <ArrowIcon />}
                </button>
              </form>

              <div className={styles.otpFooter}>
                <button type="button" className={styles.backLink} onClick={sendOtp} disabled={cooldown > 0 || loading}>
                  {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer le code'}
                </button>
                {hasPassword && (
                  <button type="button" className={styles.backLink} onClick={() => setStep('password')}>
                    Utiliser mon mot de passe
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionContent />
    </Suspense>
  );
}
