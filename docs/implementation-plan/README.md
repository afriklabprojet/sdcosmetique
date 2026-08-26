# Implementation Plan — Drizzle → Laravel 13 (API) + Filament 5

**Scope.** Split the current Next.js 16 monolith into a Laravel 13 API at `./api` and a
Next.js front end at `./web`, remove Drizzle and every Supabase residue, and build the
Filament 5 admin office. This directory is the plan. Nothing here has been executed.

**Language.** English, per `AGENTS.md:60-64`. The previous French Drizzle-era plan
(10 files, 1 171 lines) was archived to `trash/drizzle-to-laravel/legacy-implementation-plan/`
rather than deleted — it is untracked by git and would otherwise be unrecoverable.

**Evidence rule.** Every claim about the current codebase carries a `path:line`. Every
claim about a framework version carries a manifest constraint or a URL fetched on
2026-08-25. Anything undetermined is written `UNKNOWN` with a one-line resolution note.
Nothing is filled in with plausible defaults.

## Sections

| §                                             | Subject                              |
| --------------------------------------------- | ------------------------------------ |
| §0 (below)                                    | Decisions — locked and open          |
| [§1](./01-target-layout.md)                   | Target repo layout                   |
| [§2](./02-stack-baseline.md)                  | Verified stack baseline              |
| [§3](./03-scaffolding.md)                     | Scaffolding procedure (R2)           |
| [§4](./04-schema-translation.md)              | Schema translation                   |
| [§5](./05-api-surface.md)                     | API surface — CRUDdy by Design       |
| [§6](./06-filament-admin.md)                  | Filament 5 admin office              |
| [§7](./07-web-rewiring.md)                    | Web rewiring (R9) + call-site ledger |
| [§8](./08-supabase-removal.md)                | Supabase removal ledger (R7)         |
| [§9](./09-drizzle-removal.md)                 | Drizzle removal ledger (R6)          |
| [§10](./10-agents-md.md)                      | `AGENTS.md` rewrite spec (R8)        |
| [§11](./11-gitignore.md)                      | `.gitignore` spec (R11)              |
| [§12](./12-phases.md)                         | Execution phases with STOP gates     |
| [§13](./13-risk-register.md)                  | Risk register                        |
| [§14](./14-verification.md)                   | Verification                         |
| [§15](./15-out-of-scope.md)                   | Recommended, not in scope            |

---

## §0 Decisions

### §0.1 Locked

| #   | Decision                                                                                                                                                                                  | Source     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| A0  | `product_results` is never built. Its content folds into `products.description`. `results_title`/`results_subtitle` (`src/shared/db/schema.ts:49-50`) are dropped.                         | Phase 0    |
| A1  | `orders` carries `subtotal` and `total` only. Every shipping / discount / tax line becomes a row in `order_adjustments(order_id, type, amount, label)`. `total = subtotal + Σ amount`.      | Phase 0    |
| A2  | Fresh install, no legacy data. No ETL, no backfill. The current production database is discarded.                                                                                         | Phase 0    |
| A3  | Identity splits three ways: `users` (auth), `clients` (skin profile, `user_id` UNIQUE), `order_customers` (immutable per-order snapshot, written for guests **and** logged-in users).      | Phase 0    |
| A4  | No `admins` table and no `users.role` column. RBAC is `roles(id,name,description)` + `role_user(user_id,role_id)` with a composite primary key. Five roles.                               | Phase 0    |
| A5  | Two test databases. Pest hits a real API test database; Vitest in `./web` uses mocks and fixtures and never touches a database.                                                            | Phase 0    |
| B1  | Auth is **Laravel Sanctum**.                                                                                                                                                              | Phase 1 Q1 |
| B2  | Filament lives in `./api`, served at `api.sdcosmetique.ci/admin`. `src/app/admin/**` is deleted. The JSON API is served under `api.sdcosmetique.ci/v1`.                                    | Phase 1 Q2 |
| B3  | One database engine per environment: **SQLite in development, MariaDB in production**. `./web` never has database access of any kind.                                                      | Phase 1 Q3 |
| B4  | Composer package `sdcosmetique/api`, `"php": "^8.5"`, `"laravel/framework": "^13.0"`.                                                                                                      | Phase 1 Q4 |
| B5  | `.env.prod` stays at the repo root, git-ignored. The only runtime env files are `./api/.env` and `./web/.env`.                                                                             | Phase 1 Q5 |
| B6  | `.env.example` is split into `./api/.env.example` and `./web/.env.example`.                                                                                                               | Phase 1 Q6 |
| B7  | `pnpm-workspace.yaml` is deleted. `./web` becomes a standalone project, not a workspace member.                                                                                            | Phase 1 Q7 |
| B8  | Deploy topology is deferred — out of scope for this plan.                                                                                                                                  | Phase 1 Q8 |
| B9  | Three READMEs: root (whole repo), `./api/README.md`, `./web/README.md`.                                                                                                                   | Phase 1 Q9 |
| B10 | Delete the Supabase SQL under `docs/`. Keep `docs/mockups/`.                                                                                                                              | Phase 1 Q10 |
| B11 | Rate limiting is Laravel-native. Upstash is removed entirely.                                                                                                                             | Phase 1 Q11 |
| B12 | All notifications and payment integrations move to Laravel — Resend, WhatsApp Cloud API, Jeko Pay.                                                                                        | Phase 1 Q12 |
| B13 | Big-bang cutover on a branch named `migration-laravel`.                                                                                                                                    | Phase 1 Q13 |
| C1  | Sanctum runs in **SPA cookie session** mode. Resolves O1; §5 and §7 were already written for it.                                                                                       | Phase 2 O1 |
| C2  | `php artisan test` runs against **SQLite `:memory:`**. Resolves O2, and supersedes A5's `sdcosmetique_api_test`.                                                                        | Phase 2 O2 |
| C3  | `site_config` becomes a single **`settings` table** in `./api` with a public read endpoint. No fan-out into `categories.hero_*` / `coupons` / `skin_tones`. Resolves O4.                | Phase 2 O4 |
| C4  | Rate limiting for the two surviving `./web` route handlers is **Next.js middleware** using `rate-limiter-flexible`. Resolves O10.                                                       | Phase 2 O10 |
| C5  | `pnpm-workspace.yaml` is **kept and moved to `./web`**, not deleted. Supersedes B7's "delete". Resolves O11.                                                                            | Phase 2 O11 |
| C6  | The Jeko webhook is `POST /webhooks/jeko-pay` behind a `webhook.jeko` middleware; Jeko is reconfigured before P8 and the old endpoint proxies for 48 h. Resolves O9.                    | Phase 2 O9 |
| C7  | **Deployment is out of the migration entirely.** No milestone covers it; it is performed by hand afterwards. Supersedes B8's "deferred".                                                | Phase 2 B8 |
| C8  | **`/v1` everywhere except the webhook.** The JSON API is `api.sdcosmetique.ci/v1/…`; the Jeko receiver is unversioned at `api.sdcosmetique.ci/webhooks/jeko-pay`. Resolves O12.                | Phase 2 O12 |
| C9  | `.env.prod` is **left alone** at the root, git-ignored, consumed by nothing in the repo. `api/.env` and `web/.env` are produced by hand during C7's deploy. Resolves O3.                          | Phase 2 O3 |
| C10 | **One `shipping_zones` table with tiers**, replacing `site_config.shipping`. Resolves O5.                                                                                                          | Phase 2 O5 |
| C11 | **`testimonials` and `newsletter_subscribers` are both kept** and migrated to `./api`. Resolves O7.                                                                                                | Phase 2 O7 |
| C12 | **Laravel `Storage`, local `public` disk.** Media is served from `api.sdcosmetique.ci/storage/…`. Resolves O8.                                                                                     | Phase 2 O8 |
| C13 | The domain table is **`notification_logs`**, not `notifications` — leaving that name to Laravel and Filament. Resolves O6.                                                                     | Phase 2 O6 |
| D1  | **`docs/` is emptied except this plan and `db-schema/`.** Deleted: `supabase-full-migration.sql`, `supabase-schema.sql`, `mockups/` (9 files), `AUDIT_PLAN_LIVRAISON.md`, `AUDIT_SECURITE_COMPLET.md`, `scraping-products.schema.toml`. **Supersedes B10's "keep `docs/mockups/`".** Done ahead of P0 — the deletions are staged, recoverable from git history. | Direct instruction |

### §0.2 Open

**None.** All twelve questions raised at the Phase 1 and Phase 2 gates are answered and
recorded above as B1–B13, C1–C13, and D1.

Three items remain undetermined but are *not* decisions — they are facts to be read at
execution time, each with a resolution step written where it lands:

| Item | Resolved by | Where |
| --- | --- | --- |
| Exact contents of Laravel 13's shipped `.gitignore` | Reading it after `composer create-project` | §11.4 |
| Whether Next.js middleware here runs on the Node.js runtime | Checking at P6 | §7.8 |
| Whether `shipping_zones` needs one row or two per zone | Writing the seeder | §4.10 |

