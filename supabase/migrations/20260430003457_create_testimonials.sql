-- ─── Table témoignages clients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  text       TEXT        NOT NULL,
  avatar_url TEXT        DEFAULT '',
  approved   BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut soumettre un témoignage
CREATE POLICY "testimonials_public_insert"
  ON testimonials FOR INSERT
  WITH CHECK (true);

-- Le public ne voit que les témoignages approuvés
CREATE POLICY "testimonials_public_read"
  ON testimonials FOR SELECT
  USING (approved = true);

-- Les utilisateurs authentifiés (admin) voient tout
CREATE POLICY "testimonials_admin_select"
  ON testimonials FOR SELECT
  USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent approuver / modifier
CREATE POLICY "testimonials_admin_update"
  ON testimonials FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent supprimer
CREATE POLICY "testimonials_admin_delete"
  ON testimonials FOR DELETE
  USING (auth.role() = 'authenticated');
