'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './admin-login.module.css';

// ─── Whitelist emails autorisés (vérification UI seulement — la vraie vérif est côté serveur via middleware) ───
// Ne pas mettre d'emails réels ici : ils seraient visibles dans le bundle JS.
// La protection réelle est assurée par src/middleware.ts + lib/admin-auth.ts.

export default function AdminLoginPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setLoading(false);
      setError('Email ou mot de passe incorrect.');
      return;
    }

    // La protection réelle est dans src/middleware.ts (server-side).
    // On redirige vers /admin — le middleware bloquera si non admin.
    router.replace('/admin');
  };

  return (
    <div className={styles.wrap}>
      {/* ── Gauche — Editorial ── */}
      <div className={styles.leftSide}>
        <div className={styles.leftBg} />

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

      {/* ── Droite — Formulaire ── */}
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

        <form onSubmit={handleSubmit} noValidate>
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
