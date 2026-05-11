import { NextRequest, NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/emails';
import { rateLimit, getIp, rateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 5 messages / 10 min par IP
  const rl = await rateLimit(`contact:${getIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { nom, email, sujet, message } = body as Record<string, unknown>;

  // [CQ-01] Validation email robuste — email.includes('@') accepte 'a@' ou '@b'
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    typeof nom !== 'string' || !nom.trim() ||
    typeof email !== 'string' || !EMAIL_RE.test(email.trim()) ||
    typeof sujet !== 'string' || !sujet.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 });
  }

  const result = await sendContactMessage({
    nom: nom.trim(),
    email: email.trim(),
    sujet: sujet.trim(),
    message: message.trim(),
  });

  if (!result.ok && result.error !== 'not_configured') {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
