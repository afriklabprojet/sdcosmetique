import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { jekoConfig } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const rows = await db
    .select({ value: jekoConfig.value })
    .from(jekoConfig)
    .where(eq(jekoConfig.key, key))
    .limit(1);

  return NextResponse.json({ value: rows[0]?.value ?? null });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  try {
    const existing = await db.select().from(jekoConfig).where(eq(jekoConfig.key, key)).limit(1);
    if (existing.length) {
      await db.update(jekoConfig).set({ value }).where(eq(jekoConfig.key, key));
    } else {
      await db.insert(jekoConfig).values({ key, value });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur DB';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
