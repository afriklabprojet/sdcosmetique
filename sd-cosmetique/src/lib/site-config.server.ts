/**
 * site-config.server.ts — Server-only. Ne jamais importer depuis un Client Component.
 * Utiliser site-config.ts pour les types, defaults et saveSiteConfigSection.
 */
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { SiteConfig } from '@/lib/site-config';

async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value');
    if (error || !data?.length) return DEFAULT_SITE_CONFIG;
    const cfg: SiteConfig = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
    for (const row of data) {
      if (row.key in cfg) {
        (cfg as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return cfg;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export const getSiteConfig = unstable_cache(
  fetchSiteConfig,
  ['site-config'],
  { revalidate: 60, tags: ['site-config'] },
);
