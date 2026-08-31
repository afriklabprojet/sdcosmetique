/**
 * promo.ts — Utilitaires de calcul pour la promotion globale.
 * Aucune dépendance React — utilisable côté serveur et client.
 */

import type {
  GlobalPromoConfig,
  PromoApplication,
  PromoCode,
  PromoValidation,
} from '@/features/site-config/site-config.type';
import type { Product } from '@/shared/types/domain.type';

// ─── Helpers date ─────────────────────────────────────────────────────────────

/**
 * Vérifie si la promotion est actuellement active (dates + flag enabled).
 */
export function promoActive(promo: GlobalPromoConfig | null | undefined): boolean {
  if (!promo?.enabled) return false;
  const now = Date.now();
  if (promo.startAt && new Date(promo.startAt).getTime() > now) return false;
  if (promo.endAt && new Date(promo.endAt).getTime() < now) return false;
  return true;
}

// ─── Calcul du prix effectif ──────────────────────────────────────────────────

export interface EffectivePrice {
  /** Prix à afficher en gros (après remise) */
  salePrice: number;
  /** Prix barré (avant remise), null si aucune remise */
  strikePrice: number | null;
  /** Pourcentage de remise réel appliqué (0 si pas de promo) */
  discountPct: number;
  /** Économies en valeur absolue (0 si pas de promo) */
  savings: number;
  /** true si une remise est effectivement appliquée */
  hasDiscount: boolean;
}

/**
 * Calcule le prix affiché pour un produit en tenant compte :
 * - de la promo individuelle existante (product.originalPrice > product.price)
 * - de la promotion globale active
 *
 * Règle : on garde le meilleur rabais pour l'acheteur.
 */
export function computeEffectivePrice(
  product: Product,
  promo: GlobalPromoConfig | null | undefined,
): EffectivePrice {
  const basePrice = product.price;

  // Remise individuelle du produit
  const individualOriginal = product.originalPrice ?? null;
  const individualPct = individualOriginal != null && individualOriginal > basePrice
    ? Math.round(((individualOriginal - basePrice) / individualOriginal) * 100)
    : 0;

  // Remise globale
  const globalActive = promoActive(promo);
  const globalPct = globalActive ? Math.min(Math.max(promo?.discountPercentage ?? 0, 0), 99) : 0;

  // On choisit la meilleure remise
  if (individualPct <= 0 && globalPct <= 0) {
    return { salePrice: basePrice, strikePrice: null, discountPct: 0, savings: 0, hasDiscount: false };
  }

  if (individualPct >= globalPct) {
    // Remise individuelle meilleure (ou égale) — on affiche tel quel
    return {
      salePrice: basePrice,
      strikePrice: individualOriginal!,
      discountPct: individualPct,
      savings: Math.round((individualOriginal! - basePrice) * 100) / 100,
      hasDiscount: true,
    };
  }

  // Remise globale meilleure — on l'applique sur le prix catalogue (basePrice non-soldé)
  const referencePrice = individualOriginal == null ? basePrice : Math.max(basePrice, individualOriginal);
  const salePrice = Math.round(referencePrice * (1 - globalPct / 100) * 100) / 100;

  return {
    salePrice,
    strikePrice: referencePrice,
    discountPct: globalPct,
    savings: Math.round((referencePrice - salePrice) * 100) / 100,
    hasDiscount: true,
  };
}

// ─── Codes promo ──────────────────────────────────────────────────────────────

/*
 * These two functions used to live next to site-config loaders. They do not
 * read configuration: they only know the `PromoCode` list they are given and
 * a total. Their subject is promotion, not site config.
 */

/**
 * Applique un code promo et calcule la remise
 */
export function applyPromoCode(
  orderTotal: number,
  promoCode: string,
  promoCodes: PromoCode[]
): PromoApplication {
  const code = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());

  if (!code) {
    return {
      valid: false,
      discount: 0,
      finalTotal: orderTotal,
      error: 'Code promo invalide'
    };
  }

  // Vérifier l'expiration
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return {
      valid: false,
      discount: 0,
      finalTotal: orderTotal,
      error: 'Code promo expiré'
    };
  }

  // Vérifier le montant minimum
  if (code.minSubtotal && orderTotal < code.minSubtotal) {
    return {
      valid: false,
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
    valid: true,
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
): PromoValidation {
  const code = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());

  if (!code) {
    return { valid: false, error: 'Code promo invalide' };
  }

  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return { valid: false, error: 'Code promo expiré' };
  }

  return { valid: true, code };
}
