import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, prenom, nom, points, created_at')
    .order('points', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // L'email vit dans auth.users, pas dans profiles → on fusionne via auth admin.
  const emailById = new Map<string, string>();
  try {
    const { data: usersPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of usersPage?.users ?? []) {
      if (u.id && u.email) emailById.set(u.id, u.email);
    }
  } catch {
    // Si l'API admin échoue, on retourne quand même les profils sans email.
  }

  const members = (profiles ?? []).map(p => ({
    ...p,
    email: emailById.get(p.id) ?? '',
  }));

  return NextResponse.json(members);
}
