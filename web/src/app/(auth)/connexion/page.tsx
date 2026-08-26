'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

function ConnexionContent() {
  const searchParams = useSearchParams();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(() => (
    searchParams.get('lien') === 'expire' ? 'Ce lien a expiré. Veuillez vous reconnecter.' : ''
  ));
  const [loading, setLoading] = useState(false);

  const submitForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setError(data.error || 'Email ou mot de passe incorrect.');
        return;
      }

      const next = new URLSearchParams(globalThis.location.search).get('next') ?? '/compte';
      globalThis.location.href = next;
    } catch {
      setLoading(false);
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    }
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
          <header className={styles.formHead}>
            <span className={styles.formEyebrow}>Connexion</span>
            <h2 className={styles.formTitle}>
              Bon retour <span className={styles.formTitleAccent}>parmi nous.</span>
            </h2>
            <p className={styles.formSub}>
              Connectez-vous pour accéder à votre espace beauté personnalisé.
            </p>
          </header>

          <form className={styles.fields} onSubmit={submitForm}>
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
                required
              />
            </div>

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
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
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

            {error && (
              <p className="text-xs py-2 px-3 rounded" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
              {!loading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>

          <p className={styles.switch}>
            Nouvelle cliente&nbsp;?
            <Link href="/inscription" className={styles.switchLink}>
              Créer un compte
            </Link>
          </p>
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
