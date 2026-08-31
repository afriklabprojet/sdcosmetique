'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiErrorMessage } from '@/shared/api';
import { Password } from '@/shared/api/auth';
import styles from '../auth.module.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailFromLink = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(token ? '' : 'Ce lien de réinitialisation est incomplet.');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submitForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await Password.reset({ token, email, password });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de réinitialiser le mot de passe.'));
    } finally {
      setLoading(false);
    }
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
        </div>
      </aside>

      <main className={styles.formWrap}>
        <div className={styles.card}>
          <header className={styles.formHead}>
            <span className={styles.formEyebrow}>Nouveau mot de passe</span>
            <h2 className={styles.formTitle}>
              Choisissez un mot de passe <span className={styles.formTitleAccent}>sécurisé.</span>
            </h2>
          </header>

          {done ? (
            <div
              style={{
                background: '#FAF6EE',
                borderLeft: '3px solid #8F5922',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <p style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1A0E05', fontSize: '1.05rem' }}>
                Mot de passe mis à jour.
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(26, 14, 5, 0.7)', lineHeight: 1.6 }}>
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link href="/connexion" className={styles.switchLink} style={{ display: 'inline-block', marginTop: 16 }}>
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form className={styles.fields} onSubmit={submitForm}>
              {error && (
                <p className="text-xs py-2 px-3 rounded" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                  {error}
                </p>
              )}
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Nouveau mot de passe</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirm" className={styles.label}>Confirmer le mot de passe</label>
                <input
                  id="confirm"
                  type="password"
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className={styles.submit} disabled={loading || !token}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
