/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import type { JekoTransaction } from '@/features/loyalty/jeko.constant';

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

export function mapEntry(row: LaravelEntry): JekoTransaction {
  return {
    id: String(row.id),
    points: row.points_delta,
    reason: mapReason(row.reason),
    label: row.description,
    reference_id: row.reference_id,
    created_at: row.created_at,
  };
}

export namespace Customer {
  export async function read(): Promise<{ points: number; entries: JekoTransaction[] }> {
    const body = await api<{ data: LaravelEntry[] }>('/loyalty-entries');
    const rows = unwrapData(body);
    return {
      points: rows[0]?.balance_after ?? 0,
      entries: rows.map(mapEntry),
    };
  }

  export async function redeem(input: {
    delta: number;
    label: string;
    reference?: string;
  }): Promise<{ points: number; entry: JekoTransaction }> {
    const body = await api<{ data: LaravelEntry }>('/loyalty-entries', {
      method: 'POST',
      body: JSON.stringify({
        points_delta: input.delta,
        description: input.label,
        reference_id: input.reference,
      }),
    });
    const row = unwrapData(body);
    return { points: row.balance_after, entry: mapEntry(row) };
  }
}
