import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const skin_tone = typeof body.skin_tone === 'string' ? body.skin_tone.slice(0, 50) : null;
    const concern = typeof body.concern === 'string' ? body.concern.slice(0, 80) : null;
    const routine = typeof body.routine === 'string' ? body.routine.slice(0, 80) : null;
    const user_email = typeof body.email === 'string' && body.email.includes('@') ? body.email.slice(0, 200) : null;

    const supabase = createServiceClient();
    const { error } = await supabase.from('quiz_submissions').insert({ skin_tone, concern, routine, user_email });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}

export async function GET() {
  try {
    const userClient = await db();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized', items: [] }, { status: 401 });
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('skin_tone, concern, routine, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) return NextResponse.json({ ok: false, error: error.message, items: [] }, { status: 200 });
    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg, items: [] }, { status: 200 });
  }
}
