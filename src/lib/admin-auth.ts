import 'server-only';
import { db } from '@/lib/db';

/**
 * Emails autorisés en tant qu'administrateurs.
 * Définis côté serveur uniquement — ne jamais exposer dans un composant client.
 */
const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
);

/**
 * Vérifie que la requête courante est faite par un admin authentifié.
 * Retourne l'user si autorisé, null sinon.
 */
export async function requireAdmin() {
  try {
    const userClient = await db();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user?.email) return null;
    if (!ADMIN_EMAILS.has(user.email.toLowerCase())) return null;
    return user;
  } catch {
    return null;
  }
}
