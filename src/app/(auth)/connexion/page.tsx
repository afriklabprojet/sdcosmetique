'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from '../auth.module.css';

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('lien') === 'expire') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Ce lien de confirmation a expiré. Veuillez vous inscrire à nouveau ou contacter le support.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('email not confirmed')) {
        setError('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.');
      } else if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
      } else if (msg.includes('user not found') || msg.includes('no user found')) {
        setError('Aucun compte trouvé avec cette adresse email.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
      } else if (msg.includes('disabled')) {
        setError('Ce compte est désactivé. Contactez le support.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      return;
    }
    const next = new URLSearchParams(window.location.search).get('next') ?? '/compte';
    router.push(next);
  };

  return (
    <div className={styles.page}>
      {/* LEFT — VISUAL */}
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
            <span className={styles.visualLogo}>SD</span>
            <span className={styles.visualName}>SD COSMETIQUE</span>
          </Link>

          <div className={styles.visualBottom}>
            <span className={styles.visualEyebrow}>Espace personnel</span>
            <h1 className={styles.visualSlogan}>
              Révélez votre éclat
              <span className={styles.visualSloganAccent}>naturel.</span>
            </h1>
            <p className={styles.visualSub}>
              Retrouvez vos commandes, vos rituels favoris et les recommandations
              composées sur-mesure par nos experts.
            </p>
          </div>
        </div>
      </aside>

      {/* RIGHT — FORM */}
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

          <form className={styles.fields} onSubmit={handleSubmit}>
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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
                />
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

          <div className={styles.divider}>ou</div>

          <div className={styles.socialRow}>
            <button type="button" className={styles.social}>
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.5-4.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 45.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 41.4 16.2 45.5 24 45.5z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2c-.4.4 6.7-4.9 6.7-13.9 0-1.5-.2-3-.5-4.5z" />
              </svg>
              Google
            </button>
            <button type="button" className={styles.social}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A0E05">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
              Facebook
            </button>
          </div>

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
