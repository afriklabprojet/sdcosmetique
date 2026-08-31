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

## Execution (2026-08-31)

Started after the M6 smoke. Drizzle and Supabase are off disk: `web/src/shared/db/`,
`web/scripts/{seed-mariadb,create-admin-users,reorganize-admin-tabs,setup-jeko-africa}`,
root `drizzle/` + `drizzle.config.ts`, and `supabase/` are gone. `web/package.json` no
longer lists `drizzle-orm`, `drizzle-kit`, `mysql2`, `bcryptjs`, `jose`, Upstash, or
`dotenv-cli`. `next.config.ts` no longer references Supabase hosts or env keys.
`web/.env.example` is API-only (`NEXT_PUBLIC_API_URL`, `REVALIDATE_SECRET`). `web/.env`
stripped of `ADMIN_EMAILS`, Supabase, Upstash, and `DB_*`.

Docs: `AGENTS.md` rewritten per §10 for the two-app layout (admin stays in Next, not
Filament). Root / `api/` / `web/` READMEs describe the split. `.gitignore` is three files
per §11 (`git check-ignore -v` on `.env.prod`, `api/.env`, `web/.env` all ignore;
`.env.example` files are not ignored). `graft build` refreshed the graph.

Gates (2026-08-31):

- `cd api && ./vendor/bin/pest` → **161 passed**
- User-space MariaDB 11.8.8 on `:3307`, `DB_CONNECTION=mariadb … php artisan migrate:fresh --seed` → **exit 0** (system `mariadb` unit is inactive; Docker daemon was not running)
- `cd web && pnpm build` → **green** (43 routes; survivors `ƒ /api/revalidate`, `ƒ /api/csp-report`)
- `rg -i "drizzle|supabase" web/src web/scripts web/package.json` → **zero**
- `rg "from '@/shared/db'" web/src` → **zero**

Manual walk against `http://localhost:3000` + Laravel `:8000` (browse as **localhost**, not
`127.0.0.1`):

| # | Result |
| --- | --- |
| 1 `/` | Settings, KA categories, bestsellers from the API. `GET /api/cart` 200 |
| 2 boutique / `categorie/serums` | Catalog from Laravel. `/categorie/face` stays empty: SD nav slug vs KA `serums`/`cleansers` |
| 3 PDP `vitamin-c-brightening-serum` | Show + related products |
| 4 `/quiz` | `GET /quiz-questions` 200; submit `POST /quiz-submissions` **201** (Ébène / taches / essentielle) |
| 5 `/avis` | `GET /reviews` 200 |
| 6 register → `/compte` | `POST /register` **201**; session + account + `loyalty-entries` 200; **20 pts** signup bonus |
| 7 checkout COD | `PUT /checkout/{contact,delivery,payment}` 200; `POST /orders` **201**; order `01M1C82QVSKS2PFW66PQA7K18W` subtotal 45 + total 2045 XOF in the database |
| 8 contact + newsletter | `POST /contact-messages` **201**; `POST /newsletter-subscriptions` **201**. Mail driver is `log` locally — messages are not delivered to a mailbox |
| 9 `/admin/login` | Logout then `POST /login` **200**; `GET /admin/session` 200. Seeded `admin@ka.ci` |
| 10 admin tabs | Preload GETs 200 (orders, products, reviews, quiz, loyalty, settings, …). Dashboard lists the walk order. Commandes + Produits + Hero opened |
| 11 setting write | `PATCH /admin/settings/skin_tone_section_title` **200**. Observer POSTs `/api/revalidate` when `WEB_REVALIDATE_SECRET` is set |
| 12 image upload | Not re-run; CSP already permits the API origin. KA seed still points at missing `/assets/images/product/square/*.jpg` — `next/image` 400s in the console |

Those image 400s (and `/categorie/face` empty, `GET /settings/hero_serums` 404) are **catalog
seed / nav slug** leftovers, not a surviving Drizzle path.

## Out of scope (unchanged decisions)

Deployment is performed by hand afterwards (C7) — the Jeko webhook re-registration to
`/webhooks/jeko-pay`, production env files, and DNS/hosting are deploy-time steps, not part
of this migration. No CI is added.

## Definition of Done

- All deletions done, all test gates green, the manual walk passes end to end.
- `docs/milestones/README.md` statuses updated; branch `migration-laravel` ready for review.
