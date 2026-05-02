-- quiz_concerns : préoccupations skin du quiz
CREATE TABLE IF NOT EXISTS quiz_concerns (
  id          text        PRIMARY KEY,
  label       text        NOT NULL,
  meta        text        NOT NULL DEFAULT '',
  glyph       text        NOT NULL DEFAULT '◯',
  sort_order  integer     NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO quiz_concerns (id, label, meta, glyph, sort_order) VALUES
  ('taches',      'Taches & hyperpigmentation', 'Unifier le grain de peau',  '◐', 0),
  ('eclat',       'Manque d''éclat',             'Réveiller la luminosité',   '☼', 1),
  ('hydratation', 'Peau sèche, déshydratée',     'Restaurer le confort',      '◌', 2),
  ('unification', 'Teint irrégulier',            'Harmoniser la carnation',   '◯', 3),
  ('antiage',     'Anti-âge, fermeté',           'Lisser & raffermir',        '❋', 4)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE quiz_concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_concerns_select" ON quiz_concerns FOR SELECT USING (true);
CREATE POLICY "quiz_concerns_all"    ON quiz_concerns FOR ALL    USING (auth.role() = 'authenticated');

-- quiz_routines : profils de routine du quiz
CREATE TABLE IF NOT EXISTS quiz_routines (
  id          text        PRIMARY KEY,
  label       text        NOT NULL,
  meta        text        NOT NULL DEFAULT '',
  glyph       text        NOT NULL DEFAULT '◇',
  sort_order  integer     NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO quiz_routines (id, label, meta, glyph, sort_order) VALUES
  ('simple',    'Routine essentielle', '1 à 2 produits — geste minimaliste',  '◇', 0),
  ('complete',  'Routine complète',    '3 à 5 produits — rituel quotidien',   '◆', 1),
  ('intensive', 'Programme intensif',  '6 produits & plus — soin sur-mesure', '✧', 2)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE quiz_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_routines_select" ON quiz_routines FOR SELECT USING (true);
CREATE POLICY "quiz_routines_all"    ON quiz_routines FOR ALL    USING (auth.role() = 'authenticated');
