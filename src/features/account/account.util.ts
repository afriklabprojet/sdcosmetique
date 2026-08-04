/*
 * Petites fonctions de presentation de l'espace client, extraites de
 * `app/compte/page.tsx` (F-111). Elles ne gardent rien entre deux appels :
 * un module de fonctions pures suffit.
 */
import type { JekoTransaction, JEKO_TIERS } from '@/features/loyalty/jeko.repository';

export function jekoNextLabel(currentLabel: string, tiers: typeof JEKO_TIERS): string {
  const idx = tiers.findIndex(t => t.label === currentLabel);
  return idx >= 0 && idx < tiers.length - 1 ? tiers[idx + 1].label : '';
}

export function getTierGradient(label: string): string {
  switch (label) {
    case 'Diamant':
      return 'linear-gradient(135deg,#0c1a2e 0%,#1a3a5c 40%,#0ea5e9 100%)';
    case 'Platine':
      return 'linear-gradient(135deg,#1a0a2e 0%,#4a1a7a 50%,#9333EA 100%)';
    case 'Gold':
      return 'linear-gradient(135deg,#3D1400 0%,#6B3D14 50%,#C8974A 100%)';
    case 'Argent':
      return 'linear-gradient(135deg,#1a1a1a 0%,#3a3a3a 50%,#6B7280 100%)';
    default:
      return 'linear-gradient(135deg,#2a1400 0%,#5a2d0c 50%,#CD7F32 100%)';
  }
}

export function getTransactionIcon(reason: JekoTransaction['reason']): string {
  switch (reason) {
    case 'purchase':
      return '🛍️';
    case 'welcome':
      return '🎉';
    case 'referral':
      return '👥';
    case 'redemption':
      return '🎁';
    default:
      return '✏️';
  }
}

export function toProfileMeta(form: { prenom: string; nom: string; telephone: string }): Record<string, string> {
  return {
    ...(form.prenom ? { prenom: form.prenom } : {}),
    ...(form.nom ? { nom: form.nom } : {}),
    ...(form.telephone ? { telephone: form.telephone } : {}),
  };
}
