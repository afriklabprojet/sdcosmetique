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

  /** Étape 1 de la connexion (§5) : indique si un compte existe pour cet e-mail. */
  export async function checkEmail(email: string): Promise<{ exists: boolean; hasPassword: boolean }> {
    const body = await apiRoot<{ exists: boolean; has_password: boolean }>('/login/check', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { exists: body.exists, hasPassword: body.has_password };
  }

  /** Envoie un code de connexion à usage unique par e-mail (§8-9). */
  export async function requestOtp(email: string): Promise<void> {
    await apiRoot('/login/otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  export async function verifyOtp(email: string, code: string): Promise<void> {
    await destroy();
    await apiRoot('/login/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }
}
