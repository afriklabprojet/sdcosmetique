import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/shared/db';
import { quizSubmissions } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rl = await rateLimit(`quiz:${getIp(request)}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const skinTone = typeof body.skin_tone === 'string' ? body.skin_tone.slice(0, 50) : null;
    const concern = typeof body.concern === 'string' ? body.concern.slice(0, 80) : null;
    const routine = typeof body.routine === 'string' ? body.routine.slice(0, 80) : null;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userEmail = typeof body.email === 'string' && EMAIL_RE.test(body.email) ? body.email.slice(0, 200) : null;

    await db.insert(quizSubmissions).values({
      skinTone,
      concern,
      routine,
      userEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, error: 'unauthorized', items: [] }, { status: 401 });

    const data = await db
      .select()
      .from(quizSubmissions)
      .orderBy(desc(quizSubmissions.createdAt))
      .limit(2000);

    return NextResponse.json({
      ok: true,
      items: data.map(r => ({
        skin_tone: r.skinTone,
        concern: r.concern,
        routine: r.routine,
        created_at: r.createdAt.toISOString(),
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg, items: [] }, { status: 200 });
  }
}
