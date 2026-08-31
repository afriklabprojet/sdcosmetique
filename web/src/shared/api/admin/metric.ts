/* eslint-disable @typescript-eslint/no-namespace */
import { api } from '@/shared/api/client';
import type { LaravelMetricsOverview } from '@/shared/api/types';

export namespace Metric {
  export async function overview(): Promise<LaravelMetricsOverview> {
    return api<LaravelMetricsOverview>('/admin/metrics/overview');
  }
}
