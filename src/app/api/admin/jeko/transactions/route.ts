import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { jekoTransactions } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  try {
    let rows;
    if (userId) {
      rows = await db
        .select()
        .from(jekoTransactions)
        .where(eq(jekoTransactions.userId, userId))
        .orderBy(desc(jekoTransactions.createdAt))
        .limit(300);
    } else {
      rows = await db
        .select()
        .from(jekoTransactions)
        .orderBy(desc(jekoTransactions.createdAt))
        .limit(300);
    }

    return NextResponse.json(rows.map(r => ({
      id: r.id,
      user_id: r.userId,
      points: r.points,
      reason: r.reason,
      label: r.label,
      reference_id: r.referenceId,
      created_at: r.createdAt.toISOString(),
    })));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur DB';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
