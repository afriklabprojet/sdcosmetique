/**
 * utilities.ts — Fonctions utilitaires pour la gestion de la configuration
 */

import { createClient } from '@/utils/supabase/client';
import type { SiteConfig, PromoCode } from './types';
import { DEFAULT_SITE_CONFIG } from './defaults';

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
): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
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

// ─── Gestion des codes promo ─────────────────────────────────────────────────

/**
 * Applique un code promo et calcule la remise
 */
export function applyPromoCode(
  orderTotal: number,
  promoCode: string,
  promoCodes: PromoCode[]
): {
  isValid: boolean;
  discount: number;
  finalTotal: number;
  error?: string;
} {
  const code = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
  
  if (!code) {
    return {
      isValid: false,
      discount: 0,
      finalTotal: orderTotal,
      error: 'Code promo invalide'
    };
  }

  // Vérifier l'expiration
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return {
      isValid: false,
      discount: 0,
      finalTotal: orderTotal,
      error: 'Code promo expiré'
    };
  }

  // Vérifier le montant minimum
  if (code.minSubtotal && orderTotal < code.minSubtotal) {
    return {
      isValid: false,
      discount: 0,
      finalTotal: orderTotal,
      error: `Commande minimum de ${code.minSubtotal}€ requise`
    };
  }

  // Calculer la remise
  let discount = 0;
  if (code.type === 'percent') {
    discount = (orderTotal * code.value) / 100;
  } else if (code.type === 'fixed') {
    discount = code.value;
  }

  discount = Math.min(discount, orderTotal);
  const finalTotal = Math.max(0, orderTotal - discount);

  return {
    isValid: true,
    discount,
    finalTotal
  };
}

/**
 * Valide un code promo sans l'appliquer
 */
export function validatePromoCode(
  promoCode: string,
  promoCodes: PromoCode[]
): { isValid: boolean; code?: PromoCode; error?: string } {
  const code = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
  
  if (!code) {
    return { isValid: false, error: 'Code promo invalide' };
  }

  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return { isValid: false, error: 'Code promo expiré' };
  }

  return { isValid: true, code };
}

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
export function isFreeShippingEligible(
  orderTotal: number,
  shippingConfig: SiteConfig['shipping']
): boolean {
  const lowestFreeFrom = shippingConfig.options
    .filter(opt => opt.freeFrom > 0)
    .reduce((min, opt) => Math.min(min, opt.freeFrom), Infinity);
  return isFinite(lowestFreeFrom) && orderTotal >= lowestFreeFrom;
}