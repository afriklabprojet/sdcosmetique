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
