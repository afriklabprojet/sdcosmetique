/*
 * Formatage des prix (FCFA) — source unique. Il existait deux copies quasi
 * identiques (product.query.ts, site-config.util.ts, cette dernière jamais
 * utilisée) plus une quinzaine de sites qui recomposaient le même résultat
 * à la main via `toLocaleString('fr-FR')` + un « FCFA » tapé en dur, avec un
 * libellé légèrement différent de celui que produit vraiment Intl ("FCFA"
 * au lieu de "F CFA") — même prix, deux rendus visuels différents selon la
 * page.
 */

/** Le libellé exact que produit `Intl.NumberFormat('fr-FR', { currency: 'XOF' })` — à réutiliser tel quel partout où le prix est décomposé en deux éléments (chiffre + devise stylés séparément). */
export const CURRENCY_LABEL = 'F CFA';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
}
