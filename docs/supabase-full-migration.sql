-- SD Cosmétique — migrations concaténées (générées automatiquement)
-- À coller dans le SQL Editor du dashboard Supabase, projet krixomddzoigwmajqjlm
-- Ordre chronologique identique à supabase/migrations/


-- ============================================================
-- 20260430001136_create_site_config.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 20260430002913_create_site_images_bucket.sql
-- ============================================================

-- Bucket public pour les images du site (hero, avatars, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (CDN)
CREATE POLICY "site_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Upload réservé aux admins authentifiés
CREATE POLICY "site_images_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images'
  AND auth.role() = 'authenticated'
);

-- Suppression réservée aux admins
CREATE POLICY "site_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images'
  AND auth.role() = 'authenticated'
);


-- ============================================================
-- 20260430003457_create_testimonials.sql
-- ============================================================

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


-- ============================================================
-- 20260430004216_create_categories.sql
-- ============================================================

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


-- ============================================================
-- 20260430005000_create_quiz_config.sql
-- ============================================================

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


-- ============================================================
-- 20260430006000_create_profiles.sql
-- ============================================================

-- ─── Table profiles ───────────────────────────────────────────────────────────
-- Liée à auth.users via trigger pour synchroniser les métadonnées utilisateur

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  prenom        text,
  nom           text,
  telephone     text,
  avatar_url    text,
  newsletter    boolean not null default true,
  points        integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index
create index if not exists profiles_id_idx on public.profiles(id);

-- RLS
alter table public.profiles enable row level security;

-- Politiques RLS
create policy "Utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Utilisateur met à jour son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins voient tous les profils"
  on public.profiles for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
        and (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- Trigger : crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, nom, telephone, newsletter)
  values (
    new.id,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'telephone',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger : met à jour updated_at automatiquement
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 20260430007000_create_orders.sql
-- ============================================================

-- ─── Table orders ─────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  order_number      text not null unique,
  status            text not null default 'confirmed'
                      check (status in ('confirmed','processing','shipped','delivered','cancelled')),
  subtotal          numeric(12,0) not null,
  shipping_cost     numeric(12,0) not null default 0,
  total             numeric(12,0) not null,
  payment_method    text,
  -- Adresse de livraison (snapshot au moment de la commande)
  delivery_first_name text,
  delivery_last_name  text,
  delivery_email      text,
  delivery_phone      text,
  delivery_address    text,
  delivery_city       text,
  delivery_country    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- ─── Table order_items ────────────────────────────────────────────────────────

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  text not null,
  product_slug text,
  name        text not null,
  price       numeric(12,0) not null,
  quantity    integer not null check (quantity > 0),
  image_url   text,
  shade       text
);

-- Index
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ─── Table order_reviews ──────────────────────────────────────────────────────

create table if not exists public.order_reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  product_id  text not null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

create index if not exists order_reviews_user_id_idx on public.order_reviews(user_id);
create index if not exists order_reviews_product_id_idx on public.order_reviews(product_id);

-- ─── RLS orders ───────────────────────────────────────────────────────────────

alter table public.orders enable row level security;

create policy "Utilisateur voit ses propres commandes"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Utilisateur crée ses commandes"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins gèrent toutes les commandes"
  on public.orders for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
        and (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- ─── RLS order_items ──────────────────────────────────────────────────────────

alter table public.order_items enable row level security;

create policy "Utilisateur voit ses articles de commande"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Utilisateur insère ses articles"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Admins gèrent tous les articles"
  on public.order_items for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
        and (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- ─── RLS order_reviews ────────────────────────────────────────────────────────

alter table public.order_reviews enable row level security;

create policy "Tous peuvent lire les avis"
  on public.order_reviews for select using (true);

create policy "Utilisateur crée ses avis"
  on public.order_reviews for insert
  with check (auth.uid() = user_id);

-- ─── Trigger updated_at sur orders ───────────────────────────────────────────

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ─── Fonction utilitaire : points sur commande ────────────────────────────────

create or replace function public.add_order_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  pts integer;
begin
  -- 1 point par tranche de 1000 FCFA
  pts := floor(new.total / 1000)::integer;
  if pts > 0 and new.user_id is not null then
    update public.profiles
    set points = points + pts
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_confirmed on public.orders;
create trigger on_order_confirmed
  after insert on public.orders
  for each row execute procedure public.add_order_points();


-- ============================================================
-- 20260430008000_create_reviews.sql
-- ============================================================

-- ─── Table avis clients (page /avis) ─────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid        primary key default gen_random_uuid(),
  author       text        not null,
  city         text        not null default '',
  product      text        not null default '',
  product_slug text        not null default '',
  rating       smallint    not null check (rating between 1 and 5),
  title        text        not null default '',
  text         text        not null,
  verified     boolean     not null default false,
  skin_tone    text,
  created_at   timestamptz not null default now()
);

create index if not exists reviews_rating_idx  on public.reviews(rating);
create index if not exists reviews_created_idx on public.reviews(created_at desc);

alter table public.reviews enable row level security;

-- Lecture publique de tous les avis
create policy "reviews_public_read"
  on public.reviews for select
  using (true);

-- Admins gèrent les avis
create policy "reviews_admin_all"
  on public.reviews for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
        and (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );


-- ============================================================
-- 20260430009000_create_jeko.sql
-- ============================================================

-- ─── Table jeko_transactions ──────────────────────────────────────────────────
-- Historique de toutes les transactions de points fidélité "Jeko"
-- Règle : 1 000 FCFA dépensé = 10 points ; 1 point = 10 FCFA de réduction

create table if not exists public.jeko_transactions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  points       integer     not null,
  reason       text        not null
               check (reason in ('purchase','welcome','referral','redemption','manual')),
  label        text,
  reference_id text,
  created_at   timestamptz not null default now()
);

-- Index
create index if not exists jeko_transactions_user_id_idx    on public.jeko_transactions(user_id);
create index if not exists jeko_transactions_created_at_idx on public.jeko_transactions(created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.jeko_transactions enable row level security;

-- Lire ses propres transactions
create policy "jeko_user_select"
  on public.jeko_transactions for select
  using (auth.uid() = user_id);

-- Insérer uniquement des DÉBITS (rédemptions) — les crédits passent par les triggers
create policy "jeko_user_redeem"
  on public.jeko_transactions for insert
  with check (auth.uid() = user_id and points < 0);

-- Admins : accès complet
create policy "jeko_admin_all"
  on public.jeko_transactions for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
        and (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- ─── Validation des rédemptions ───────────────────────────────────────────────
-- Empêche un solde négatif lors d'une rédemption

create or replace function public.validate_jeko_redemption()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_balance integer;
begin
  if NEW.points >= 0 then return NEW; end if;

  select coalesce(sum(points), 0) into v_balance
    from public.jeko_transactions
   where user_id = NEW.user_id;

  if v_balance + NEW.points < 0 then
    raise exception 'Solde Jeko insuffisant (solde: %, demandé: %)',
      v_balance, -NEW.points;
  end if;

  return NEW;
end;
$$;

create trigger trg_validate_jeko_redemption
  before insert on public.jeko_transactions
  for each row execute function public.validate_jeko_redemption();

-- ─── Sync profiles.points ─────────────────────────────────────────────────────
-- Met à jour le solde dénormalisé dans profiles après chaque transaction

create or replace function public.sync_jeko_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
     set points     = (select coalesce(sum(points), 0)
                         from public.jeko_transactions
                        where user_id = NEW.user_id),
         updated_at = now()
   where id = NEW.user_id;
  return NEW;
end;
$$;

create trigger trg_sync_jeko_points
  after insert on public.jeko_transactions
  for each row execute function public.sync_jeko_points();

-- ─── Crédit automatique : bonus bienvenue (à l'inscription) ──────────────────

create or replace function public.credit_jeko_welcome()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.jeko_transactions (user_id, points, reason, label)
  values (NEW.id, 20, 'welcome', 'Bonus bienvenue 🎉');
  return NEW;
end;
$$;

create trigger trg_jeko_welcome
  after insert on public.profiles
  for each row execute function public.credit_jeko_welcome();

-- ─── Crédit automatique : achat (à la confirmation de commande) ───────────────
-- 1 000 FCFA dépensé = 10 points Jeko

create or replace function public.credit_jeko_purchase()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_points integer;
begin
  v_points := floor(NEW.total::numeric / 1000) * 10;

  if v_points > 0 and NEW.user_id is not null then
    insert into public.jeko_transactions (user_id, points, reason, label, reference_id)
    values (NEW.user_id, v_points, 'purchase', 'Commande ' || NEW.order_number, NEW.order_number);
  end if;

  return NEW;
end;
$$;

create trigger trg_jeko_purchase
  after insert on public.orders
  for each row execute function public.credit_jeko_purchase();


-- ============================================================
-- 20260430010000_create_jeko_config.sql
-- ============================================================

-- ─── Table jeko_config ───────────────────────────────────────────────────────
-- Stockage clé-valeur JSONB pour la configuration dynamique du système Jeko.
-- Permet à l'admin de modifier : paliers, récompenses, règles de points.

create table if not exists public.jeko_config (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.jeko_config enable row level security;

-- Lecture publique (authentifiés) — nécessaire pour l'affichage côté client
create policy "jeko_config_select"
  on public.jeko_config for select
  to authenticated
  using (true);

-- Admin : accès complet (même check que jeko_transactions)
create policy "jeko_config_admin"
  on public.jeko_config for all
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
        and (raw_user_meta_data->>'role') = 'admin'
    )
  );

-- ─── Configuration par défaut ─────────────────────────────────────────────────

insert into public.jeko_config (key, value) values
  ('settings', '{"points_per_1000": 10, "welcome_bonus": 20}'::jsonb),
  ('tiers', '[
    {"label": "Bronze",  "min": 0,    "next": 50,   "emoji": "🥉", "color": "#CD7F32", "bg": "#FDF6EE", "textColor": "#92400E"},
    {"label": "Argent",  "min": 50,   "next": 200,  "emoji": "⭐", "color": "#6B7280", "bg": "#F9FAFB", "textColor": "#374151"},
    {"label": "Gold",    "min": 200,  "next": 500,  "emoji": "👑", "color": "#C8974A", "bg": "#FFF7ED", "textColor": "#92400E"},
    {"label": "Platine", "min": 500,  "next": 1000, "emoji": "✨", "color": "#9333EA", "bg": "#FAF5FF", "textColor": "#7C3AED"},
    {"label": "Diamant", "min": 1000, "next": null, "emoji": "💎", "color": "#0EA5E9", "bg": "#F0F9FF", "textColor": "#0369A1"}
  ]'::jsonb),
  ('rewards', '[
    {"id": "r100", "pts": 100, "label": "-1 000 FCFA",   "icon": "🎁", "description": "1 000 FCFA de réduction sur votre prochaine commande", "active": true},
    {"id": "r300", "pts": 300, "label": "-3 000 FCFA",   "icon": "💎", "description": "3 000 FCFA de réduction sur votre prochaine commande", "active": true},
    {"id": "r500", "pts": 500, "label": "Produit offert", "icon": "👑", "description": "Un produit au choix jusqu à 5 000 FCFA offert",       "active": true}
  ]'::jsonb)
on conflict (key) do nothing;

-- ─── Mise à jour des triggers pour lire la config dynamiquement ───────────────

-- Bonus bienvenue : lire welcome_bonus depuis jeko_config
create or replace function public.credit_jeko_welcome()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_bonus int;
begin
  select (value->>'welcome_bonus')::int
    into v_bonus
    from public.jeko_config
   where key = 'settings';

  v_bonus := coalesce(v_bonus, 20);

  insert into public.jeko_transactions (user_id, points, reason, label)
  values (NEW.id, v_bonus, 'welcome', 'Bonus bienvenue 🎉');

  return NEW;
end;
$$;

-- Achat : lire points_per_1000 depuis jeko_config
create or replace function public.credit_jeko_purchase()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_pts_per_1000 int;
  v_points       int;
begin
  select (value->>'points_per_1000')::int
    into v_pts_per_1000
    from public.jeko_config
   where key = 'settings';

  v_pts_per_1000 := coalesce(v_pts_per_1000, 10);
  v_points       := floor(NEW.total::numeric / 1000) * v_pts_per_1000;

  if v_points > 0 and NEW.user_id is not null then
    insert into public.jeko_transactions (user_id, points, reason, label, reference_id)
    values (NEW.user_id, v_points, 'purchase', 'Commande ' || NEW.order_number, NEW.order_number);
  end if;

  return NEW;
end;
$$;


-- ============================================================
-- 20260430011000_add_payment_columns_to_orders.sql
-- ============================================================

-- ─── Colonnes paiement (Jeko Africa PSP) ──────────────────────────────────────

alter table public.orders
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending','processing','paid','failed','refunded')),
  add column if not exists payment_reference text,           -- = order_number envoyé à Jeko
  add column if not exists payment_provider text,            -- 'jeko' (extensible)
  add column if not exists payment_provider_txn_id text,     -- id de transaction renvoyé par Jeko
  add column if not exists payment_paid_at timestamptz;

create index if not exists orders_payment_status_idx
  on public.orders(payment_status);

create unique index if not exists orders_payment_provider_txn_id_uidx
  on public.orders(payment_provider_txn_id)
  where payment_provider_txn_id is not null;


-- ============================================================
-- 20260430011500_create_newsletter.sql
-- ============================================================

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'footer',
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_email on newsletter_subscribers(email);
create index if not exists idx_newsletter_created on newsletter_subscribers(created_at desc);

alter table newsletter_subscribers enable row level security;

-- Anonymous can insert (signup form), but not read
create policy "newsletter_insert_anon" on newsletter_subscribers
  for insert with check (true);

-- Service role only for read/update/delete (admin)


-- ============================================================
-- 20260430012000_create_quiz_submissions.sql
-- ============================================================

-- Quiz submissions analytics
create table if not exists public.quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  skin_tone text,
  concern text,
  routine text,
  user_email text,
  created_at timestamptz not null default now()
);

create index if not exists quiz_submissions_created_at_idx on public.quiz_submissions (created_at desc);
create index if not exists quiz_submissions_concern_idx on public.quiz_submissions (concern);
create index if not exists quiz_submissions_skin_tone_idx on public.quiz_submissions (skin_tone);

alter table public.quiz_submissions enable row level security;

-- Anyone (including anon) can insert a submission
drop policy if exists "quiz_submissions_anon_insert" on public.quiz_submissions;
create policy "quiz_submissions_anon_insert" on public.quiz_submissions
  for insert to anon, authenticated with check (true);

-- Only authenticated (admins via service role anyway) can read
drop policy if exists "quiz_submissions_auth_select" on public.quiz_submissions;
create policy "quiz_submissions_auth_select" on public.quiz_submissions
  for select to authenticated using (true);


-- ============================================================
-- 20260504013000_create_products.sql
-- ============================================================

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


-- ============================================================
-- 20260504014000_fix_site_config_rls_and_seed.sql
-- ============================================================

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


-- ============================================================
-- 20260504015000_grant_products_anon.sql
-- ============================================================

-- Accorder les permissions nécessaires sur products au rôle anon et authenticated
-- Sans ce GRANT, PostgREST retourne 404 même avec une RLS policy USING(true)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;


-- ============================================================
-- 20260506010000_add_stock_and_results_to_products.sql
-- ============================================================

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


-- ============================================================
-- 20260507000000_fix_orders_status_constraint.sql
-- ============================================================

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


-- ============================================================
-- 20260803000000_add_admin_predicate.sql
-- ============================================================

-- ─── C1 fix: replace "any authenticated user" write policies with a real admin check ──
-- Root cause: several tables used `auth.role() = 'authenticated'` (or
-- `raw_user_meta_data->>'role'`, which end-users can edit themselves) to gate
-- writes. Any signed-up customer could hit PostgREST directly and mutate the
-- catalog/config. This adds a SECURITY DEFINER helper keyed off
-- `raw_app_meta_data`, which only a service-role client (never the browser)
-- can write, and re-points every affected policy at it.
--
-- IMPORTANT (manual step): after this migration runs, grant admin access by
-- setting `app_metadata.role = "admin"` on the relevant auth.users rows, e.g.
--   update auth.users set raw_app_meta_data =
--     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   where email = 'someone@sdcosmetique.ci';
-- (must be run with the service role / from the SQL editor, not via the API)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (raw_app_meta_data->>'role') = 'admin'
       from auth.users where id = auth.uid()),
    false
  );
$$;

-- products
revoke insert, update, delete on public.products from authenticated;
drop policy if exists "products_write_auth" on public.products;
create policy "products_write_admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_config
revoke insert, update, delete on public.site_config from authenticated;
drop policy if exists "site_config_write_auth" on public.site_config;
create policy "site_config_write_admin" on public.site_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- categories
revoke insert, update, delete on categories from authenticated;
drop policy if exists "categories_admin_select" on categories;
drop policy if exists "categories_admin_write" on categories;
create policy "categories_admin_select" on categories
  for select using (public.is_admin());
create policy "categories_admin_write" on categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- testimonials
revoke update, delete on testimonials from authenticated;
drop policy if exists "testimonials_admin_select" on testimonials;
drop policy if exists "testimonials_admin_update" on testimonials;
drop policy if exists "testimonials_admin_delete" on testimonials;
create policy "testimonials_admin_select" on testimonials
  for select using (public.is_admin());
create policy "testimonials_admin_update" on testimonials
  for update using (public.is_admin()) with check (public.is_admin());
create policy "testimonials_admin_delete" on testimonials
  for delete using (public.is_admin());

-- quiz_concerns / quiz_routines
revoke insert, update, delete on quiz_concerns from authenticated;
drop policy if exists "quiz_concerns_all" on quiz_concerns;
create policy "quiz_concerns_admin_write" on quiz_concerns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke insert, update, delete on quiz_routines from authenticated;
drop policy if exists "quiz_routines_all" on quiz_routines;
create policy "quiz_routines_admin_write" on quiz_routines
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profiles: "Admins voient tous les profils" trusted user-writable raw_user_meta_data
drop policy if exists "Admins voient tous les profils" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- orders / order_items: same user-writable metadata issue
drop policy if exists "Admins gèrent toutes les commandes" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins gèrent tous les articles" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- H3: quiz_submissions stores emails/PII; "authenticated" meant ANY customer
-- could read the whole table. Restrict reads to admins (the app route also
-- now calls requireAdmin(), but RLS must hold regardless of the API path).
drop policy if exists "quiz_submissions_auth_select" on public.quiz_submissions;
create policy "quiz_submissions_admin_select" on public.quiz_submissions
  for select using (public.is_admin());

