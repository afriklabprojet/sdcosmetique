'use server';

import { requireAdmin } from '@/lib/admin-auth';
import { createServiceClient } from '@/utils/supabase/service';
import type { SiteConfig } from '@/lib/site-config';

/**
 * Sauvegarde une section de site_config côté serveur.
 * - Vérifie que l'appelant est admin (auth serveur).
 * - Utilise le service role pour bypasser les RLS.
 */
export async function saveSiteConfigSection(
  key: keyof SiteConfig,
  value: SiteConfig[typeof key],
): Promise<void> {
  const user = await requireAdmin();
  if (!user) throw new Error('Accès refusé');

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
}
