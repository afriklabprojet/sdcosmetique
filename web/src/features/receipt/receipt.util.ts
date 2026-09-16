/**
 * Formatage dédié au reçu — aligné sur `App\Shared\Money::format()` côté
 * backend ("15 000 FCFA", espace insécable, jamais "F CFA"). Volontairement
 * distinct de `formatPrice` (utilisé partout ailleurs sur le site avec le
 * format `Intl` "F CFA") pour rester visuellement identique au PDF déjà
 * généré par Laravel.
 */
export function formatReceiptAmount(amount: number, currency = 'XOF'): string {
  const suffix = currency === 'XOF' ? 'FCFA' : currency;
  const digits = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);

  return `${digits} ${suffix}`;
}

export function receiptStatusLabel(status: string): string {
  return {
    paid: 'PAIEMENT CONFIRMÉ',
    pending: 'EN ATTENTE',
    refunded: 'REMBOURSÉ',
    partial_refund: 'PARTIELLEMENT REMBOURSÉ',
    cancelled: 'ANNULÉ',
  }[status] ?? status.toUpperCase();
}
