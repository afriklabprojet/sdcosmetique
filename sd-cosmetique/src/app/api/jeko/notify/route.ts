import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { sendJekoPointsNotification } from '@/lib/emails';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { userId, points, message } = await req.json().catch(() => ({}));
  if (!userId || typeof points !== 'number') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // Récup profil cible
  const sb = createServiceClient();
  const { data: profile, error } = await sb
    .from('profiles')
    .select('email, prenom, points')
    .eq('id', userId)
    .single();

  if (error || !profile?.email) {
    return NextResponse.json({ error: 'profile_not_found' }, { status: 404 });
  }

  const res = await sendJekoPointsNotification({
    to: profile.email,
    firstName: profile.prenom ?? undefined,
    points,
    newBalance: profile.points ?? 0,
    message,
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error ?? 'send_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
