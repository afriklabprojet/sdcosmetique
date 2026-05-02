import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

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
  const sb = createServiceClient();

  if (type === 'members') {
    const { data, error } = await sb
      .from('profiles')
      .select('id, email, prenom, nom, points, created_at')
      .order('points', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = data ?? [];
    const header = 'id,email,prenom,nom,points,created_at';
    const body = rows.map(r =>
      [r.id, r.email, r.prenom, r.nom, r.points ?? 0, r.created_at].map(csvEscape).join(','),
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
    const { data, error } = await sb
      .from('jeko_transactions')
      .select('id, user_id, points, reason, label, reference_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = data ?? [];
    const header = 'id,user_id,points,reason,label,reference_id,created_at';
    const body = rows.map(r =>
      [r.id, r.user_id, r.points, r.reason, r.label, r.reference_id, r.created_at].map(csvEscape).join(','),
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
