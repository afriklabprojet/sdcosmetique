-- ─── Table catégories vitrine ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL,
  sub_label   TEXT        NOT NULL DEFAULT '',
  image       TEXT        NOT NULL DEFAULT '',
  href        TEXT        NOT NULL DEFAULT '',
  icon        TEXT        NOT NULL DEFAULT '',
  is_quiz     BOOLEAN     DEFAULT false,
  order_index INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les catégories actives
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (active = true);

-- Les authentifiés (admin) peuvent tout voir
CREATE POLICY "categories_admin_select"
  ON categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Les authentifiés peuvent créer/modifier/supprimer
CREATE POLICY "categories_admin_write"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated');

-- ─── Données initiales (les catégories actuelles) ─────────────────────────────
INSERT INTO categories (slug, label, sub_label, image, href, icon, is_quiz, order_index) VALUES
  ('body',   'CORPS',      'Prenez soin' || chr(10) || 'de votre corps',   'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=85&auto=format&fit=crop', '/categorie/body',   '', false, 1),
  ('face',   'VISAGE',     'Sublimez' || chr(10) || 'votre visage',        'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=85&auto=format&fit=crop', '/categorie/face',   '', false, 2),
  ('gammes', 'GAMMES',     'Soins complets' || chr(10) || 'par besoin',    'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=85&auto=format&fit=crop', '/categorie/gammes', '', false, 3),
  ('kits',   'KITS',       'Votre routine' || chr(10) || 'complète',       'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&q=85&auto=format&fit=crop', '/categorie/kits',   '', false, 4),
  ('duo',    'DUO',        'Le duo parfait' || chr(10) || 'pour vous',     'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=85&auto=format&fit=crop', '/categorie/duo',    '', false, 5),
  ('quiz',   'QUIZ TEINT', 'Trouvez vos produits' || chr(10) || 'idéaux', 'https://images.unsplash.com/photo-1556228720-da4e85bcd2f7?w=400&q=85&auto=format&fit=crop', '/quiz',             '', true,  6)
ON CONFLICT (slug) DO NOTHING;
