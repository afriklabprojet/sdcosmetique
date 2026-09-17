/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';
import { mapOrder, type MappedOrder } from '@/shared/api/mappers/order';
import type { LaravelOrder, LaravelPaymentInit } from '@/shared/api/types';
import type { PaymentMethod } from '@/shared/types/domain.type';
import type { ReceiptData } from '@/features/receipt/receipt.type';

export namespace Order {
  export async function commit(): Promise<MappedOrder> {
    const body = await api<{ data: LaravelOrder }>('/orders', { method: 'POST' });
    return mapOrder(unwrapData(body));
  }

  /**
   * `email` authentifie l'accès à une commande invité (sans compte) — la
   * référence seule (courte et séquentielle, §audit) ne suffit plus depuis
   * qu'elle est prévisible.
   */
  export async function initiate(reference: string, paymentMethod: PaymentMethod, email?: string): Promise<LaravelPaymentInit> {
    const body = await api<{ data: LaravelPaymentInit }>(
      `/orders/${encodeURIComponent(reference)}/payments`,
      { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod, email }) },
    );
    return unwrapData(body);
  }

  export async function read(reference: string, email?: string): Promise<MappedOrder> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    const body = await api<{ data: LaravelOrder }>(`/orders/${encodeURIComponent(reference)}${qs}`);
    return mapOrder(unwrapData(body));
  }

  export async function reconcile(reference: string, email?: string): Promise<MappedOrder> {
    const body = await api<{ data: LaravelOrder }>(
      `/orders/${encodeURIComponent(reference)}/payment-reconciliations`,
      { method: 'POST', body: JSON.stringify({ email }) },
    );
    return mapOrder(unwrapData(body));
  }

  /**
   * Reçu public (§14) — protégé par une URL signée Laravel (`signature`
   * fournie par le lien/QR du reçu), pas par l'e-mail : une vente caisse lie
   * quasi systématiquement un compte dès qu'un e-mail est saisi, ce qui
   * rendrait le second facteur « référence + e-mail » inutilisable ici.
   */
  export async function receipt(reference: string, signature: string): Promise<ReceiptData> {
    const body = await api<{ data: ReceiptData }>(`/orders/${encodeURIComponent(reference)}/receipt?signature=${encodeURIComponent(signature)}`);
    return unwrapData(body);
  }
}
