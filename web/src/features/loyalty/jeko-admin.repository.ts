'use client';

import type { OperationResult } from '@/shared/types/operation-result.type';
import {
  fetchAdminLoyaltyAccounts,
  fetchAdminLoyaltyEntries,
  fetchJekoRewards,
  fetchJekoSettings,
  fetchJekoStats,
  fetchJekoTiers,
  saveJekoRewards,
  saveJekoSettings,
  saveJekoTiers,
  storeAdminLoyaltyAdjustment,
  type JekoMember,
  type JekoRewardConfig,
  type JekoSettings,
  type JekoStats,
  type JekoTierConfig,
  type JekoTransactionAdmin,
} from '@/shared/api/loyalty';

export type {
  JekoMember,
  JekoRewardConfig,
  JekoSettings,
  JekoStats,
  JekoTierConfig,
  JekoTransactionAdmin,
};

export const DEFAULT_JEKO_TIERS: JekoTierConfig[] = [
  { label: 'Bronze',  min: 0,    next: 50,   emoji: '🥉', color: '#CD7F32', bg: '#FDF6EE', textColor: '#92400E' },
  { label: 'Argent',  min: 50,   next: 200,  emoji: '⭐', color: '#6B7280', bg: '#F9FAFB', textColor: '#374151' },
  { label: 'Gold',    min: 200,  next: 500,  emoji: '👑', color: '#C8974A', bg: '#FFF7ED', textColor: '#92400E' },
  { label: 'Platine', min: 500,  next: 1000, emoji: '✨', color: '#9333EA', bg: '#FAF5FF', textColor: '#7C3AED' },
  { label: 'Diamant', min: 1000, next: null, emoji: '💎', color: '#0EA5E9', bg: '#F0F9FF', textColor: '#0369A1' },
];

export const DEFAULT_JEKO_REWARDS: JekoRewardConfig[] = [
  { id: 'r100', pts: 100, label: '-1 000 FCFA',   icon: '🎁', description: '1 000 FCFA de réduction sur votre prochaine commande', active: true },
  { id: 'r300', pts: 300, label: '-3 000 FCFA',   icon: '💎', description: '3 000 FCFA de réduction sur votre prochaine commande', active: true },
  { id: 'r500', pts: 500, label: 'Produit offert', icon: '👑', description: 'Un produit au choix jusqu à 5 000 FCFA offert',        active: true },
];

export async function getJekoSettings(): Promise<JekoSettings> {
  return fetchJekoSettings();
}

export async function getJekoTiersConfig(): Promise<JekoTierConfig[]> {
  const rows = await fetchJekoTiers();
  return rows.length ? rows : DEFAULT_JEKO_TIERS;
}

export async function getJekoRewardsConfig(): Promise<JekoRewardConfig[]> {
  const rows = await fetchJekoRewards();
  return rows.length ? rows : DEFAULT_JEKO_REWARDS;
}

export async function saveJekoConfig(
  key: 'settings' | 'tiers' | 'rewards',
  value: unknown,
): Promise<OperationResult> {
  try {
    if (key === 'settings') await saveJekoSettings(value as JekoSettings);
    else if (key === 'tiers') await saveJekoTiers(value as JekoTierConfig[]);
    else await saveJekoRewards(value as JekoRewardConfig[]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur réseau' };
  }
}

export async function getJekoMembers(): Promise<JekoMember[]> {
  return fetchAdminLoyaltyAccounts();
}

export async function getAllJekoTransactions(userId?: string): Promise<JekoTransactionAdmin[]> {
  const rows = await fetchAdminLoyaltyEntries();
  return userId ? rows.filter((row) => row.user_id === userId) : rows;
}

export interface JekoAdjustment {
  /** Member whose balance is adjusted. */
  userId: string;
  /** Points added (positive) or removed (negative). */
  points: number;
  /** Motif affiché au membre dans son historique. */
  label: string;
}

export async function manualJekoAdjustment(adjustment: JekoAdjustment): Promise<OperationResult> {
  const clientId = Number(adjustment.userId);
  if (!Number.isFinite(clientId) || clientId < 1) {
    return { ok: false, error: 'Membre invalide' };
  }
  try {
    await storeAdminLoyaltyAdjustment({
      client_id: clientId,
      points_delta: adjustment.points,
      description: adjustment.label,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur réseau' };
  }
}

export async function getJekoStats(): Promise<JekoStats> {
  return fetchJekoStats();
}
