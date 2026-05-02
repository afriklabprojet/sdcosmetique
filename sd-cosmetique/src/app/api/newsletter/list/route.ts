import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const fmt = req.nextUrl.searchParams.get('format');

  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Service role pour bypass RLS (lecture admin)
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, source, unsubscribed, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[newsletter/list] db_error:', error);
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  }

  if (fmt === 'csv') {
    const rows = data ?? [];
    const escape = (v: string | boolean | null) => {
      const s = v == null ? '' : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = 'email,source,unsubscribed,created_at';
    const csv = [header, ...rows.map(r => [
      escape(r.email),
      escape(r.source),
      escape(r.unsubscribed ? 'true' : 'false'),
      escape(r.created_at),
    ].join(','))].join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="newsletter-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }
  return NextResponse.json({ subscribers: data ?? [] });
}
