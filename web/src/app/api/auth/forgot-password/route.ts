import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`forgot-pwd:${getIp(req)}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, cleanEmail)).limit(1);

    // Pour des raisons de sécurité, renvoyer ok: true même si email inexistant
    if (rows.length > 0) {
      // Dans une implémentation complète, on génère un token de réinitialisation et on envoie l'email
      console.log(`[auth/forgot-password] Password reset requested for: ${cleanEmail}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
