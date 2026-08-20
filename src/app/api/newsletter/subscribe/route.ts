import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/db';
import { newsletterSubscribers } from '@/shared/db/schema';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = new Set(['footer', 'popup', 'homepage', 'quiz', 'blog', 'boutique']);

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`newsletter:${getIp(req)}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const { email, source } = await req.json();
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }
    const safeSource = typeof source === 'string' && VALID_SOURCES.has(source) ? source : 'footer';
    const cleanEmail = email.toLowerCase().trim();

    try {
      await db.insert(newsletterSubscribers).values({
        email: cleanEmail,
        source: safeSource,
      });
    } catch {
      // Ignorer erreur doublon (idempotent)
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}
