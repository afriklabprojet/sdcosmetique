'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchSiteConfigSection } from '@/features/site-config/site-config.util';
import styles from './admin-login.module.css';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string>(() =>
    searchParams.get('error') === 'unauthorized'
      ? "Cet email n'est pas autorisé à accéder au dashboard admin."
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [loginBg, setLoginBg] = useState('/hero/generated-skincare-hero-2.jpg');

  useEffect(() => {
    fetchSiteConfigSection('branding').then((b) => {
      if (b?.adminLoginBg) setLoginBg(b.adminLoginBg);
    });
  }, []);

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

      globalThis.location.href = '/admin';
    } catch {
      setLoading(false);
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.leftSide}>
        <div className={styles.leftBg} style={{ backgroundImage: `url('${loginBg}')` }} />
        <div className={styles.leftBrand}>
          <span className={styles.brandName}>SD Cosmetique</span>
          <span className={styles.brandDot} />
          <span className={styles.brandYear}>{new Date().getFullYear()}</span>
        </div>

        <div className={styles.vertText}>
          <div className={styles.vertLine} />
          <span className={styles.vertLabel}>Admin</span>
        </div>

        <div className={styles.leftContent}>
          <div className={styles.issueNumber}>Tableau de bord</div>
          <h1 className={styles.bigTitle}>
            Beauté &amp;{' '}
            <em>Excellence</em>
          </h1>
          <div className={styles.captionStrip}>
            <div className={styles.captionItem}>
              <span className={styles.capLabel}>Plateforme</span>
              <span className={styles.capVal}>Gestion produits</span>
            </div>
            <div className={styles.captionSep} />
            <div className={styles.captionItem}>
              <span className={styles.capLabel}>Accès</span>
              <span className={styles.capVal}>Administrateurs</span>
            </div>
            <div className={styles.captionSep} />
            <div className={styles.captionItem}>
              <span className={styles.capLabel}>Sécurité</span>
              <span className={styles.capVal}>TLS 1.3</span>
            </div>
          </div>
        </div>

        <div className={styles.leftNum}><span>→</span></div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightHeader}>
          <div className={styles.rightLogo}>
            <div className={styles.logoMark}>
              <span className={styles.logoMarkText}>S</span>
            </div>
            <span className={styles.logoName}>SD Cosmetique</span>
          </div>
          <span className={styles.rightBadge}>Espace admin</span>
        </div>

        <h2 className={styles.formHeading}>
          Connexion<br />
          <span>administrateur</span>
        </h2>
        <p className={styles.formSub}>
          Gérez produits, commandes et<br />
          l&apos;expérience client SD Cosmetique.
        </p>

        <form onSubmit={submitForm} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-email">
              Email administrateur
            </label>
            <div className={styles.inputWrap}>
              <input
                id="admin-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="votre email…"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-password">
              Mot de passe
            </label>
            <div className={styles.inputWrap}>
              <input
                id="admin-password"
                className={styles.input}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="mot de passe…"
              />
              <button
                type="button"
                className={styles.pwdToggle}
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.btn}
          >
            <span className={styles.btnInner}>
              {loading ? 'Connexion en cours…' : 'Accéder au dashboard'}
            </span>
          </button>
        </form>

        <div className={styles.secured}>
          <span className={styles.secDot} />
          <span className={styles.secText}>
            Session chiffrée · Accès administrateurs uniquement
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginContent />
    </Suspense>
  );
}
