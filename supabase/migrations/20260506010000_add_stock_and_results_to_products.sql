-- ── PRODUCTS : colonnes manquantes ──────────────────────────────────────────
-- Ajoute les colonnes utilisées par l'UI admin et les mappers TypeScript :
--  • stock_qty            : quantité en stock (nullable = ignoré)
--  • low_stock_threshold  : seuil d'alerte stock bas (nullable = défaut 5)
--  • results_title        : titre section "Résultats" sur fiche produit
--  • results_subtitle     : sous-titre section "Résultats"
--
-- Sans ces colonnes, l'upsert depuis /api/admin/products échoue avec
-- l'erreur Postgres "column does not exist" → la sauvegarde est rejetée
-- et le stock + badges saisis dans l'admin ne sont jamais persistés.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_qty           int,
  ADD COLUMN IF NOT EXISTS low_stock_threshold int,
  ADD COLUMN IF NOT EXISTS results_title       text,
  ADD COLUMN IF NOT EXISTS results_subtitle    text;
