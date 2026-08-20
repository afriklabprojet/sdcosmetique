/**
 * site-config.util.ts — Fonctions utilitaires client-safe de configuration.
 */
import type { SiteConfig } from '@/features/site-config/site-config.type';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

export async function fetchSiteConfigSection<K extends keyof SiteConfig>(
  section: K
): Promise<SiteConfig[K]> {
  try {
    const res = await fetch(`/api/config/${section}`);
    if (!res.ok) return DEFAULT_SITE_CONFIG[section];
    const data = await res.json();
    return (data?.value ?? DEFAULT_SITE_CONFIG[section]) as SiteConfig[K];
  } catch {
    return DEFAULT_SITE_CONFIG[section];
  }
}

export function formatConfigPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

export function calculateShippingCost(
  orderTotal: number,
  shippingOptionId: string,
  shippingConfig: SiteConfig['shipping']
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
  shippingConfig: SiteConfig['shipping']
): boolean {
  const lowestFreeFrom = shippingConfig.options
    .filter(opt => opt.freeFrom > 0)
    .reduce((min, opt) => Math.min(min, opt.freeFrom), Infinity);
  return isFinite(lowestFreeFrom) && orderTotal >= lowestFreeFrom;
}
