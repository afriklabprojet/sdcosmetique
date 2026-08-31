/* eslint-disable @typescript-eslint/no-namespace */
import { api } from '@/shared/api/client';
import type { LaravelAdminSession } from '@/shared/api/types';

export namespace Session {
  export async function fetch(): Promise<LaravelAdminSession> {
    return api<LaravelAdminSession>('/admin/session');
  }
}
