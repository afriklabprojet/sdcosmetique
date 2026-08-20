import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { newsletterSubscribers } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id, unsubscribed } = await req.json().catch(() => ({}));
  if (!id || typeof unsubscribed !== 'boolean') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  try {
    await db.update(newsletterSubscribers).set({ unsubscribed }).where(eq(newsletterSubscribers.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter/manage] db error:', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  try {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter/manage] db error:', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}
