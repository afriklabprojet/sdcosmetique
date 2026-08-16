-- ─── Reconciliation paiement : identifiant de la demande Jeko ────────────────
--
-- Jusqu'ici, /api/jeko-pay/checkout recevait l'id de la `payment_request` Jeko
-- et le renvoyait au navigateur sans jamais le stocker. Consequence : lorsqu'un
-- webhook etait manque (URL non configuree, 5xx, signature invalide), plus rien
-- ne permettait d'interroger Jeko pour savoir si la commande avait ete payee —
-- elle restait « en attente de paiement » indefiniment malgre un paiement reel.
--
-- On persiste donc l'id des la creation du paiement, ce qui rend possible la
-- reconciliation via GET /partner_api/payment_requests/{id}.
--
-- A distinguer de `payment_provider_txn_id` (id de la TRANSACTION, connu
-- seulement une fois le paiement execute).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_request_id text;

CREATE INDEX IF NOT EXISTS orders_payment_request_id_idx
  ON public.orders(payment_request_id)
  WHERE payment_request_id IS NOT NULL;
