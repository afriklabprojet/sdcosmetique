'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from '../auth.module.css';

export default function InscriptionPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { prenom: form.prenom, nom: form.nom },
        emailRedirectTo: `${globalThis.window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already registered')) {
        setError('Un compte existe déjà avec cette adresse email. Connectez-vous.');
      } else if (msg.includes('rate limit') || msg.includes('email rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
      } else if (msg.includes('invalid email') || msg.includes('invalid format')) {
        setError('Adresse email invalide. Vérifiez le format.');
      } else if (msg.includes('password') && msg.includes('short')) {
        setError('Le mot de passe est trop court (8 caractères minimum).');
      } else if (msg.includes('weak password') || msg.includes('password should')) {
        setError('Mot de passe trop faible. Utilisez au moins 8 caractères avec des lettres et chiffres.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
      } else if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
        setError('Les inscriptions sont momentanément désactivées. Réessayez plus tard.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer ou contacter le support.');
      }
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className={styles.page}>
        <aside className={styles.visual}>
          <Image src="/hero/full.png" alt="SD Cosmétique" fill priority sizes="50vw" className={styles.visualImg} />
          <div className={styles.visualOverlay} />
          <div className={styles.visualContent}>
            <Link href="/" className={styles.visualTop}>
              <span className={styles.visualLogo}>SD</span>
              <span className={styles.visualName}>SD COSMETIQUE</span>
            </Link>
          </div>
        </aside>
        <main className={styles.formWrap}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '48px 32px' }}>
            {/* Icône succès */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', marginBottom: 8, fontFamily: 'Georgia, serif' }}>
              Compte créé avec succès !
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#7A6A5A', lineHeight: 1.6, marginBottom: 8 }}>
              Bienvenue dans la famille <strong>SD Cosmétique</strong>, <strong>{form.prenom}</strong> !
            </p>
            <p style={{ fontSize: '0.82rem', color: '#9A8A7A', lineHeight: 1.6, marginBottom: 32 }}>
              Un e-mail de confirmation a été envoyé à <strong>{form.email}</strong>.<br />
              Vérifiez votre boîte mail (et vos spams) pour activer votre compte.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => router.push('/connexion')}
                style={{
                  width: '100%', padding: '12px 0', background: '#3D1400', border: 'none',
                  borderRadius: 10, color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Se connecter →
              </button>
              <Link
                href="/"
                style={{
                  display: 'block', padding: '11px 0', background: 'transparent',
                  border: '1px solid #EDE8E0', borderRadius: 10, color: '#6B3D14',
                  fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* LEFT — VISUAL */}
      <aside className={styles.visual}>
        <Image
          src="/hero/full.png"
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
            <span className={styles.visualEyebrow}>Rejoignez la maison</span>
            <h1 className={styles.visualSlogan}>
              Une beauté juste,{' '}
              <span className={styles.visualSloganAccent}>pensée pour vous.</span>
            </h1>
            <p className={styles.visualSub}>
              Diagnostic personnalisé, livraison prioritaire et accès aux nouveautés
              en avant-première — bienvenue dans le cercle SD&nbsp;Cosmétique.
            </p>
          </div>
        </div>
      </aside>

      {/* RIGHT — FORM */}
      <main className={styles.formWrap}>
        <div className={styles.card}>
          <header className={styles.formHead}>
            <span className={styles.formEyebrow}>Inscription</span>
            <h2 className={styles.formTitle}>
              Créez votre <span className={styles.formTitleAccent}>compte beauté.</span>
            </h2>
            <p className={styles.formSub}>
              Quelques secondes suffisent pour commencer votre rituel personnalisé.
            </p>
          </header>

          <form className={styles.fields} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="prenom" className={styles.label}>Prénom</label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  className={styles.input}
                  placeholder="Aïcha"
                  value={form.prenom}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="nom" className={styles.label}>Nom</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  className={styles.input}
                  placeholder="Diallo"
                  value={form.nom}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Adresse e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="vous@exemple.fr"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Mot de passe</label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
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

            <div className={styles.field}>
              <label htmlFor="confirm" className={styles.label}>Confirmer le mot de passe</label>
              <input
                id="confirm"
                name="confirm"
                type={showPwd ? 'text' : 'password'}
                className={styles.input}
                placeholder="Ressaisir le mot de passe"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <label className={styles.checkbox} style={{ marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                required
              />
              <span style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                J&apos;accepte les{' '}
                <Link href="/cgv" style={{ color: '#8F5922', textDecoration: 'none' }}>
                  conditions générales
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" style={{ color: '#8F5922', textDecoration: 'none' }}>
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>

            {error && (
              <p className="text-xs py-2 px-3 rounded" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'}
              {!loading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>

          <p className={styles.switch}>
            Déjà cliente&nbsp;?
            <Link href="/connexion" className={styles.switchLink}>
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
