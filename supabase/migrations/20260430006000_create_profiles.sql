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
