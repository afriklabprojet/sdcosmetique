import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

// POST /api/admin/jeko/adjust  { userId, points, label }
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { userId, points, label } = await req.json();
  if (!userId || typeof points !== 'number') {
    return NextResponse.json({ error: 'userId et points requis' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('jeko_transactions').insert({
    user_id: userId,
    points,
    reason: 'manual',
    label: (label?.trim()) || (points > 0 ? `+${points} pts (ajustement admin)` : `${points} pts (ajustement admin)`),
    reference_id: null,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
