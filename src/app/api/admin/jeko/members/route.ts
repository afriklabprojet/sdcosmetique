import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, points, created_at')
    .order('points', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
