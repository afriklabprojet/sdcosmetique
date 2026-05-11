/**
 * promo.ts — Utilitaires de calcul pour la promotion globale.
 * Aucune dépendance React — utilisable côté serveur et client.
 */

import type { GlobalPromoConfig } from '@/lib/config/types';
import type { Product } from '@/types';

// ─── Helpers date ─────────────────────────────────────────────────────────────

/**
 * Vérifie si la promotion est actuellement active (dates + flag enabled).
 */
export function isPromoActive(promo: GlobalPromoConfig | null | undefined): boolean {
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
  const globalActive = isPromoActive(promo);
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
