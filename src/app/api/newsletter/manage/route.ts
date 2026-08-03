import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// PATCH : toggle unsubscribed
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id, unsubscribed } = await req.json().catch(() => ({}));
  if (!id || typeof unsubscribed !== 'boolean') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const sb = createServiceClient();
  const { error } = await sb.from('newsletter_subscribers').update({ unsubscribed }).eq('id', id);
  if (error) {
    console.error('[newsletter/manage] db error:', error.message);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE : suppression définitive
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const sb = createServiceClient();
  const { error } = await sb.from('newsletter_subscribers').delete().eq('id', id);
  if (error) {
    console.error('[newsletter/manage] db error:', error.message);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
