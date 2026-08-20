import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users, jekoTransactions } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { userId, points, label } = await req.json();
  if (!userId || typeof points !== 'number') {
    return NextResponse.json({ error: 'userId et points requis' }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(jekoTransactions).values({
        userId,
        points,
        reason: 'manual',
        label: (label?.trim()) || (points > 0 ? `+${points} pts (ajustement admin)` : `${points} pts (ajustement admin)`),
        referenceId: null,
      });

      await tx
        .update(users)
        .set({ points: sql`${users.points} + ${points}` })
        .where(eq(users.id, userId));
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur DB';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
