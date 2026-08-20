import { NextResponse } from 'next/server';
import { count } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users, jekoTransactions } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const memberCountRes = await db.select({ total: count() }).from(users);
    const transRows = await db.select({ points: jekoTransactions.points, reason: jekoTransactions.reason }).from(jekoTransactions);

    const totalMembers = memberCountRes[0]?.total ?? 0;
    const totalPointsDistributed = transRows
      .filter(t => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);
    const totalRedemptions = transRows
      .filter(t => t.reason === 'redemption')
      .length;

    return NextResponse.json({ totalMembers, totalPointsDistributed, totalRedemptions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur DB';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
