import { fetchPublicSettings } from '@/shared/api/settings';
import type { SiteConfig } from '@/features/site-config/site-config.type';

export async function getSiteConfig(): Promise<SiteConfig> {
  return fetchPublicSettings();
}
