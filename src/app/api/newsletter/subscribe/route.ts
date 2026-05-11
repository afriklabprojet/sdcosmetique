import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getIp, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// [CQ-02] Whitelist des sources valides — empêche l'injection de valeurs
// arbitraires en BDD via le champ source.
const VALID_SOURCES = new Set(['footer', 'popup', 'homepage', 'quiz', 'blog', 'boutique']);

export async function POST(req: NextRequest) {
  // 3 inscriptions / heure par IP
  const rl = await rateLimit(`newsletter:${getIp(req)}`, 3, 60 * 60 * 1000);
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
    // [CQ-02] Valider la source contre la whitelist ; fallback sur 'footer' si absente/invalide.
    const safeSource = typeof source === 'string' && VALID_SOURCES.has(source) ? source : 'footer';
    const supabase = await db();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim(), source: safeSource });
    // 23505 = unique violation → on traite comme succès idempotent
    if (error && error.code !== '23505') {
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}
