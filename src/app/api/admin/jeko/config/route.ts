import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/jeko/config?key=settings|tiers|rewards
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('jeko_config')
    .select('value')
    .eq('key', key)
    .single();

  return NextResponse.json({ value: data?.value ?? null });
}

// POST /api/admin/jeko/config  { key, value }
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('jeko_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
