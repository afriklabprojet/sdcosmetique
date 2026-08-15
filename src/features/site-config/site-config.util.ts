/**
 * utilities.ts — Fonctions utilitaires pour la gestion de la configuration
 */

import { createClient } from '@/shared/supabase/browser.client';
import type { SiteConfig } from '@/features/site-config/site-config.type';
import type { OperationResult } from '@/shared/types/operation-result.type';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';

// ─── Gestion des configurations ──────────────────────────────────────────────

/**
 * Récupère une section de configuration depuis Supabase
 */
export async function fetchSiteConfigSection<K extends keyof SiteConfig>(
  section: K
): Promise<SiteConfig[K]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', section)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_CONFIG[section];
    }

    return data.value as SiteConfig[K];
  } catch {
    return DEFAULT_SITE_CONFIG[section];
  }
}

/**
 * Sauvegarde une section de configuration dans Supabase
 */
export async function saveSiteConfigSection<K extends keyof SiteConfig>(
  section: K,
  value: SiteConfig[K]
): Promise<OperationResult> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('site_config')
      .upsert({
        key: section,
        value: value,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: msg };
  }
}

/**
 * Récupère la configuration complète du site
 */
export async function fetchFullSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('site_config')
      .select('*');

    if (error || !data) {
      return DEFAULT_SITE_CONFIG;
    }

    // Reconstituer la configuration complète
    const config: Partial<SiteConfig> = {};
    
    for (const item of data) {
      (config as Record<string, unknown>)[item.key] = item.value;
    }

    // Fusionner avec les valeurs par défaut pour les sections manquantes
    return { ...DEFAULT_SITE_CONFIG, ...config } as SiteConfig;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

/*
 * `applyPromoCode` et `validatePromoCode` vivaient ici. Elles ne lisent aucune
 * configuration : leur sujet est la promotion. Elles sont desormais portees par
 * `@/features/promo/promo.util`.
 */

// ─── Helpers de formatage ─────────────────────────────────────────────────────

/**
 * Formate un prix avec la devise
 */
export function formatConfigPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}
/**
 * Calcule les frais de livraison selon la configuration
 */
export function calculateShippingCost(
  orderTotal: number,
  shippingOptionId: string,
  shippingConfig: SiteConfig['shipping']
): number {
  const option = shippingConfig.options.find(opt => opt.id === shippingOptionId);
  if (!option) return 0;

  // Livraison gratuite si le montant minimum est atteint
  if (option.freeFrom > 0 && orderTotal >= option.freeFrom) {
    return 0;
  }

  return option.cost;
}

/**
 * Vérifie si la livraison gratuite est applicable
 */
export function freeShippingEligible(
  orderTotal: number,
  shippingConfig: SiteConfig['shipping']
): boolean {
  const lowestFreeFrom = shippingConfig.options
    .filter(opt => opt.freeFrom > 0)
    .reduce((min, opt) => Math.min(min, opt.freeFrom), Infinity);
  return isFinite(lowestFreeFrom) && orderTotal >= lowestFreeFrom;
}