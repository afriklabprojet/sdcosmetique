import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { getCurrentUser, hashPassword, verifyPassword, toSafeUser } from '@/shared/auth/auth.service';

export async function PATCH(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.prenom !== undefined) updateData.prenom = body.prenom;
    if (body.nom !== undefined) updateData.nom = body.nom;
    if (body.telephone !== undefined) updateData.telephone = body.telephone;
    if (body.newsletter !== undefined) updateData.newsletter = Boolean(body.newsletter);

    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel requis pour changer de mot de passe.' }, { status: 400 });
      }
      const userRows = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
      if (!userRows.length || !userRows[0].passwordHash) {
        return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
      }
      const valid = await verifyPassword(body.currentPassword, userRows[0].passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(body.newPassword);
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, currentUser.id));
    }

    const updatedRows = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
    return NextResponse.json({ ok: true, user: toSafeUser(updatedRows[0]) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
