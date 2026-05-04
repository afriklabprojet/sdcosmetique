-- ── site_config: RLS + seed valeurs par défaut ───────────────────────────────

-- Lecture publique (anon + authenticated)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config_read_all"
  ON public.site_config FOR SELECT
  USING (true);

CREATE POLICY "site_config_write_auth"
  ON public.site_config FOR ALL
  USING (auth.role() = 'authenticated');

-- ── Seed : shipping ───────────────────────────────────────────────────────────
INSERT INTO public.site_config (key, value) VALUES (
  'shipping',
  '{"options":[{"id":"standard","label":"Livraison standard","description":"D\u00e9lai 3-5 jours ouvr\u00e9s","cost":2500,"freeFrom":25000,"active":true}],"freeShippingMessage":"Livraison gratuite \u00e0 partir de 25 000 FCFA"}'
) ON CONFLICT (key) DO NOTHING;
