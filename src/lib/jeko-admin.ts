'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JekoSettings {
  points_per_1000: number;
  welcome_bonus: number;
}

export interface JekoTierConfig {
  label: string;
  min: number;
  next: number | null;
  emoji: string;
  color: string;
  bg: string;
  textColor: string;
}

export interface JekoRewardConfig {
  id: string;
  pts: number;
  label: string;
  icon: string;
  description: string;
  active: boolean;
}

export interface JekoMember {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  points: number;
  created_at: string;
}

export interface JekoTransactionAdmin {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  label: string | null;
  reference_id: string | null;
  created_at: string;
}

// ─── Defaults (fallback si DB vide) ──────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Lecture config ───────────────────────────────────────────────────────────

export async function getJekoSettings(): Promise<JekoSettings> {
  const data = await apiFetch<{ value: JekoSettings }>('/api/admin/jeko/config?key=settings');
  return data?.value ?? { points_per_1000: 10, welcome_bonus: 20 };
}

export async function getJekoTiersConfig(): Promise<JekoTierConfig[]> {
  const data = await apiFetch<{ value: JekoTierConfig[] }>('/api/admin/jeko/config?key=tiers');
  return data?.value ?? DEFAULT_JEKO_TIERS;
}

export async function getJekoRewardsConfig(): Promise<JekoRewardConfig[]> {
  const data = await apiFetch<{ value: JekoRewardConfig[] }>('/api/admin/jeko/config?key=rewards');
  return data?.value ?? DEFAULT_JEKO_REWARDS;
}

// ─── Sauvegarde config (admin seulement) ─────────────────────────────────────

export async function saveJekoConfig(
  key: 'settings' | 'tiers' | 'rewards',
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const data = await apiFetch<{ ok: boolean; error?: string }>('/api/admin/jeko/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  return data ?? { ok: false, error: 'Erreur réseau' };
}

// ─── Membres ─────────────────────────────────────────────────────────────────

export async function getJekoMembers(): Promise<JekoMember[]> {
  const data = await apiFetch<JekoMember[]>('/api/admin/jeko/members');
  return data ?? [];
}

// ─── Transactions (admin) ────────────────────────────────────────────────────

export async function getAllJekoTransactions(userId?: string): Promise<JekoTransactionAdmin[]> {
  const url = userId
    ? `/api/admin/jeko/transactions?userId=${encodeURIComponent(userId)}`
    : '/api/admin/jeko/transactions';
  const data = await apiFetch<JekoTransactionAdmin[]>(url);
  return data ?? [];
}

// ─── Ajustement manuel ────────────────────────────────────────────────────────

export async function manualJekoAdjustment(
  userId: string,
  points: number,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  const data = await apiFetch<{ ok: boolean; error?: string }>('/api/admin/jeko/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, points, label }),
  });
  return data ?? { ok: false, error: 'Erreur réseau' };
}

// ─── Statistiques globales ────────────────────────────────────────────────────

export interface JekoStats {
  totalMembers: number;
  totalPointsDistributed: number;
  totalRedemptions: number;
}

export async function getJekoStats(): Promise<JekoStats> {
  const data = await apiFetch<JekoStats>('/api/admin/jeko/stats');
  return data ?? { totalMembers: 0, totalPointsDistributed: 0, totalRedemptions: 0 };
}
