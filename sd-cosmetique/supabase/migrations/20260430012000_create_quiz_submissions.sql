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
