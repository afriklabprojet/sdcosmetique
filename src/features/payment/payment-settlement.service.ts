/**
 * Regle unique de reglement d'une commande.
 *
 * Deux chemins peuvent apprendre qu'un paiement a abouti :
 *   • le webhook Jeko (`/api/jeko-pay/webhook`) — chemin nominal ;
 *   • la reconciliation (`/api/jeko-pay/reconcile`) — filet quand le webhook
 *     n'est jamais arrive.
 *
 * Les deux doivent produire EXACTEMENT le meme etat en base, sinon les ecrans
 * divergent selon le chemin emprunte. D'ou cette fonction unique : c'est le
 * seul endroit du code autorise a faire passer une commande a `paid`.
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendOrderConfirmationByNumber } from '@/features/orders/order-notification.service';
import { amountMatchesTotal } from '@/features/payment/payment-rules';

export interface SettlementInput {
  /** Notre `order_number` (= reference envoyee a Jeko). */
  reference: string;
  /** Paiement reellement abouti cote PSP. */
  succeeded: boolean;
  /** Montant renvoye par Jeko, dans l'echelle brute du payload. */
  receivedAmount: number;
  /** Id de transaction Jeko, quand il est connu. */
  txnId?: string | null;
  /** Origine, pour les logs. */
  source: 'webhook' | 'reconcile';
}

export type SettlementOutcome =
  | { ok: true; changed: boolean }
  | { ok: false; reason: 'order_not_found' | 'amount_mismatch' | 'db_error' };

/**
 * Applique le resultat d'un paiement a une commande.
 *
 * Idempotent : une commande deja `paid` n'est jamais reecrite, et l'email de
 * confirmation n'est envoye que par l'appel qui a reellement fait basculer la
 * commande (`changed: true`).
 */
export async function settleOrderPayment(
  supabase: SupabaseClient,
  input: SettlementInput,
): Promise<SettlementOutcome> {
  const { reference, succeeded, receivedAmount, txnId, source } = input;

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .select('total, payment_status')
    .eq('order_number', reference)
    .single();

  if (orderErr || !orderRow) {
    console.error(`[${source}] Commande introuvable:`, reference);
    return { ok: false, reason: 'order_not_found' };
  }

  // Deja reglee : rien a faire, et surtout pas de second email.
  if (orderRow.payment_status === 'paid') {
    return { ok: true, changed: false };
  }

  if (succeeded && !amountMatchesTotal(receivedAmount, Number(orderRow.total))) {
    console.error(`[${source}] Montant incoherent`, {
      reference,
      totalXof: Number(orderRow.total),
      receivedAmount,
    });
    return { ok: false, reason: 'amount_mismatch' };
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      payment_status: succeeded ? 'paid' : 'failed',
      // Paiement valide → la commande entre dans le circuit logistique.
      // Echec → elle reste en attente de paiement, un nouvel essai reste possible.
      status: succeeded ? 'confirmed' : 'pending_payment',
      payment_provider: 'jeko',
      ...(txnId ? { payment_provider_txn_id: txnId } : {}),
      payment_reference: reference,
      payment_paid_at: succeeded ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', reference)
    // Garde anti-course : si un autre chemin vient de regler la commande
    // entre le SELECT et l'UPDATE, aucune ligne ne matche et rien n'est ecrase.
    .neq('payment_status', 'paid')
    .select('order_number');

  if (error) {
    console.error(`[${source}] Erreur DB update ordre`, reference, error);
    return { ok: false, reason: 'db_error' };
  }

  const changed = Boolean(updated && updated.length > 0);

  if (succeeded && changed) {
    await sendOrderConfirmationByNumber(reference);
  }

  return { ok: true, changed };
}
