/**
 * site-config.server.ts — Fonctions d'accès BDD côté serveur uniquement.
 */
import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { siteConfig } from '@/shared/db/schema';
import type { SiteConfig } from '@/features/site-config/site-config.type';
import type { OperationResult } from '@/shared/types/operation-result.type';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

export async function dbFetchSiteConfigSection<K extends keyof SiteConfig>(
  section: K
): Promise<SiteConfig[K]> {
  try {
    const rows = await db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.key, section as string))
      .limit(1);

    if (!rows.length || !rows[0].value) {
      return DEFAULT_SITE_CONFIG[section];
    }

    return rows[0].value as SiteConfig[K];
  } catch {
    return DEFAULT_SITE_CONFIG[section];
  }
}

export async function dbSaveSiteConfigSection<K extends keyof SiteConfig>(
  section: K,
  value: SiteConfig[K]
): Promise<OperationResult> {
  try {
    const existing = await db
      .select({ key: siteConfig.key })
      .from(siteConfig)
      .where(eq(siteConfig.key, section as string))
      .limit(1);

    if (existing.length) {
      await db
        .update(siteConfig)
        .set({ value: value as Record<string, unknown> })
        .where(eq(siteConfig.key, section as string));
    } else {
      await db.insert(siteConfig).values({
        key: section as string,
        value: value as Record<string, unknown>,
      });
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: msg };
  }
}

export async function fetchFullSiteConfig(): Promise<SiteConfig> {
  try {
    const rows = await db.select().from(siteConfig);
    if (!rows.length) return DEFAULT_SITE_CONFIG;

    const config: Partial<SiteConfig> = {};
    for (const item of rows) {
      (config as Record<string, unknown>)[item.key] = item.value;
    }

    return { ...DEFAULT_SITE_CONFIG, ...config } as SiteConfig;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}
