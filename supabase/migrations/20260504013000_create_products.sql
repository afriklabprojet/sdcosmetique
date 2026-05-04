-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  category          text NOT NULL,
  price             int NOT NULL,
  original_price    int,
  images            text[]  DEFAULT '{}',
  skin_tones        text[]  DEFAULT '{}',
  badges            text[]  DEFAULT '{}',
  rating            numeric(3,1) DEFAULT 0,
  review_count      int     DEFAULT 0,
  short_description text,
  description       text,
  benefits          text[]  DEFAULT '{}',
  usage             text,
  ingredients       text,
  in_stock          boolean DEFAULT true,
  is_new            boolean DEFAULT false,
  is_bestseller     boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_all"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_write_auth"
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated');
