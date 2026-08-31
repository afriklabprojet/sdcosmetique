/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapAddress, toAddressPayload } from '@/shared/api/mappers/account';
import type { LaravelAddress } from '@/shared/api/types';
import type { Address } from '@/features/account/account.constant';

export namespace AddressBook {
  export async function read(): Promise<Address[]> {
    const body = await api<{ data: LaravelAddress[] }>('/account/addresses');
    return unwrapData(body).map(mapAddress);
  }

  export async function create(address: Address): Promise<Address> {
    const body = await api<{ data: LaravelAddress }>('/account/addresses', {
      method: 'POST',
      body: JSON.stringify(toAddressPayload(address)),
    });
    return mapAddress(unwrapData(body));
  }

  export async function update(address: Address): Promise<Address> {
    const body = await api<{ data: LaravelAddress }>(`/account/addresses/${address.id}`, {
      method: 'PUT',
      body: JSON.stringify(toAddressPayload(address)),
    });
    return mapAddress(unwrapData(body));
  }

  export async function drop(id: string): Promise<void> {
    await api(`/account/addresses/${id}`, { method: 'DELETE' });
  }
}
