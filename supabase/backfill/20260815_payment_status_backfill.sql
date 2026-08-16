-- =============================================================================
-- Backfill — remettre l'historique des commandes en accord avec la realite
--            des paiements (ticket #2 et #3)
-- =============================================================================
--
-- A EXECUTER MANUELLEMENT, APRES RELECTURE, ET APRES UN DUMP DE LA BASE :
--     supabase db dump --db-url "<url>" -f dump-avant-backfill.sql
--
-- Contexte du defaut corrige cote code :
--   • toute commande etait creee avec status = 'confirmed', quel que soit son
--     paiement (d'ou des commandes « Confirmee » jamais payees) ;
--   • toute commande NON mobile money (paiement a la livraison) etait creee
--     directement avec payment_status = 'paid', sans qu'aucun encaissement
--     n'ait eu lieu.
--
-- Ce script ne SUPPRIME rien : il corrige des statuts. Les commandes restent
-- toutes en base et consultables cote admin ; seules celles reellement payees
-- apparaitront desormais dans l'historique client.
--
-- Marche a suivre : executer d'abord la PARTIE 1 (audit, lecture seule), lire
-- les chiffres, puis la PARTIE 2 (correction) seulement s'ils sont coherents.
-- =============================================================================


-- =============================================================================
-- PARTIE 1 — AUDIT (lecture seule, aucun effet de bord)
-- =============================================================================

-- 1.a Photographie actuelle : combien de commandes par couple (statut, reglement)
SELECT status,
       payment_status,
       payment_method,
       count(*)             AS nb,
       sum(total)           AS montant_cumule,
       count(payment_paid_at) AS nb_avec_date_paiement
FROM public.orders
GROUP BY status, payment_status, payment_method
ORDER BY nb DESC;

-- 1.b Commandes marquees « payees » SANS aucune preuve de paiement.
--     (ni date d'encaissement, ni PSP, ni transaction : elles ont ete creees
--      ainsi par l'ancien code)
SELECT count(*) AS a_repasser_en_attente,
       sum(total) AS montant_fictif
FROM public.orders
WHERE payment_status = 'paid'
  AND payment_paid_at IS NULL
  AND payment_provider IS NULL
  AND payment_provider_txn_id IS NULL;

-- 1.c Parmi elles, celles deja livrees : l'argent a tres probablement ete
--     encaisse a la livraison. A traiter separement (etape 2.b).
SELECT count(*) AS livrees_donc_encaissees, sum(total) AS montant
FROM public.orders
WHERE payment_status = 'paid'
  AND payment_paid_at IS NULL
  AND payment_provider IS NULL
  AND payment_provider_txn_id IS NULL
  AND status = 'delivered';

-- 1.d Commandes mobile money en attente affichees a tort comme « confirmees »
SELECT count(*) AS a_repasser_en_attente_de_paiement
FROM public.orders
WHERE payment_status = 'pending'
  AND status = 'confirmed';

-- 1.e Detail nominatif, pour controle avant ecriture (limite volontairement)
SELECT order_number, created_at, status, payment_status, payment_method,
       total, payment_paid_at, payment_provider, delivery_email
FROM public.orders
WHERE (payment_status = 'paid' AND payment_paid_at IS NULL AND payment_provider IS NULL)
   OR (payment_status = 'pending' AND status = 'confirmed')
ORDER BY created_at DESC
LIMIT 100;


-- =============================================================================
-- PARTIE 2 — CORRECTION
-- =============================================================================
-- Transaction unique : en cas de doute, remplacer COMMIT par ROLLBACK en fin de
-- bloc pour voir les compteurs sans rien ecrire.

BEGIN;

-- 2.a Commandes livrees et payees a la livraison : l'encaissement a bien eu
--     lieu physiquement. On les garde « payees », mais on horodate le paiement
--     pour qu'elles cessent d'etre indiscernables des commandes fictives.
UPDATE public.orders
SET payment_paid_at = COALESCE(payment_paid_at, updated_at, created_at),
    updated_at      = now()
WHERE payment_status = 'paid'
  AND payment_paid_at IS NULL
  AND payment_provider IS NULL
  AND payment_provider_txn_id IS NULL
  AND status = 'delivered';

-- 2.b Toutes les autres commandes « payees » sans preuve de paiement : elles
--     n'ont jamais ete encaissees. Elles repassent en attente de paiement et
--     sortent donc de l'historique des commandes payees.
--     L'admin pourra les encaisser une par une (bouton « Encaisser ») si le
--     paiement a bien eu lieu hors systeme.
UPDATE public.orders
SET payment_status = 'pending',
    payment_paid_at = NULL,
    updated_at      = now()
WHERE payment_status = 'paid'
  AND payment_paid_at IS NULL
  AND payment_provider IS NULL
  AND payment_provider_txn_id IS NULL
  AND status <> 'delivered';

-- 2.c Commandes dont le paiement n'est pas confirme mais qui affichent
--     « confirmee » : le statut logistique redevient coherent avec le
--     paiement. On ne touche pas aux commandes deja expediees ou livrees —
--     la marchandise est partie, c'est un cas a arbitrer manuellement.
UPDATE public.orders
SET status     = 'pending_payment',
    updated_at = now()
WHERE payment_status IN ('pending', 'failed')
  AND status = 'confirmed';

-- Verification post-correction : plus aucune commande « payee » sans preuve,
-- plus aucune commande « confirmee » non payee.
SELECT
  count(*) FILTER (
    WHERE payment_status = 'paid' AND payment_paid_at IS NULL
  ) AS payees_sans_preuve_restantes,
  count(*) FILTER (
    WHERE payment_status <> 'paid' AND status = 'confirmed'
  ) AS confirmees_non_payees_restantes,
  count(*) FILTER (WHERE payment_status = 'paid') AS total_payees,
  count(*) AS total_commandes
FROM public.orders;

-- Remplacer par ROLLBACK; pour annuler.
COMMIT;


-- =============================================================================
-- PARTIE 3 — CONTROLE A FROID (a relancer apres COMMIT)
-- =============================================================================
-- Ce que verra desormais l'historique client (uniquement les commandes payees)
SELECT count(*) AS commandes_visibles_dans_historique, sum(total) AS chiffre_affaire_reel
FROM public.orders
WHERE payment_status = 'paid';
