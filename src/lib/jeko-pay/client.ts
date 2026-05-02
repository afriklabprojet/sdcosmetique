/**
 * Jeko Africa — Partner API client (Pay-in / Pay-out)
 * Doc: https://developer.jeko.africa
 *
 * NB. Ne PAS confondre avec `src/lib/jeko.ts` qui gère le programme
 * de fidélité interne "Jeko" de la marque.
 *
 * Auth: deux headers obligatoires sur chaque requête.
 *   - X-API-KEY     : la clé API
 *   - X-API-KEY-ID  : l'identifiant de la clé API
 */

import 'server-only';

// ─── Env ──────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.JEKO_API_BASE_URL ?? 'https://api.jeko.africa';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[jeko-pay] env "${name}" manquante`);
  return v;
}

function authHeaders(): Record<string, string> {
  return {
    'X-API-KEY':    requireEnv('JEKO_API_KEY'),
    'X-API-KEY-ID': requireEnv('JEKO_API_KEY_ID'),
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type JekoPayProvider = 'wave' | 'orange' | 'mtn' | 'moov' | 'djamo';

/** Mapping depuis le `PaymentMethod` interne vers le provider Jeko. */
export const PAYMENT_METHOD_TO_JEKO: Record<string, JekoPayProvider | null> = {
  wave:         'wave',
  orange_money: 'orange',
  mtn_momo:     'mtn',
  moov_money:   'moov',
  visa:         null, // non supporté par le flux redirect mobile money
  mastercard:   null,
};

export interface JekoMoney {
  amount: number;     // en centimes (XOF: 1 XOF = 100 centimes côté API)
  currency: string;   // ISO 4217, ex. "XOF"
}

export interface JekoTransaction {
  id: string;
  amount: JekoMoney;
  fees: JekoMoney;
  status: 'pending' | 'success' | 'error';
  counterpartLabel: string;
  counterpartIdentifier: string;
  description: string;
  executedAt: string; // YYYY-MM-DD HH:mm:ss
}

export interface JekoPaymentRequest {
  id: string;
  storeId: string;
  reference: string;
  type: 'redirect' | 'soundbox';
  paymentMethod: JekoPayProvider;
  status: 'pending' | 'success' | 'error';
  errorReason?: string | null;
  redirectUrl?: string;          // présent quand type=redirect
  transaction?: JekoTransaction | null;
}

export interface JekoErrorResponse {
  id: string;
  message: string;
  extras?: unknown;
}

export class JekoPayError extends Error {
  readonly status: number;
  readonly body: JekoErrorResponse | null;
  constructor(status: number, body: JekoErrorResponse | null, message?: string) {
    super(message ?? body?.message ?? `Jeko API ${status}`);
    this.name   = 'JekoPayError';
    this.status = status;
    this.body   = body;
  }
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body:    body ? JSON.stringify(body) : undefined,
    cache:   'no-store',
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new JekoPayError(res.status, json as JekoErrorResponse | null);
  }
  return json as T;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export interface CreateRedirectPaymentInput {
  amountCents: number;       // minimum 100
  currency?: string;         // default "XOF"
  reference: string;         // 1-100 chars, unique
  storeId?: string;          // default JEKO_STORE_ID
  paymentMethod: JekoPayProvider;
  successUrl: string;
  errorUrl: string;
  payerPhone?: string;       // si forceProviderDirect
  forceProviderDirect?: boolean;
}

export async function createRedirectPayment(
  input: CreateRedirectPaymentInput,
): Promise<JekoPaymentRequest> {
  if (input.amountCents < 100) {
    throw new JekoPayError(400, null, 'amountCents must be >= 100');
  }
  const storeId = input.storeId ?? requireEnv('JEKO_STORE_ID');

  return request<JekoPaymentRequest>('POST', '/partner_api/payment_requests', {
    amountCents: input.amountCents,
    currency:    input.currency ?? 'XOF',
    reference:   input.reference,
    storeId,
    paymentDetails: {
      type: 'redirect',
      data: {
        paymentMethod:       input.paymentMethod,
        successUrl:          input.successUrl,
        errorUrl:            input.errorUrl,
        forceProviderDirect: input.forceProviderDirect ?? false,
        ...(input.payerPhone ? { payerPhone: input.payerPhone } : {}),
      },
    },
  });
}

export async function getPaymentRequest(id: string): Promise<JekoPaymentRequest> {
  return request<JekoPaymentRequest>('GET', `/partner_api/payment_requests/${encodeURIComponent(id)}`);
}

export interface JekoStore {
  id: string;
  name: string;
}

export async function listStores(): Promise<JekoStore[]> {
  return request<JekoStore[]>('GET', '/partner_api/stores');
}
