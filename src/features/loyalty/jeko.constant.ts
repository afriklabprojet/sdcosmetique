export interface JekoTransaction {
  id: string;
  points: number;
  reason: 'purchase' | 'welcome' | 'referral' | 'redemption' | 'manual';
  label: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface JekoTier {
  label: string;
  next: number;
  emoji: string;
  color: string;
  bg: string;
  textColor: string;
}

export const JEKO_TIERS: JekoTier[] = [
  { label: 'Bronze',  next: 50,      emoji: '🥉', color: '#CD7F32', bg: '#FDF6EE', textColor: '#92400E' },
  { label: 'Argent',  next: 200,     emoji: '⭐', color: '#6B7280', bg: '#F9FAFB', textColor: '#374151' },
  { label: 'Gold',    next: 500,     emoji: '👑', color: '#C8974A', bg: '#FFF7ED', textColor: '#92400E' },
  { label: 'Platine', next: 1000,    emoji: '✨', color: '#9333EA', bg: '#FAF5FF', textColor: '#7C3AED' },
  { label: 'Diamant', next: Infinity, emoji: '💎', color: '#0EA5E9', bg: '#F0F9FF', textColor: '#0369A1' },
];

export function getJekoTier(points: number): JekoTier {
  if (points >= 1000) return JEKO_TIERS[4];
  if (points >= 500)  return JEKO_TIERS[3];
  if (points >= 200)  return JEKO_TIERS[2];
  if (points >= 50)   return JEKO_TIERS[1];
  return JEKO_TIERS[0];
}

export interface JekoReward {
  id: string;
  pts: number;
  label: string;
  icon: string;
  description: string;
  active?: boolean;
}

export const JEKO_REWARDS: JekoReward[] = [
  { id: 'r100', pts: 100, label: '-1 000 FCFA',   icon: '🎁', description: '1 000 FCFA de réduction sur votre prochaine commande', active: true },
  { id: 'r300', pts: 300, label: '-3 000 FCFA',   icon: '💎', description: '3 000 FCFA de réduction sur votre prochaine commande', active: true },
  { id: 'r500', pts: 500, label: 'Produit offert', icon: '👑', description: 'Un produit au choix jusqu\'à 5 000 FCFA offert',       active: true },
];

export function resolveJekoTier(points: number, tiers: JekoTier[]): JekoTier {
  const sorted = [...tiers].sort((a, b) => b.next - a.next);
  return sorted.find(t => points >= (t.next === Infinity ? 0 : tiers.indexOf(t) === 0 ? 0 : tiers[tiers.indexOf(t) - 1]?.next ?? 0)) ?? tiers[0];
}

export function computePurchasePoints(totalFcfa: number): number {
  return Math.floor(totalFcfa / 1000) * 10;
}

export interface JekoConfig {
  settings: { points_per_1000: number; welcome_bonus: number };
  tiers: JekoTier[];
  rewards: JekoReward[];
}

export function formatJekoDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function reasonLabel(reason: JekoTransaction['reason'], label: string | null): string {
  if (label) return label;
  switch (reason) {
    case 'purchase':   return 'Achat en boutique';
    case 'welcome':    return 'Bonus bienvenue 🎉';
    case 'referral':   return 'Parrainage';
    case 'redemption': return 'Récompense utilisée';
    case 'manual':     return 'Ajustement manuel';
  }
}
