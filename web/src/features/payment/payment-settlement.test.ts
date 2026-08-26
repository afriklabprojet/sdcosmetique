/**
 * Regression du ticket #4 : un paiement Jeko reellement abouti restait
 * « en attente de paiement ».
 *
 * Les deux points de rupture etaient silencieux (le webhook acquittait en 200
 * sans rien ecrire), d'ou ces tests qui figent les deux regles en cause.
 *
 * Lancer :  bunx bun test src/features/payment/payment-settlement.test.ts
 */

import { describe, expect, test } from 'bun:test';
import { amountMatchesTotal, extractReference } from '@/features/payment/payment-rules';
import type { JekoWebhookPayload } from '@/features/payment/jeko-pay-webhook.validator';

describe('amountMatchesTotal', () => {
  const total = 12_500; // FCFA

  test('accepte le montant dans l’echelle envoyee a Jeko (total x 100)', () => {
    expect(amountMatchesTotal(1_250_000, total)).toBe(true);
  });

  test('accepte le montant renvoye en francs — le XOF n’a pas de sous-unite', () => {
    // C'est ce cas qui echouait : paiement reel refuse, commande laissee en attente.
    expect(amountMatchesTotal(12_500, total)).toBe(true);
  });

  test('refuse un paiement partiel', () => {
    expect(amountMatchesTotal(1_000_000, total)).toBe(false);
    expect(amountMatchesTotal(10_000, total)).toBe(false);
  });

  test('refuse un montant absent', () => {
    expect(amountMatchesTotal(0, total)).toBe(false);
  });
});

describe('extractReference', () => {
  const base = { id: 'txn_1', status: 'success' } as unknown as JekoWebhookPayload;

  test('lit la reference dans transactionDetails', () => {
    const payload = { ...base, transactionDetails: { reference: 'SD-ABC123' } } as JekoWebhookPayload;
    expect(extractReference(payload)).toBe('SD-ABC123');
  });

  test('retombe sur la reference racine', () => {
    const payload = { ...base, transactionDetails: {}, reference: 'SD-ROOT01' } as JekoWebhookPayload;
    expect(extractReference(payload)).toBe('SD-ROOT01');
  });

  test('retombe sur paymentRequest.reference', () => {
    const payload = {
      ...base, transactionDetails: {}, paymentRequest: { reference: 'SD-PR0001' },
    } as JekoWebhookPayload;
    expect(extractReference(payload)).toBe('SD-PR0001');
  });

  test('ignore une reference vide plutot que de la retenir', () => {
    const payload = {
      ...base, transactionDetails: { reference: '   ' }, reference: 'SD-REAL01',
    } as JekoWebhookPayload;
    expect(extractReference(payload)).toBe('SD-REAL01');
  });

  test('renvoie undefined quand aucune reference n’est exploitable', () => {
    const payload = { ...base, transactionDetails: {} } as JekoWebhookPayload;
    expect(extractReference(payload)).toBeUndefined();
  });
});
