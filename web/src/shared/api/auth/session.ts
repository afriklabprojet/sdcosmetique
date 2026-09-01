/* eslint-disable @typescript-eslint/no-namespace */
import { api, apiRoot, resetCsrf } from '@/shared/api/client';
import type { LaravelSession } from '@/shared/api/types';

export namespace Session {
  export async function create(email: string, password: string, remember = true): Promise<void> {
    await destroy();
    await apiRoot('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    });
  }

  export async function destroy(): Promise<void> {
    await apiRoot('/logout', { method: 'POST' }).catch(() => undefined);
    resetCsrf();
  }

  export async function read(): Promise<LaravelSession> {
    return api<LaravelSession>('/session');
  }
}
