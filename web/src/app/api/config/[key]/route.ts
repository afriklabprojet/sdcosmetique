import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { siteConfig } from '@/shared/db/schema';

const PUBLIC_CONFIG_KEYS = new Set([
  'banner_message',
  'banner_enabled',
  'maintenance_mode',
  'free_shipping_threshold',
  'site_announcement',
  'promo_banner_text',
  'payment_images',
  'payment_methods_active',
  'branding',
  'shipping',
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

    const rows = await db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.key, key))
      .limit(1);

    if (!rows.length || !rows[0]) {
      return NextResponse.json({ value: null }, { status: 404 });
    }

    return NextResponse.json({ value: rows[0].value }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ value: null }, { status: 500 });
  }
}
