'use client';

import { createClient } from '@/utils/supabase/client';

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

// ─── Lecture config ───────────────────────────────────────────────────────────

export async function getJekoSettings(): Promise<JekoSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from('jeko_config')
    .select('value')
    .eq('key', 'settings')
    .single();
  return (data?.value as JekoSettings) ?? { points_per_1000: 10, welcome_bonus: 20 };
}

export async function getJekoTiersConfig(): Promise<JekoTierConfig[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('jeko_config')
    .select('value')
    .eq('key', 'tiers')
    .single();
  return (data?.value as JekoTierConfig[]) ?? DEFAULT_JEKO_TIERS;
}

export async function getJekoRewardsConfig(): Promise<JekoRewardConfig[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('jeko_config')
    .select('value')
    .eq('key', 'rewards')
    .single();
  return (data?.value as JekoRewardConfig[]) ?? DEFAULT_JEKO_REWARDS;
}

// ─── Sauvegarde config (admin seulement) ─────────────────────────────────────

export async function saveJekoConfig(
  key: 'settings' | 'tiers' | 'rewards',
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('jeko_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Membres ─────────────────────────────────────────────────────────────────

export async function getJekoMembers(): Promise<JekoMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, points, created_at')
    .order('points', { ascending: false });
  if (error || !data) return [];
  return data as JekoMember[];
}

// ─── Transactions (admin) ────────────────────────────────────────────────────

export async function getAllJekoTransactions(userId?: string): Promise<JekoTransactionAdmin[]> {
  const supabase = createClient();
  let q = supabase
    .from('jeko_transactions')
    .select('id, user_id, points, reason, label, reference_id, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as JekoTransactionAdmin[];
}

// ─── Ajustement manuel ────────────────────────────────────────────────────────

export async function manualJekoAdjustment(
  userId: string,
  points: number,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('jeko_transactions').insert({
    user_id:     userId,
    points,
    reason:      'manual',
    label:       label.trim() || (points > 0 ? `+${points} pts (ajustement admin)` : `${points} pts (ajustement admin)`),
    reference_id: null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Statistiques globales ────────────────────────────────────────────────────

export interface JekoStats {
  totalMembers: number;
  totalPointsDistributed: number;
  totalRedemptions: number;
}

export async function getJekoStats(): Promise<JekoStats> {
  const supabase = createClient();

  const [membersRes, transRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('jeko_transactions').select('points, reason'),
  ]);

  const totalMembers = membersRes.count ?? 0;
  const transactions = transRes.data ?? [];
  const totalPointsDistributed = transactions
    .filter(t => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);
  const totalRedemptions = transactions
    .filter(t => t.reason === 'redemption')
    .length;

  return { totalMembers, totalPointsDistributed, totalRedemptions };
}
