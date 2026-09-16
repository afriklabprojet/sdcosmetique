/* eslint-disable @typescript-eslint/no-namespace */
import { api, apiUrl } from '@/shared/api/client';
import type { ReceiptData, ReceiptFormat } from '@/features/receipt/receipt.type';

export type PosProduct = {
  id: number;
  title: string;
  label: string | null;
  sku: string | null;
  unit_price: number;
  stock: number;
  available: boolean;
};

export type PosRegister = {
  id: number;
  name: string;
  location: string | null;
  has_open_session: boolean;
};

export type PosSession = {
  id: number;
  cash_register_id: number;
  status: 'open' | 'closed';
  opening_balance: number;
  expected_cash: number | null;
  actual_cash: number | null;
  difference: number | null;
  totals_by_method: Record<string, number>;
  opened_at: string;
  closed_at: string | null;
};

export type PosTenderMethod = 'cash' | 'card' | 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money' | 'jeko';

/** Réseau mobile money réel utilisé par un règlement Jeko — distinct de `PosTenderMethod` (qui ne contient que `'jeko'`). */
export type JekoNetwork = 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money' | 'djamo';

export type PosSaleItem = {
  id: number;
  title: string;
  label: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  refunded_quantity: number;
};

export type PosSaleAdjustment = {
  type: string;
  operation: 'add' | 'subtract';
  amount: number;
  label: string;
};

export type PosSaleTender = {
  method: string;
  amount: number;
  received: number | null;
  change: number;
  /** Paiement Jeko en attente de confirmation par webhook (§ paiement réel) — ni confirmé, ni échoué. */
  pending: boolean;
  redirect_url: string | null;
  qr_image: string | null;
};

export type PosSale = {
  id: number;
  reference: string;
  status: string;
  channel: string;
  customer: {
    client_id: number | null;
    name: string;
    phone: string | null;
    email: string | null;
  };
  cashier: string | null;
  subtotal: number;
  total: number;
  currency: string;
  items: PosSaleItem[];
  adjustments: PosSaleAdjustment[];
  tenders: PosSaleTender[];
  note: string | null;
  placed_at: string;
  paid_at: string | null;
  refunded_at: string | null;
  refund_status: 'none' | 'partial' | 'full';
  refunded_amount: number;
};

export type CreatePosSalePayload = {
  cash_register_session_id: number;
  client_id?: number | null;
  email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  items: { product_id: number; quantity: number }[];
  discount?: { type: 'fixed' | 'percent'; value: number } | null;
  tenders: { method: PosTenderMethod; amount: number; received?: number }[];
  /** Réseau mobile money du tender Jeko — requis si `tenders` en contient un. */
  payment_method?: JekoNetwork;
  notes?: string | null;
  idempotency_key: string;
};

export type PosDailyReport = {
  revenue: number;
  sales_count: number;
  average_ticket: number;
  by_hour: { hour: number; count: number }[];
  by_payment_method: Record<string, number>;
  refunds_today: number;
};

export type PosSaleFilters = {
  reference?: string;
  status?: string;
  client_id?: number;
  from?: string;
  to?: string;
  perPage?: number;
  page?: number;
};

export type PosSalesTotals = { revenue: number; sales_count: number };

export type PosSalesSummary = {
  today: PosSalesTotals;
  week: PosSalesTotals;
  month: PosSalesTotals;
  all_time: PosSalesTotals;
};

export namespace Pos {
  export async function searchProducts(q: string): Promise<PosProduct[]> {
    const params = new URLSearchParams({ perPage: '24' });
    if (q.trim()) params.set('q', q.trim());
    const body = await api<{ data: PosProduct[] }>(`/admin/pos/products?${params.toString()}`);
    return body.data;
  }

  export async function productByBarcode(barcode: string): Promise<PosProduct | null> {
    try {
      const body = await api<{ data: PosProduct }>(`/admin/pos/products/barcode/${encodeURIComponent(barcode)}`);
      return body.data;
    } catch {
      return null;
    }
  }

  export async function registers(): Promise<PosRegister[]> {
    const body = await api<{ data: PosRegister[] }>('/admin/pos/registers');
    return body.data;
  }

  export async function currentSession(): Promise<PosSession | null> {
    const body = await api<{ data: PosSession | null }>('/admin/pos/sessions/current');
    return body.data;
  }

  export async function openSession(cashRegisterId: number, openingBalance: number): Promise<PosSession> {
    const body = await api<{ data: PosSession }>('/admin/pos/sessions/open', {
      method: 'POST',
      body: JSON.stringify({ cash_register_id: cashRegisterId, opening_balance: openingBalance }),
    });
    return body.data;
  }

  export async function closeSession(sessionId: number, actualCash: number, notes?: string): Promise<PosSession> {
    const body = await api<{ data: PosSession }>(`/admin/pos/sessions/${sessionId}/close`, {
      method: 'POST',
      body: JSON.stringify({ actual_cash: actualCash, notes }),
    });
    return body.data;
  }

  export async function createSale(payload: CreatePosSalePayload): Promise<PosSale> {
    const body = await api<{ data: PosSale }>('/admin/pos/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return body.data;
  }

  export async function sales(filters: PosSaleFilters = {}): Promise<{ data: PosSale[]; total: number; lastPage: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const body = await api<{ data: PosSale[]; meta: { total: number; last_page: number } }>(
      `/admin/pos/sales?${params.toString()}`,
    );
    return { data: body.data, total: body.meta.total, lastPage: body.meta.last_page };
  }

  export async function sale(orderId: number): Promise<PosSale> {
    const body = await api<{ data: PosSale }>(`/admin/pos/sales/${orderId}`);
    return body.data;
  }

  export async function refund(
    orderId: number,
    reason: string,
    method: PosTenderMethod,
    items?: { order_item_id: number; quantity: number }[],
  ): Promise<PosSale> {
    const body = await api<{ data: PosSale }>(`/admin/pos/sales/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason, method, items: items && items.length > 0 ? items : undefined }),
    });
    return body.data;
  }

  /** Annule une vente encore en attente de paiement (ex. client renonçant au paiement Jeko) — restaure le stock. */
  export async function cancelSale(orderId: number): Promise<void> {
    await api<{ data: { status: string } }>(`/admin/pos/sales/${orderId}`, { method: 'DELETE' });
  }

  export async function dailyReport(): Promise<PosDailyReport> {
    const body = await api<{ data: PosDailyReport }>('/admin/pos/reports/daily');
    return body.data;
  }

  export async function salesSummary(): Promise<PosSalesSummary> {
    const body = await api<{ data: PosSalesSummary }>('/admin/pos/reports/summary');
    return body.data;
  }

  /** URL des exports PDF/CSV de l'historique, mêmes filtres que la liste affichée à l'écran. */
  export function salesExportUrl(format: 'pdf' | 'csv', filters: PosSaleFilters = {}): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const query = params.toString();
    return apiUrl(`/admin/pos/sales/export/${format}${query ? `?${query}` : ''}`);
  }

  /** Reçu premium (§22) — même moteur que le reçu public d'une commande web. */
  export async function receipt(orderId: number): Promise<ReceiptData> {
    const body = await api<{ data: ReceiptData }>(`/admin/pos/sales/${orderId}/receipt`);
    return body.data;
  }

  export function receiptPdfUrl(orderId: number, format: ReceiptFormat = 'thermal80'): string {
    return apiUrl(`/admin/pos/sales/${orderId}/receipt/pdf?format=${format}`);
  }
}
