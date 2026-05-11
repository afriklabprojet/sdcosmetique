import { db } from '@/lib/db';

/**
 * Vérifie que la requête courante est faite par un admin authentifié.
 * Retourne l'user si autorisé, null sinon.
 *
 * ADMIN_EMAILS est lu dynamiquement (pas en module-level) pour garantir
 * que process.env est bien chargé au moment de l'appel (standalone mode).
 *
 * NOTE: `import 'server-only'` volontairement absent — sa présence déclenche
 * un bug Turbopack dev-mode (module factory not available) quand une Server
 * Action importée depuis un Client Component dépend transitivamente de ce module.
 * La protection reste effective : db() utilise next/headers / cookies() qui
 * lèvent une erreur runtime si jamais appelés côté client.
 */
export async function requireAdmin() {
  try {
    // Lecture dynamique — évite le problème de module chargé avant env.production
    const adminEmails = new Set(
      (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
    );

    if (adminEmails.size === 0) {
      console.error('[requireAdmin] ADMIN_EMAILS env var est vide ou manquant');
    }

    const userClient = await db();
    const { data: { user }, error } = await userClient.auth.getUser();

    if (error) {
      console.error('[requireAdmin] getUser error:', error.message);
      return null;
    }
    if (!user?.email) {
      console.warn('[requireAdmin] Pas de session utilisateur');
      return null;
    }
    if (!adminEmails.has(user.email.toLowerCase())) {
      console.warn(`[requireAdmin] Email non autorisé: ${user.email}`);
      return null;
    }
    return user;
  } catch (err) {
    console.error('[requireAdmin] Erreur inattendue:', err);
    return null;
  }
}
