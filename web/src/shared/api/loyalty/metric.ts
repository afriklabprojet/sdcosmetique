/* eslint-disable @typescript-eslint/no-namespace */
import { api } from '@/shared/api/client';
import type { JekoStats } from './types';

export namespace Metric {
  export async function stats(): Promise<JekoStats> {
    const metrics = await api<{ loyalty?: { members: number; points_issued: number } }>('/admin/metrics/overview');
    return {
      totalMembers: metrics.loyalty?.members ?? 0,
      totalPointsDistributed: metrics.loyalty?.points_issued ?? 0,
      totalRedemptions: 0,
    };
  }
}
