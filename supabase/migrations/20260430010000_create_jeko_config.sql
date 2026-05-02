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
