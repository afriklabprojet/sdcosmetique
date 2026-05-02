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
