/**
 * site-config.query.ts — Server-only. Utilise Drizzle ORM avec unstable_cache.
 */
import { unstable_cache } from 'next/cache';
import { db } from '@/shared/db';
import { siteConfig } from '@/shared/db/schema';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { SiteConfig } from '@/features/site-config/site-config.type';

async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const data = await db.select().from(siteConfig);
    if (!data?.length) return DEFAULT_SITE_CONFIG;

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
