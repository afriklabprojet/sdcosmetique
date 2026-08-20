import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users, jekoTransactions } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export const runtime = 'nodejs';

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get('type') ?? 'members';

  if (type === 'members') {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        prenom: users.prenom,
        nom: users.nom,
        points: users.points,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.points));

    const header = 'id,email,prenom,nom,points,created_at';
    const body = rows.map(r =>
      [r.id, r.email, r.prenom ?? '', r.nom ?? '', r.points, r.createdAt.toISOString()].map(csvEscape).join(','),
    ).join('\n');
    const csv = `${header}\n${body}`;
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jeko-membres-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (type === 'transactions') {
    const rows = await db
      .select()
      .from(jekoTransactions)
      .orderBy(desc(jekoTransactions.createdAt))
      .limit(10000);

    const header = 'id,user_id,points,reason,label,reference_id,created_at';
    const body = rows.map(r =>
      [r.id, r.userId, r.points, r.reason, r.label ?? '', r.referenceId ?? '', r.createdAt.toISOString()].map(csvEscape).join(','),
    ).join('\n');
    const csv = `${header}\n${body}`;
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jeko-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: 'bad_type' }, { status: 400 });
}
