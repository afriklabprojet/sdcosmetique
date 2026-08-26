import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { sendJekoPointsNotification } from '@/shared/notifications/email.service';
import { requireAdmin } from '@/shared/auth/admin.guard';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { userId, points, message } = await req.json().catch(() => ({}));
  if (!userId || typeof points !== 'number') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const rows = await db
    .select({ email: users.email, prenom: users.prenom, points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!rows.length || !rows[0].email) {
    return NextResponse.json({ error: 'profile_not_found' }, { status: 404 });
  }

  const profile = rows[0];

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
