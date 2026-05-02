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
