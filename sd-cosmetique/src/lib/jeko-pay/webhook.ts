/**
 * Vérification des webhooks Jeko Africa.
 * Header: `Jeko-Signature` = HMAC-SHA256(secret, raw_body)  (hex)
 *
 * Doc: https://developer.jeko.africa/fr/integration/webhooks/integration
 */

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JekoWebhookPayload {
  id: string;
  amount: { amount: number; currency: string };
  fees:   { amount: number; currency: string };
  status: 'success' | 'error';
  counterpartLabel: string;
  counterpartIdentifier: string;
  paymentMethod: 'wave' | 'orange' | 'mtn' | 'moov' | 'djamo' | 'bank';
  transactionType: 'PaymentRequest' | 'payment' | 'transfer';
  businessName: string;
  storeName: string;
  description: string;
  executedAt: string;
  transactionDetails: {
    id?: string;
    reference?: string;
    paymentLinkId?: string;
  };
}

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook Jeko.
 * @param rawBody  corps brut (string ou Buffer) — JAMAIS le JSON re-stringifié.
 * @param signature valeur du header `Jeko-Signature` (hex).
 * @param secret   secret webhook (défaut: process.env.JEKO_WEBHOOK_SECRET).
 */
export function verifyJekoSignature(
  rawBody: string | Buffer,
  signature: string | null | undefined,
  secret: string = process.env.JEKO_WEBHOOK_SECRET ?? '',
): boolean {
  if (!signature || !secret) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  // timingSafeEqual exige des Buffers de même longueur
  let received = signature.trim().toLowerCase();
  if (received.startsWith('sha256=')) received = received.slice(7);
  if (received.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
