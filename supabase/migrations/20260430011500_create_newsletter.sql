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
