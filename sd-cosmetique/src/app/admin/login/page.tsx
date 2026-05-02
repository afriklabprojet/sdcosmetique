'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './admin-login.module.css';

// ─── Whitelist emails autorisés (vérification UI seulement — la vraie vérif est côté serveur via middleware) ───
// Ne pas mettre d'emails réels ici : ils seraient visibles dans le bundle JS.
// La protection réelle est assurée par src/middleware.ts + lib/admin-auth.ts.

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      {/* Côté gauche — image de fond */}
      <div className={styles.leftSide}>
        <div className={styles.pattern} />
        <div className={styles.leftText}>
          <p className={styles.quote}>&ldquo;Beauté<br />&amp; Excellence&rdquo;</p>
          <p className={styles.quoteLabel}>SD Cosmetique · Admin</p>
        </div>
      </div>

      {/* Panel droit */}
      <div className={styles.panel}>
        {/* En-tête marque */}
        <div>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>Espace Administration</span>
          </div>
          <p className={styles.brandLine}>SD Cosmetique</p>
        </div>

        {/* Titre */}
        <h1 className={styles.heading}>
          Bienvenue,<br />
          <strong>administrateur.</strong>
        </h1>
        <p className={styles.subtext}>
          Connectez-vous pour gérer vos produits,<br />
          commandes et l&apos;expérience client SD Cosmetique.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
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

          {/* Mot de passe */}
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

          {/* Erreur */}
          {error && (
            <div className={styles.errorBox}>{error}</div>
          )}

          {/* Bouton */}
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

        {/* Badge sécurité */}
        <div className={styles.secured}>
          <span className={styles.secDot} />
          <span className={styles.secText}>
            Session chiffrée · Accès administrateurs autorisés uniquement
          </span>
        </div>
      </div>
    </div>
  );
}
