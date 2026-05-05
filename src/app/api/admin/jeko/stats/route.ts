import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServiceClient();

  const [membersRes, transRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('jeko_transactions').select('points, reason'),
  ]);

  const totalMembers = membersRes.count ?? 0;
  const transactions = transRes.data ?? [];
  const totalPointsDistributed = transactions
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);
  const totalRedemptions = transactions
    .filter((t) => t.reason === 'redemption')
    .length;

  return NextResponse.json({ totalMembers, totalPointsDistributed, totalRedemptions });
}
