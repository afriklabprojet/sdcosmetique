import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { newsletterSubscribers } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const fmt = req.nextUrl.searchParams.get('format');
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const data = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));

    if (fmt === 'csv') {
      const escape = (v: string | boolean | null) => {
        const s = v == null ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const header = 'email,source,unsubscribed,created_at';
      const csv = [header, ...data.map(r => [
        escape(r.email),
        escape(r.source),
        escape(r.unsubscribed ? 'true' : 'false'),
        escape(r.createdAt.toISOString()),
      ].join(','))].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="newsletter-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ subscribers: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'db_error';
    return NextResponse.json({ error: 'db_error', detail: msg }, { status: 500 });
  }
}
