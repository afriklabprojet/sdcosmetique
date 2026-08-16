/**
 * Regles pures du reglement d'une commande.
 *
 * Volontairement sans `server-only` ni acces reseau/base : ce sont les deux
 * decisions qui ont laisse passer le bug du ticket #4 (paiement reel non
 * reconnu), elles doivent rester directement testables.
 */

import type { JekoWebhookPayload } from '@/features/payment/jeko-pay-webhook.validator';

/**
 * Le XOF n'a pas de sous-unite. Nous envoyons `total * 100` a Jeko, qui peut
 * echoer le montant dans cette meme echelle ou en francs selon l'endpoint.
 * Les deux sont acceptees — et elles seules : tout autre montant reste refuse,
 * pour qu'un paiement partiel ne puisse jamais valider une commande.
 */
export function amountMatchesTotal(receivedAmount: number, totalXof: number): boolean {
  if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) return false;
  return receivedAmount === Math.round(totalXof * 100) || receivedAmount === Math.round(totalXof);
}

/**
 * Retrouve notre `order_number` dans un webhook Jeko.
 *
 * La reference est le seul lien entre une transaction Jeko et une commande :
 * sans elle le webhook ne peut rien mettre a jour. Elle n'arrive pas toujours
 * au meme endroit selon le type de transaction, d'ou les emplacements de repli
 * — un paiement reel ne doit jamais rester « en attente » pour une simple
 * difference de forme du payload.
 */
export function extractReference(payload: JekoWebhookPayload): string | undefined {
  const candidates = [
    payload.transactionDetails?.reference,
    payload.reference,
    payload.paymentRequest?.reference,
  ];
  return candidates.find((c) => typeof c === 'string' && c.trim().length > 0)?.trim();
}
