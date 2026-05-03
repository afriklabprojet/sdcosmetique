import { NextRequest, NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/emails';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { nom, email, sujet, message } = body as Record<string, unknown>;

  if (
    typeof nom !== 'string' || !nom.trim() ||
    typeof email !== 'string' || !email.includes('@') ||
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
