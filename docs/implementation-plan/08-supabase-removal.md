# §8 Supabase removal ledger (R7)

## §8.1 The finding that shrinks this section

R7 asks for the deletion of "all Supabase-related code — client, auth, storage, RLS, edge
functions, env vars, dependencies." Verified against the repository on 2026-08-25:

| R7 clause | Actual state |
| --- | --- |
| client | **Already gone.** `grep -rn "from '@supabase" src scripts tests bin` → zero matches |
| auth | **Already gone.** Auth is hand-rolled against Drizzle — `src/shared/auth/auth.service.ts:4` imports `@/shared/db`, sessions are opaque UUIDs in a `sessions` table (`:47-50`), passwords are bcryptjs (`:39,43`) |
| storage | **Already gone.** Uploads write to local disk — `src/app/api/upload/route.ts:75-81` |
| RLS | Present only as **dead SQL** in `supabase/migrations/` and two files under `docs/` |
| edge functions | **None exist.** There is no `supabase/functions/` directory |
| env vars | Three names survive in `next.config.ts:58-63`, resolved with `?? ''` |
| dependencies | **Zero.** No `@supabase/*` in `package.json:31-58`, and `grep -c "@supabase" pnpm-lock.yaml` → 0 |

So R7 is not a code migration. It is the removal of **35 dead SQL and template files**,
**five spots in one config file**, **three env names**, and **eight stale comments**. No
runtime behaviour changes. Nothing in `./web` or `./api` depends on any of it.

This is worth stating plainly because the original plan budgeted R7 as a significant work
item, and it is not one. It can be done in a single commit at any point.

## §8.2 Files deleted outright — 35 files

`supabase/` in its entirety.

| Group | Count | Notes |
| --- | --- | --- |
| `supabase/migrations/*.sql` | 21 | Postgres DDL with RLS policies, dated 2026-04-30 → 2026-08-15. Superseded by §4's Laravel migrations |
| `supabase/.temp/*` | 10 | CLI cache — `linked-project.json`, `project-ref`, `pooler-url`, version pins. Already git-ignored at `.gitignore:42` |
| `supabase/seed/01-schema.sql`, `02-demo-data.sql` | 2 | Superseded by §4.7 seeders |
| `supabase/templates/confirmation.html`, `recovery.html` | 2 | GoTrue email templates. Laravel ships its own notification templates |
| `supabase/backfill/20260815_payment_status_backfill.sql` | 1 | A2 says fresh install — there is nothing to backfill |
| `supabase/.gitignore` | 1 | Goes with the directory |

**Before deleting, one read-only pass is worth it.** These 21 migrations are the only
written record of the original Postgres RLS policy set. §6 has to reconstruct equivalent
authorisation as Filament policies (A4). Nothing in `docs/db-schema/target-schema.md`
carries that information. Read `20260803000000_add_admin_predicate.sql` in particular — it
is the closest thing the repo has to a prior definition of "who is an admin", which A4
replaces. Extract what is useful into §6 first, then delete.

## §8.3 `docs/` — two files, and R4 pulls both ways

| File | Lines | Disposition |
| --- | --- | --- |
| `docs/supabase-full-migration.sql` | 1036 | **Deleted** — done (D1) |
| `docs/supabase-schema.sql` | 178 | **Deleted** — done (D1) |

R4 pins `docs/` to the repository root, so these did not move — they went.

**This section is already executed.** D1 went further than B10 and emptied `docs/` of
everything except this plan and `db-schema/`. That swept up the two audit files that
mentioned Supabase (`AUDIT_SECURITE_COMPLET.md`, 38 mentions; `AUDIT_PLAN_LIVRAISON.md`, 7)
and `scraping-products.schema.toml`, whose line 3 cited
`supabase/migrations/20260504013000_create_products.sql` — a dangling reference that no
longer needs repointing. All deletions are staged in git, so the history retains them.

## §8.4 `next.config.ts` — five edits in one file

| Line | Current | Action |
| --- | --- | --- |
| `:49-50` | `optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr', …]` | Remove both entries. They name **uninstalled** packages — Next is being asked to optimise imports that cannot resolve |
| `:57` | `// Les clés Supabase DOIVENT être définies dans .env.local…` | Delete the comment |
| `:59-60` | `NEXT_PUBLIC_SUPABASE_URL: … ?? ''`, `NEXT_PUBLIC_SUPABASE_ANON_KEY: … ?? ''` | Delete both. The `?? ''` is why their absence has never thrown |
| `:78` | `remotePatterns: { hostname: "spcguwuqqwvjfnfctrzs.supabase.co" }` | Replace with `api.sdcosmetique.ci` — C12 serves media from `/storage/…` on the API host |
| `:177` | `"img-src 'self' data: blob: https://spcguwuqqwvjfnfctrzs.supabase.co https://images.unsplash.com"` | Remove the Supabase origin and **add `https://api.sdcosmetique.ci` in the same edit** (C12) or product images break |
| `:178` | `"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://api.resend.com"` | Remove both Supabase origins. **Add `https://api.sdcosmetique.ci`** — without it §7.2's client is blocked by CSP. Also drop `graph.facebook.com` and `api.resend.com`: B12 moves WhatsApp and Resend to `./api`, so the browser no longer calls either |

Lines `:177-178` are the only entries in this ledger that can break the site if removed
carelessly. Everything else is inert. **Sequencing rule: `next.config.ts` CSP is edited in
P6, together with §7's rewiring — never as part of an isolated "delete Supabase" commit.**

## §8.5 Stale comments — eight sites, cosmetic

None of these affect behaviour. They mislead anyone reading the code about where data comes
from, which matters during a migration.

| Site | Comment |
| --- | --- |
| `src/app/api/products/route.ts:37` | "Évite de frapper Supabase à chaque page vue boutique." — the cache guards MySQL |
| `src/app/api/revalidate/route.ts:3` | "déclenché par un webhook Supabase" — §7.8 makes the caller `./api` |
| `src/app/teint/[slug]/page.tsx:17` | "Mapping SkinTone → clé de config Supabase" — it maps to `site_config` rows |
| `src/features/home/skin-tone-section.tsx:19` | "Cascade: Supabase override -> static local file -> hide" |
| `src/features/home/skin-tone-section.tsx:96` | "Map slug → image URL from Supabase config" |
| `src/features/promo/promo.util.ts:98` | "Supabase a la configuration. Elles ne lisent pourtant aucune configuration" |
| `ecosystem.config.js:12` | "Force IPv4 DNS pour éviter que Next.js bloque les images Supabase (NAT64 → 'private ip')" — the `NODE_OPTIONS` workaround it explains is also at `package.json:18` |

`ecosystem.config.js:12` deserves a second look rather than a blind edit. The
`--dns-result-order=ipv4first` flag it justifies is still applied in `package.json:18`. If
the NAT64 problem is real on the host, the flag must stay for the new media origin (C12) even
though the Supabase justification is obsolete. **Do not delete the flag while deleting the
comment.**

## §8.6 `.gitignore`

| Line | Entry | Action |
| --- | --- | --- |
| `:40` | `# Supabase CLI / Local Development Caches` | Delete |
| `:42` | `supabase/.temp/` | Delete |
| `:43` | `supabase/.branches/` | Delete — the directory never existed |

Folded into §11's rewrite; listed here so the ledger is complete.

## §8.7 `README.md` — seven lines describing a stack that is gone

`README.md:10` states the database is "Supabase (PostgreSQL + Auth + Storage)". It has been
MariaDB via Drizzle since at least `de556e9`. `:36`, `:52-53`, `:71-73` document
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` — the last of which appears **nowhere in the codebase at all**.

B9 rewrites the root README to describe the three-part repository. That rewrite supersedes
every line here. Tracked in §10, not fixed piecemeal.

## §8.8 `todo.md:5`

`- [ ] clean the old supabase codes` — this section is that task. Check it off when §8
completes.

## §8.9 Verification

```sh
# Must return nothing except this plan directory and the two kept audit docs
grep -rni supabase --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=trash --exclude-dir=.next .

# Must not exist
test ! -d supabase

# Must return 0
grep -c "@supabase" pnpm-lock.yaml
```

Expected survivors after §8: `docs/implementation-plan/**` (this plan) only — D1 deleted
the two audit files that previously survived this grep. Anything else is a miss.

## §8.10 UNKNOWNs introduced by this section

None. R7 is fully determined. Its one coupling — `next.config.ts:78,177` needing a media
origin — is answered by C12: `https://api.sdcosmetique.ci`.
