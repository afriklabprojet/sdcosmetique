import { api, unwrapData } from '@/shared/api/client';
import { splitPersonName } from '@/shared/api/mappers/account';
import { fetchAdminSetting, patchAdminSetting } from '@/shared/api/settings';
import type { JekoTransaction } from '@/features/loyalty/jeko.constant';

export type JekoSettings = { points_per_1000: number; welcome_bonus: number };
export type JekoTierConfig = {
  label: string;
  min: number;
  next: number | null;
  emoji: string;
  color: string;
  bg: string;
  textColor: string;
};
export type JekoRewardConfig = {
  id: string;
  pts: number;
  label: string;
  icon: string;
  description: string;
  active: boolean;
};
export type JekoMember = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  points: number;
  created_at: string;
};
export type JekoTransactionAdmin = {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  label: string | null;
  reference_id: string | null;
  created_at: string;
};
export type JekoStats = {
  totalMembers: number;
  totalPointsDistributed: number;
  totalRedemptions: number;
};

type LaravelAccount = {
  id: number;
  client_id: number;
  email: string | null;
  name: string | null;
  current_points: number;
  lifetime_points: number;
  tier: string;
  updated_at: string | null;
};

type LaravelEntry = {
  id: number;
  points_delta: number;
  balance_after: number;
  reason: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
  client_id?: number;
};

function mapReason(reason: string): JekoTransaction['reason'] {
  switch (reason) {
    case 'order_reward':
      return 'purchase';
    case 'signup_bonus':
      return 'welcome';
    case 'points_redemption':
      return 'redemption';
    default:
      return 'manual';
  }
}

function mapEntry(row: LaravelEntry): JekoTransaction {
  return {
    id: String(row.id),
    points: row.points_delta,
    reason: mapReason(row.reason),
    label: row.description,
    reference_id: row.reference_id,
    created_at: row.created_at,
  };
}

export async function fetchLoyaltySnapshot(): Promise<{ points: number; entries: JekoTransaction[] }> {
  const body = await api<{ data: LaravelEntry[] }>('/loyalty-entries');
  const rows = unwrapData(body);
  return {
    points: rows[0]?.balance_after ?? 0,
    entries: rows.map(mapEntry),
  };
}

export async function redeemLoyalty(input: {
  points_delta: number;
  description: string;
  reference_id?: string;
}): Promise<{ points: number; entry: JekoTransaction }> {
  const body = await api<{ data: LaravelEntry }>('/loyalty-entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const row = unwrapData(body);
  return { points: row.balance_after, entry: mapEntry(row) };
}

export async function fetchAdminLoyaltyAccounts(): Promise<JekoMember[]> {
  const body = await api<{ data: LaravelAccount[] }>('/admin/loyalty/accounts');
  return unwrapData(body).map((row) => {
    const { prenom, nom } = splitPersonName(row.name ?? '');
    return {
      id: String(row.client_id),
      email: row.email ?? '',
      prenom,
      nom,
      points: row.current_points,
      created_at: row.updated_at ?? '',
    };
  });
}

export async function fetchAdminLoyaltyEntries(): Promise<JekoTransactionAdmin[]> {
  const body = await api<{ data: LaravelEntry[] }>('/admin/loyalty/entries');
  return unwrapData(body).map((row) => ({
    id: String(row.id),
    user_id: String(row.client_id ?? ''),
    points: row.points_delta,
    reason: row.reason,
    label: row.description,
    reference_id: row.reference_id,
    created_at: row.created_at,
  }));
}

export async function storeAdminLoyaltyAdjustment(input: {
  client_id: number;
  points_delta: number;
  description: string;
}): Promise<void> {
  await api('/admin/loyalty/adjustments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchJekoSettings(): Promise<JekoSettings> {
  const value = (await fetchAdminSetting('jeko')) as Partial<JekoSettings> | null;
  return {
    points_per_1000: value?.points_per_1000 ?? 10,
    welcome_bonus: value?.welcome_bonus ?? 20,
  };
}

export async function fetchJekoTiers(): Promise<JekoTierConfig[]> {
  return ((await fetchAdminSetting('jeko_tiers')) as JekoTierConfig[]) ?? [];
}

export async function fetchJekoRewards(): Promise<JekoRewardConfig[]> {
  return ((await fetchAdminSetting('jeko_rewards')) as JekoRewardConfig[]) ?? [];
}

export async function saveJekoSettings(value: JekoSettings): Promise<void> {
  const current = ((await fetchAdminSetting('jeko')) as Record<string, unknown>) ?? {};
  await patchAdminSetting('jeko', { ...current, ...value }, false);
}

export async function saveJekoTiers(value: JekoTierConfig[]): Promise<void> {
  await patchAdminSetting('jeko_tiers', value, false);
}

export async function saveJekoRewards(value: JekoRewardConfig[]): Promise<void> {
  await patchAdminSetting('jeko_rewards', value, false);
}

export async function fetchJekoStats(): Promise<JekoStats> {
  const metrics = await api<{ loyalty?: { members: number; points_issued: number } }>('/admin/metrics/overview');
  return {
    totalMembers: metrics.loyalty?.members ?? 0,
    totalPointsDistributed: metrics.loyalty?.points_issued ?? 0,
    totalRedemptions: 0,
  };
}
