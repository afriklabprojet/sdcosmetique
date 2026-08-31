/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { splitPersonName } from '@/shared/api/mappers/account';
import type { JekoMember, JekoTransactionAdmin } from './types';

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

export namespace Admin {
  export async function accounts(): Promise<JekoMember[]> {
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

  export async function entries(): Promise<JekoTransactionAdmin[]> {
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

  export async function adjust(input: {
    client: number;
    delta: number;
    label: string;
  }): Promise<void> {
    await api('/admin/loyalty/adjustments', {
      method: 'POST',
      body: JSON.stringify({
        client_id: input.client,
        points_delta: input.delta,
        description: input.label,
      }),
    });
  }
}
