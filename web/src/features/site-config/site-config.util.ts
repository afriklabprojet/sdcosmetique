/**
 * Client-safe site-config helpers. Section reads go to Laravel GET /settings/{key}.
 */
import type { SiteConfig } from '@/features/site-config/site-config.type';
import { fetchPublicSetting } from '@/shared/api/settings';

export async function fetchSiteConfigSection<K extends keyof SiteConfig>(
  section: K,
): Promise<SiteConfig[K]> {
  return fetchPublicSetting(section);
}

export function formatConfigPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateShippingCost(
  orderTotal: number,
  shippingOptionId: string,
  shippingConfig: SiteConfig['shipping'],
): number {
  const option = shippingConfig.options.find(opt => opt.id === shippingOptionId);
  if (!option) return 0;

  if (option.freeFrom > 0 && orderTotal >= option.freeFrom) {
    return 0;
  }

  return option.cost;
}

export function freeShippingEligible(
  orderTotal: number,
  shippingConfig: SiteConfig['shipping'],
): boolean {
  const lowestFreeFrom = shippingConfig.options
    .filter(opt => opt.freeFrom > 0)
    .reduce((min, opt) => Math.min(min, opt.freeFrom), Infinity);
  return isFinite(lowestFreeFrom) && orderTotal >= lowestFreeFrom;
}
