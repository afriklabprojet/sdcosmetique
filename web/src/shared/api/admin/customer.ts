/* eslint-disable @typescript-eslint/no-namespace */
import { api, type Paginated } from '@/shared/api/client';
import { mapCustomer } from '@/shared/api/mappers/customer';
import type { LaravelCustomer } from '@/shared/api/types';
import type { ClientRow } from '@/features/admin/admin.type';

export namespace Customer {
  export async function list(): Promise<ClientRow[]> {
    const body = await api<Paginated<LaravelCustomer>>('/admin/customers?perPage=100');
    return body.data.map(mapCustomer);
  }
}
