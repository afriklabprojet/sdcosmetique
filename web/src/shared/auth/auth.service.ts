import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users, sessions, jekoTransactions, type UserRow } from '@/shared/db/schema';

export const SESSION_COOKIE_NAME = 'sd_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SafeUser {
  id: string;
  email: string;
  role: string;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  avatarUrl: string | null;
  newsletter: boolean;
  points: number;
  createdAt: Date;
}

export function toSafeUser(user: UserRow): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    prenom: user.prenom,
    nom: user.nom,
    telephone: user.telephone,
    avatarUrl: user.avatarUrl,
    newsletter: user.newsletter,
    points: user.points,
    createdAt: user.createdAt,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    try {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    } catch {
      // Ignore if session record not found
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    const sessionList = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionList.length) return null;

    const { session, user } = sessionList[0];
    if (new Date() > session.expiresAt) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      return null;
    }

    return toSafeUser(user);
  } catch (err) {
    console.error('[getCurrentUser] Error fetching user:', err);
    return null;
  }
}

export async function requireAdmin(): Promise<SafeUser | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const adminEmails = new Set(
      (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
    );

    if (user.role === 'admin' || (user.email && adminEmails.has(user.email.toLowerCase()))) {
      return user;
    }
    return null;
  } catch (err) {
    console.error('[requireAdmin] Error checking admin:', err);
    return null;
  }
}

export async function registerUser(params: {
  email: string;
  password: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
}): Promise<{ user: SafeUser | null; error?: string }> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      return { user: null, error: 'Un compte existe déjà avec cette adresse email.' };
    }

    const passwordHash = await hashPassword(params.password);
    const userId = crypto.randomUUID();

    // Check if initial admin
    const adminEmails = new Set(
      (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
    );
    const role = adminEmails.has(cleanEmail) ? 'admin' : 'customer';

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: cleanEmail,
        passwordHash,
        role,
        prenom: params.prenom ?? null,
        nom: params.nom ?? null,
        telephone: params.telephone ?? null,
        points: 20, // Welcome points
      });

      // Insert welcome loyalty transaction
      await tx.insert(jekoTransactions).values({
        userId,
        points: 20,
        reason: 'welcome',
        label: 'Bonus bienvenue 🎉',
      });
    });

    await createSession(userId);

    const created = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return { user: created[0] ? toSafeUser(created[0]) : null };
  } catch (err) {
    console.error('[registerUser] Error:', err);
    return { user: null, error: 'Erreur lors de la création du compte.' };
  }
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: SafeUser | null; error?: string }> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const found = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    const user = found[0];
    if (!user || !user.passwordHash) {
      return { user: null, error: 'Email ou mot de passe incorrect.' };
    }

    const valid = await verifyPassword(params.password, user.passwordHash);
    if (!valid) {
      return { user: null, error: 'Email ou mot de passe incorrect.' };
    }

    await createSession(user.id);
    return { user: toSafeUser(user) };
  } catch (err) {
    console.error('[loginUser] Error:', err);
    return { user: null, error: 'Erreur lors de la connexion.' };
  }
}
