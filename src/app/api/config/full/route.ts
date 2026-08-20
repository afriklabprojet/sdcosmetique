import { NextResponse } from 'next/server';
import { fetchFullSiteConfig } from '@/features/site-config/site-config.server';
import { requireAdmin } from '@/shared/auth/admin.guard';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const config = await fetchFullSiteConfig();
  return NextResponse.json(config);
}
