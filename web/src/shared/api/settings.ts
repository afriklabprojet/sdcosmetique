import { api, unwrapData } from '@/shared/api/client';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { SiteConfig } from '@/features/site-config/site-config.type';

type SettingRow = { key: string; value: unknown; is_public?: boolean };

function assemble(rows: SettingRow[]): SiteConfig {
  const cfg = structuredClone(DEFAULT_SITE_CONFIG);
  for (const row of rows) {
    if (row.key in cfg) {
      (cfg as Record<string, unknown>)[row.key] = row.value;
    }
  }
  return cfg;
}

export async function fetchPublicSettings(): Promise<SiteConfig> {
  try {
    const body = await api<{ data: SettingRow[] }>('/settings', {
      next: { revalidate: 60, tags: ['site-config'] },
    } as RequestInit);
    return assemble(unwrapData(body));
  } catch {
    return structuredClone(DEFAULT_SITE_CONFIG);
  }
}

export async function fetchPublicSetting<K extends keyof SiteConfig>(key: K): Promise<SiteConfig[K]> {
  try {
    const body = await api<{ data: SettingRow }>(`/settings/${String(key)}`);
    return unwrapData(body).value as SiteConfig[K];
  } catch {
    return DEFAULT_SITE_CONFIG[key];
  }
}

export async function fetchAdminSettings(): Promise<SiteConfig> {
  const body = await api<{ data: SettingRow[] }>('/admin/settings');
  return assemble(unwrapData(body));
}

export async function fetchAdminSetting(key: string): Promise<unknown> {
  const body = await api<{ data: SettingRow }>(`/admin/settings/${key}`);
  return unwrapData(body).value;
}

export async function patchAdminSetting(key: string, value: unknown, isPublic?: boolean): Promise<void> {
  await api(`/admin/settings/${key}`, {
    method: 'PATCH',
    body: JSON.stringify({
      value,
      ...(isPublic === undefined ? {} : { is_public: isPublic }),
    }),
  });
}
