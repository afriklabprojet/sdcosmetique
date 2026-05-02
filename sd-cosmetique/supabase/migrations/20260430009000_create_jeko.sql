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
