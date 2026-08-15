/**
 * site-config.server.ts — Server-only. Ne jamais importer depuis un Client Component.
 * Utiliser site-config.ts pour les types, defaults et saveSiteConfigSection.
 */
import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/shared/supabase/service.client';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { SiteConfig } from '@/features/site-config/site-config.type';

// Note : utilise createServiceClient() (pas db/cookies) car unstable_cache
// ne peut pas appeler des APIs dynamiques (cookies, headers) à l'intérieur.
async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value');
    if (error || !data?.length) {
      console.error('[site-config] DB fetch error:', error?.message ?? 'no rows', 'count:', data?.length ?? 0);
      return DEFAULT_SITE_CONFIG;
    }
    const cfg: SiteConfig = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
    for (const row of data) {
      if (row.key in cfg) {
        (cfg as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return cfg;
  } catch (e) {
    console.error('[site-config] Unexpected error in fetchSiteConfig:', e);
    return DEFAULT_SITE_CONFIG;
  }
}

export const getSiteConfig = unstable_cache(
  fetchSiteConfig,
  ['site-config'],
  { revalidate: 60, tags: ['site-config'] },
);
