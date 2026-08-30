# Implementation Plan — Reference Library

**This directory is no longer the execution plan.** The migration is now driven by the
milestones in [docs/milestones/](../milestones/README.md), following the 2026-08-30 pivot:
the Laravel API is copied from the sibling `../ka-cosmetics/api` project, Filament is
removed, admin JSON endpoints replace it, and the existing Next.js app at `./web` keeps
serving both the storefront and the admin.

What remains here are the sections that are still the **authority for their subject** and
are cited by the milestones:

| § | Document | Still authoritative for | Consumed by |
| --- | --- | --- | --- |
| §4 | [04-schema-translation.md](04-schema-translation.md) | SD-specific domain modeling: settings (§4.9), quiz and loyalty (§4.4), testimonials/newsletter (C11) | M5 |
| §5 | [05-api-surface.md](05-api-surface.md) | Route conventions (CRUDdy, no service classes), Sanctum SPA-cookie auth boundaries, endpoint ledger | M3, M4 |
| §7 | [07-web-rewiring.md](07-web-rewiring.md) | The call-site ledger (W1/W2/W3), API client rules, surviving Next routes, env split | M4, M6 |
| §8 | [08-supabase-removal.md](08-supabase-removal.md) | Supabase removal ledger | M7 |
| §9 | [09-drizzle-removal.md](09-drizzle-removal.md) | Drizzle removal ledger and deletion ordering (§9.9) | M6, M7 |
| §10 | [10-agents-md.md](10-agents-md.md) | `AGENTS.md` rewrite spec | M7 |
| §11 | [11-gitignore.md](11-gitignore.md) | `.gitignore` spec | M1, M7 |

## Superseded content — read with the pivot in mind

Even in the kept documents, a few statements are overridden by the milestones (deviations
are recorded in [docs/milestones/README.md](../milestones/README.md)):

- §5's "Admin CRUD is not in `api.php` — B2 → Filament" is reversed: admin CRUD **is** JSON,
  under `/api/admin/*` (M3).
- §7.3's "deleted with admin UI" call sites are rewired instead of deleted (M4, M6).
- The `/v1` prefix (C8) is not used; the copied API keeps Laravel's default `/api` prefix.
- Schema decisions A1/A3/A4 yield to the copied KA schema where they conflict; §4 remains
  authoritative only for the new SD modules listed above.

## Archived files

The sections whose premise the pivot invalidated (fresh scaffold, Filament admin, the old
phase sequence and its risk/verification framing) were moved to
`trash/ka-pivot/implementation-plan/` on 2026-08-30, untracked but recoverable:
`01-target-layout`, `02-stack-baseline`, `03-scaffolding`, `06-filament-admin`,
`12-phases`, `13-risk-register`, `14-verification` (its manual storefront walk lives on,
adapted, in [M7](../milestones/M7-cleanup-and-validation.md)), `15-out-of-scope`.

## §0 Decision ledger

Kept from the original plan because the documents above cite these identifiers. The
**Post-pivot** column records each decision's current standing; "in force" means unchanged.

| # | Decision (condensed) | Post-pivot standing |
| --- | --- | --- |
| A0 | `product_results` never built; folds into `products.description`. | In force |
| A1 | `orders` = `subtotal` + `total` only; lines in `order_adjustments`. | **Superseded** — KA's order model wins (M-plan deviations) |
| A2 | Fresh install, no legacy data, no ETL. | In force |
| A3 | Identity split incl. `order_customers` snapshot table. | **Superseded** — KA's `orders.email` + `destination` JSON |
| A4 | No `admins` table; RBAC via `roles` + `role_user`. | **Superseded** — KA's `admins` table gates admin access |
| A5 | Two test databases (Pest real DB, Vitest mocks). | Superseded by C2 (already) |
| B1 | Auth is Laravel Sanctum. | In force |
| B2 | Filament admin in `./api`; `src/app/admin/**` deleted; API under `/v1`. | **Superseded** — admin JSON + Next admin kept (M3, M4) |
| B3 | SQLite in development, MariaDB in production; `./web` has no DB access. | In force |
| B4 | Composer package `sdcosmetique/api`, PHP ^8.5, Laravel ^13. | In force (applied to the copied project, M1) |
| B5 | `.env.prod` stays at root; runtime env only `api/.env` + `web/.env`. | In force |
| B6 | `.env.example` split per app. | In force |
| B7 | Delete `pnpm-workspace.yaml`. | Superseded by C5 (already) |
| B8 | Deploy topology deferred. | Superseded by C7 (already) |
| B9 | Three READMEs: root, `api/`, `web/`. | In force (M7) |
| B10 | Delete Supabase SQL, keep mockups. | Superseded by D1 (already) |
| B11 | Laravel-native rate limiting; Upstash removed. | In force |
| B12 | Resend, WhatsApp Cloud API, Jeko Pay move to Laravel. | In force |
| B13 | Big-bang cutover on branch `migration-laravel`. | In force |
| C1 | Sanctum SPA cookie session mode. | In force |
| C2 | Tests on SQLite `:memory:`. | In force (KA suite already complies) |
| C3 | Single `settings` table with public read endpoint. | In force (M5) |
| C4 | Rate-limit surviving `./web` routes in Next middleware. | In force (M6) |
| C5 | `pnpm-workspace.yaml` kept, moved to `./web`. | In force |
| C6 | Jeko webhook `POST /webhooks/jeko-pay`; reconfigure + 48 h proxy. | In force (M5; reconfiguration is deploy-time) |
| C7 | Deployment entirely out of the migration. | In force |
| C8 | `/v1` prefix everywhere except the webhook. | **Superseded** — KA's `/api` prefix kept |
| C9 | `.env.prod` untouched at root, consumed by nothing. | In force |
| C10 | One `shipping_zones` table with tiers. | **Superseded** — KA's `delivery_methods` backs "livraison" |
| C11 | `testimonials` and `newsletter_subscribers` both kept. | In force (newsletter exists in KA Leads; testimonials in M5) |
| C12 | Laravel `Storage`, local public disk, media from `api…/storage/…`. | In force |
| C13 | Domain table named `notification_logs`, not `notifications`. | Moot for loyalty (M5 uses `loyalty_ledger`); KA's Payments module owns its own notification storage |
| D1 | `docs/` emptied except this plan and `db-schema/`. | In force (now also `docs/milestones/`) |

The full original wording is in git history
(`git show HEAD:docs/implementation-plan/README.md` before this rewrite).
