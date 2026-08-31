import { api, apiRoot, unwrapData } from '@/shared/api/client';
import {
  joinPersonName,
  mapAddress,
  mapSessionUser,
  toAddressPayload,
  type StorefrontIdentity,
} from '@/shared/api/mappers/account';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type {
  LaravelAccount,
  LaravelAddress,
  LaravelOrder,
  LaravelSession,
} from '@/shared/api/types';
import type { Address } from '@/features/account/account.constant';

export type { StorefrontIdentity };

export async function loginStorefront(email: string, password: string, remember = true): Promise<void> {
  await apiRoot('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, remember }),
  });
}

export async function registerStorefront(input: {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<void> {
  await apiRoot('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: joinPersonName(input.prenom, input.nom),
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
      phone: input.phone,
      terms: true,
    }),
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRoot('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: {
  token: string;
  email: string;
  password: string;
}): Promise<void> {
  await apiRoot('/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token: input.token,
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
    }),
  });
}

export async function logoutStorefront(): Promise<void> {
  await apiRoot('/logout', { method: 'POST' }).catch(() => undefined);
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
}

export async function fetchSession(): Promise<LaravelSession> {
  return api<LaravelSession>('/session');
}

export async function fetchAccount(): Promise<LaravelAccount> {
  const body = await api<{ data: LaravelAccount }>('/account');
  return unwrapData(body);
}

export async function fetchStorefrontIdentity(): Promise<StorefrontIdentity | null> {
  const session = await fetchSession();
  if (!session.user) return null;
  try {
    const account = await fetchAccount();
    return mapSessionUser(session.user, account);
  } catch {
    return mapSessionUser(session.user);
  }
}

export async function updateAccount(input: { name?: string; phone?: string | null }): Promise<LaravelAccount> {
  const body = await api<{ data: LaravelAccount }>('/account', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return unwrapData(body);
}

export async function updatePassword(input: {
  current: string;
  next: string;
}): Promise<void> {
  await apiRoot('/user/password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: input.current,
      password: input.next,
      password_confirmation: input.next,
    }),
  });
}

export async function fetchAddresses(): Promise<Address[]> {
  const body = await api<{ data: LaravelAddress[] }>('/account/addresses');
  return unwrapData(body).map(mapAddress);
}

export async function saveAddress(address: Address, isNew: boolean): Promise<Address> {
  const payload = toAddressPayload(address);
  if (isNew) {
    const body = await api<{ data: LaravelAddress }>('/account/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapAddress(unwrapData(body));
  }
  const body = await api<{ data: LaravelAddress }>(`/account/addresses/${address.id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapAddress(unwrapData(body));
}

export async function deleteAddress(id: string): Promise<void> {
  await api(`/account/addresses/${id}`, { method: 'DELETE' });
}

export async function fetchAccountOrders(): Promise<MappedOrder[]> {
  const body = await api<{ data: LaravelOrder[] }>('/account/orders');
  return unwrapData(body).map(mapOrder);
}

/** Best-effort leftover Next session so M6 loyalty / newsletter routes keep working. */
export async function mirrorNextLogin(email: string, password: string): Promise<void> {
  try {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Leftover Next user is optional until M6.
  }
}

export async function mirrorNextRegister(input: {
  email: string;
  password: string;
  prenom: string;
  nom: string;
}): Promise<void> {
  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    // Leftover Next user is optional until M6.
  }
}
