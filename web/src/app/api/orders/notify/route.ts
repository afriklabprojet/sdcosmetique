import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/orders/notify — SUPPRIMÉ (410 Gone).
 *
 * Cette route acceptait un `OrderDraft` arbitraire d'un appelant non
 * authentifié et envoyait un email « commande confirmée » à l'adresse fournie :
 * relais d'email ouvert. Elle envoyait aussi la confirmation *avant* toute
 * tentative de paiement, d'où des emails de confirmation pour des paiements
 * jamais aboutis.
 *
 * Remplacée par `sendOrderConfirmationByNumber()` (src/lib/order-notifications.ts),
 * appelée côté serveur uniquement :
 *  - webhook Jeko, à la transition `payment_status → paid` (mobile money) ;
 *  - /api/orders/create, pour le paiement à la livraison.
 */
export function POST() {
  return NextResponse.json({ error: 'gone' }, { status: 410 });
}
