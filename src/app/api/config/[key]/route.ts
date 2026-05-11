import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// [SEC-06] Whitelist des clés autorisées en lecture publique.
// Toute clé absente de cette liste retourne 403 — empêche l'exposition
// de codes promo, secrets ou config sensible via /api/config/<clé>.
const PUBLIC_CONFIG_KEYS = new Set([
  'banner_message',
  'banner_enabled',
  'maintenance_mode',
  'free_shipping_threshold',
  'site_announcement',
  'promo_banner_text',
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    if (!PUBLIC_CONFIG_KEYS.has(key)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const supabase = await db();
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return NextResponse.json({ value: null }, { status: 404 });
    }

    return NextResponse.json({ value: data.value }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ value: null }, { status: 500 });
  }
}
