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
