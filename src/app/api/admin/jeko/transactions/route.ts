import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const supabase = createServiceClient();
  let q = supabase
    .from('jeko_transactions')
    .select('id, user_id, points, reason, label, reference_id, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (userId) q = q.eq('user_id', userId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
