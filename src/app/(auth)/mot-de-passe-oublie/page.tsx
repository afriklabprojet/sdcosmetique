'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from '../auth.module.css';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/compte/reset-password`,
    });
    setLoading(false);
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many requests')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      return;
    }
    setSent(true);
  };

  return (
    <div className={styles.page}>
      <aside className={styles.visual}>
        <Image
          src="/hero/generated-skincare-hero.jpg"
          alt="Sérénité SD Cosmétique"
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
            <span className={styles.visualEyebrow}>Récupération sécurisée</span>
            <h1 className={styles.visualSlogan}>
              Retrouvez votre accès
              <span className={styles.visualSloganAccent}>en toute sérénité.</span>
            </h1>
            <p className={styles.visualSub}>
              Un lien sécurisé vous sera envoyé en quelques secondes, valable une heure
              pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>
      </aside>

      <main className={styles.formWrap}>
        <div className={styles.card}>
          <header className={styles.formHead}>
            <span className={styles.formEyebrow}>Mot de passe oublié</span>
            <h2 className={styles.formTitle}>
              Réinitialisez <span className={styles.formTitleAccent}>en un clic.</span>
            </h2>
            <p className={styles.formSub}>
              Indiquez l&apos;adresse de votre compte, nous vous envoyons un lien de réinitialisation.
            </p>
          </header>

          {!sent ? (
            <form className={styles.fields} onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#DC2626' }}>
                  {error}
                </div>
              )}
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

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Envoi...' : 'Recevoir le lien'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          ) : (
            <div
              style={{
                background: '#FAF6EE',
                borderLeft: '3px solid #8F5922',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  color: '#1A0E05',
                  fontSize: '1.05rem',
                  marginBottom: '0.5rem',
                }}
              >
                Vérifiez votre boîte mail.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  color: 'rgba(26, 14, 5, 0.7)',
                  lineHeight: 1.6,
                }}
              >
                Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de
                réinitialisation valable une heure. Pensez à vérifier vos courriers indésirables.
              </p>
            </div>
          )}

          <p className={styles.switch}>
            Vous vous souvenez ?
            <Link href="/connexion" className={styles.switchLink}>
              Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
