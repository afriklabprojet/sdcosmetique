/* eslint-disable @typescript-eslint/no-namespace */
import { api, apiUrl, type Paginated } from '@/shared/api/client';
import { mapOrder, toLaravelOrderStatus, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder } from '@/shared/api/types';
import type { OrderDraft } from '@/features/orders/order.store';

export namespace Order {
  export async function list(): Promise<MappedOrder[]> {
    const body = await api<Paginated<LaravelOrder>>('/admin/orders?perPage=100');
    return body.data.map(mapOrder);
  }

  export async function patch(item: MappedOrder, status: OrderDraft['status']): Promise<void> {
    const target = toLaravelOrderStatus(status);
    if (!target) return;
    await api(`/admin/orders/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: target,
        reason: target === 'cancelled' ? 'Cancelled from administration' : undefined,
      }),
    });
  }

  export async function markPaid(item: MappedOrder): Promise<void> {
    await api(`/admin/orders/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'paid',
      }),
    });
  }

  export async function markRefunded(item: MappedOrder): Promise<void> {
    await api(`/admin/orders/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'refunded',
      }),
    });
  }

  /** Le seul cas où l'admin peut supprimer une commande : elle n'a jamais été payée. */
  export async function discard(item: MappedOrder): Promise<void> {
    await api(`/admin/orders/${item.id}`, { method: 'DELETE' });
  }

  /** Widget « Non payées » du tableau de bord — supprime tout en un appel. */
  export async function discardUnpaid(): Promise<{ deleted: number }> {
    return api<{ deleted: number }>('/admin/orders/unpaid', { method: 'DELETE' });
  }

  /** "Voir le reçu" / "Imprimer" — le lecteur PDF du navigateur gère l'impression. */
  export function invoiceViewUrl(item: MappedOrder): string {
    return apiUrl(`/admin/orders/${item.id}/invoice`);
  }

  export function invoiceDownloadUrl(item: MappedOrder): string {
    return apiUrl(`/admin/orders/${item.id}/invoice/download`);
  }

  /** "Envoyer par e-mail" / "Renvoyer le reçu" — même appel pour les deux. */
  export async function sendInvoiceEmail(item: MappedOrder): Promise<{ email_status: string }> {
    return api<{ data: { email_status: string } }>(`/admin/orders/${item.id}/invoice/send`, {
      method: 'POST',
    }).then((body) => body.data);
  }

  export type InvoiceStatus = {
    number: string;
    email_status: 'not_sent' | 'pending' | 'sent' | 'failed';
    email_sent_at: string | null;
    email_error: string | null;
  };

  /** Numéro de facture + statut d'envoi courant, sans déclencher de rendu ni d'envoi. */
  export async function invoiceStatus(item: MappedOrder): Promise<InvoiceStatus> {
    return api<{ data: InvoiceStatus }>(`/admin/orders/${item.id}/invoice/status`).then((body) => body.data);
  }
}
