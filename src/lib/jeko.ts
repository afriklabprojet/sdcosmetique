/**
 * jeko.ts — Système de fidélité "SDZ Fidélité"
 * Règle : 1 000 FCFA dépensé = 10 points ; 1 point = 10 FCFA de réduction
 *
 * Sécurité :
 *  - Les crédits (achat, bienvenue) sont insérés exclusivement par des triggers DB (SECURITY DEFINER)
 *  - Les débits (rédemptions) sont insérés depuis le client avec une policy RLS `points < 0`
 *  - Un trigger BEFORE INSERT valide que le solde ne devient pas négatif
 */
import { createClient } from '@/utils/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Paliers ──────────────────────────────────────────────────────────────────

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

// ─── Récompenses ──────────────────────────────────────────────────────────────

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

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/** Résoudre le palier depuis un tableau de paliers (support config dynamique) */
export function getJekoTierFromList(points: number, tiers: JekoTier[]): JekoTier {
  const sorted = [...tiers].sort((a, b) => b.next - a.next);
  return sorted.find(t => points >= (t.next === Infinity ? 0 : tiers.indexOf(t) === 0 ? 0 : tiers[tiers.indexOf(t) - 1]?.next ?? 0)) ?? tiers[0];
}

/** 1 000 FCFA dépensé = 10 points (règle par défaut) */
export function computePurchasePoints(totalFcfa: number): number {
  return Math.floor(totalFcfa / 1000) * 10;
}

// ─── Config dynamique depuis Supabase ─────────────────────────────────────────

export interface JekoConfig {
  settings: { points_per_1000: number; welcome_bonus: number };
  tiers: JekoTier[];
  rewards: JekoReward[];
}

/** Charger toute la config Jeko depuis la DB (fallback sur les valeurs statiques) */
export async function fetchJekoConfig(): Promise<JekoConfig> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jeko_config')
    .select('key, value');

  if (error || !data) {
    return { settings: { points_per_1000: 10, welcome_bonus: 20 }, tiers: JEKO_TIERS, rewards: JEKO_REWARDS };
  }

  const byKey = Object.fromEntries(data.map(r => [r.key, r.value]));
  return {
    settings: (byKey['settings'] as JekoConfig['settings']) ?? { points_per_1000: 10, welcome_bonus: 20 },
    tiers:    (byKey['tiers']    as JekoTier[])              ?? JEKO_TIERS,
    rewards:  (byKey['rewards']  as JekoReward[])            ?? JEKO_REWARDS,
  };
}

/** Formater une date ISO en "14 avr. 2026" */
export function formatJekoDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Libellé affiché selon la raison */
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

// ─── Fonctions Supabase ───────────────────────────────────────────────────────

/** Récupérer l'historique des transactions (50 dernières) */
export async function getJekoHistory(userId: string): Promise<JekoTransaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jeko_transactions')
    .select('id, points, reason, label, reference_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as JekoTransaction[];
}

/**
 * Utiliser une récompense (insère un débit négatif).
 * Le trigger DB valide que le solde ne devient pas négatif.
 */
export async function redeemJekoPoints(
  userId: string,
  reward: JekoReward,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('jeko_transactions').insert({
    user_id:     userId,
    points:      -reward.pts,
    reason:      'redemption',
    label:       `Récompense utilisée : ${reward.label}`,
    reference_id: null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
