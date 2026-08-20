/**
 * Regle unique de reglement d'une commande.
 * Utilise Drizzle ORM avec MariaDB.
 */
import 'server-only';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/shared/db';
import { orders } from '@/shared/db/schema';
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
  input: SettlementInput,
): Promise<SettlementOutcome> {
  const { reference, succeeded, receivedAmount, txnId, source } = input;

  try {
    const orderRows = await db
      .select({
        total: orders.total,
        paymentStatus: orders.paymentStatus,
      })
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!orderRows.length) {
      console.error(`[${source}] Commande introuvable:`, reference);
      return { ok: false, reason: 'order_not_found' };
    }

    const orderRow = orderRows[0];

    // Deja reglee : rien a faire, et surtout pas de second email.
    if (orderRow.paymentStatus === 'paid') {
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

    // Garde anti-course : n'update que si paymentStatus != 'paid'
    const result = await db
      .update(orders)
      .set({
        paymentStatus: succeeded ? 'paid' : 'failed',
        status: succeeded ? 'confirmed' : 'pending_payment',
        paymentProvider: 'jeko',
        ...(txnId ? { paymentProviderTxnId: txnId } : {}),
        paymentReference: reference,
        paymentPaidAt: succeeded ? new Date() : null,
      })
      .where(and(eq(orders.orderNumber, reference), ne(orders.paymentStatus, 'paid')));

    const changed = true;

    if (succeeded && changed) {
      await sendOrderConfirmationByNumber(reference);
    }

    return { ok: true, changed };
  } catch (err) {
    console.error(`[${source}] Erreur DB update ordre`, reference, err);
    return { ok: false, reason: 'db_error' };
  }
}
