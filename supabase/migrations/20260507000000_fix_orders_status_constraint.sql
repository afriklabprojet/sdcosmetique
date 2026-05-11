-- ─── Fix: ajouter 'pending_payment' au check constraint de orders.status ──────
--
-- La contrainte initiale ne permettait pas 'pending_payment', qui est utilisé
-- pour les paiements mobile money (Orange Money, Wave...) en attente de
-- confirmation. Cela causait un HTTP 500 à chaque tentative de commande.
--
-- Nommage automatique Postgres : orders_status_check

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ));
