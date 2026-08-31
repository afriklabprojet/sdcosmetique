/* eslint-disable @typescript-eslint/no-namespace */
import { api, apiRoot, unwrapData } from '@/shared/api/client';
import {
  joinPersonName,
  mapSessionUser,
  type StorefrontIdentity,
} from '@/shared/api/mappers/account';
import type { LaravelAccount } from '@/shared/api/types';
import { Session } from './session';

export namespace Account {
  export async function create(input: {
    first: string;
    last: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<void> {
    await Session.destroy();
    await apiRoot('/register', {
      method: 'POST',
      body: JSON.stringify({
        name: joinPersonName(input.first, input.last),
        email: input.email,
        password: input.password,
        password_confirmation: input.password,
        phone: input.phone,
        terms: true,
      }),
    });
  }

  export async function read(): Promise<LaravelAccount> {
    const body = await api<{ data: LaravelAccount }>('/account');
    return unwrapData(body);
  }

  export async function update(input: { name?: string; phone?: string | null }): Promise<LaravelAccount> {
    const body = await api<{ data: LaravelAccount }>('/account', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return unwrapData(body);
  }

  export async function identify(): Promise<StorefrontIdentity | null> {
    const session = await Session.read();
    if (!session.user) return null;

    try {
      const account = await read();
      return mapSessionUser(session.user, account);
    } catch {
      return mapSessionUser(session.user);
    }
  }
}
