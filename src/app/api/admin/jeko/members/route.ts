import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        prenom: users.prenom,
        nom: users.nom,
        points: users.points,
        created_at: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.points));

    return NextResponse.json(rows.map(r => ({
      ...r,
      prenom: r.prenom ?? '',
      nom: r.nom ?? '',
      created_at: r.created_at.toISOString(),
    })));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur DB';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
