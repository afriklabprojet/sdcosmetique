# M7 — Cleanup and release validation

**Objective:** delete the dead data layers, bring the repo documentation in line with the
new architecture, and run the full validation walk. Nothing here changes behavior — M6
already proved Drizzle unreached.

**Depends on:** M6. **Priority:** 3 — cleanup.

## Deletions

- Drizzle, per [§9](../implementation-plan/09-drizzle-removal.md): `web/src/shared/db/`,
  root `drizzle/` and `drizzle.config.ts`, `drizzle-*` packages from `web/package.json`,
  leftover scripts (`scripts/create-admin-users.ts`, `scripts/seed-mariadb.ts` — replaced by
  Laravel seeders).
- Supabase residue, per [§8](../implementation-plan/08-supabase-removal.md): `supabase/`
  directory and any surviving imports/env keys (also on `todo.md` as "clean the old
  supabase codes").
- Env: split per old B5/B6 — runtime env only in `api/.env` and `web/.env`; refresh both
  `.env.example` files (`NEXT_PUBLIC_API_URL`, `REVALIDATE_SECRET`; DB/Jeko/Resend/WhatsApp
  keys move to `api/.env.example`); delete `ADMIN_EMAILS` and Upstash keys.

## Documentation

- Rewrite `AGENTS.md` per the spec in [§10](../implementation-plan/10-agents-md.md),
  updated for the two-app layout (`api/` Laravel + `web/` Next) and the admin-in-Next
  reality.
- READMEs: root (three-part repo), `api/README.md`, `web/README.md`.
- `.gitignore` per [§11](../implementation-plan/11-gitignore.md).
- `graft build` to refresh the repo context graph.

## Validation

Test gates:

```sh
cd api && ./vendor/bin/pest                                    # full suite green
DB_CONNECTION=mariadb php artisan migrate:fresh --seed          # MariaDB compensating run
cd ../web && pnpm build                                         # clean build
rg -i "drizzle|supabase" web/src web/scripts web/package.json   # zero hits
rg "from '@/shared/db'" web/src                                 # zero hits
```

Manual walk (adapted from the archived §14.3 — admin steps now target the Next admin, not
Filament). Browser with console + network panel open; **a console error is a failure even
if the page renders**:

| # | Path | Proves |
| --- | --- | --- |
| 1 | `/` | settings, testimonials, bestsellers, categories populate from the API |
| 2 | `/boutique`, `/categorie/{slug}`, `/teint/{slug}` | product queries + filters |
| 3 | `/produit/{slug}` | product show with reviews and related |
| 4 | `/quiz` | questions load, submission persists (check the row in `api`) |
| 5 | `/avis` | reviews index |
| 6 | register → login → `/compte` | Sanctum cookie survives hard refresh; profile edit persists; loyalty ledger shows |
| 7 | `/checkout` → `/confirmation` | order placement + payment polling; verify order totals in the database, not the UI |
| 8 | footer newsletter, `/contact` | leads endpoints; mail actually sends |
| 9 | `/admin/login` | admin session via Fortify; non-admin user denied |
| 10 | every admin tab | reads and one write each against `/api/admin/*` |
| 11 | admin: edit product, edit setting | storefront reflects the change (revalidation flow) |
| 12 | admin: upload product image | API storage URL renders in the storefront; CSP `img-src` permits it |

## Out of scope (unchanged decisions)

Deployment is performed by hand afterwards (C7) — the Jeko webhook re-registration to
`/webhooks/jeko-pay`, production env files, and DNS/hosting are deploy-time steps, not part
of this migration. No CI is added.

## Definition of Done

- All deletions done, all test gates green, the manual walk passes end to end.
- `docs/milestones/README.md` statuses updated; branch `migration-laravel` ready for review.
