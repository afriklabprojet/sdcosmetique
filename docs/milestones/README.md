# Migration Milestones — KA API Copy, Filament Removal, Next Wiring

## Purpose

This plan supersedes the phase plan previously at `docs/implementation-plan/12-phases.md`
(archived in `trash/ka-pivot/implementation-plan/`). The strategy pivoted on 2026-08-30:
instead of scaffolding Laravel fresh and building a Filament admin, we copy the fully
implemented Laravel API from the sibling project `../ka-cosmetics/api`, strip Filament,
expose admin JSON endpoints, and connect the existing Next.js app (storefront + admin) to it.

The surviving sections of the old plan remain the authority for what they cover and are
cited throughout: [schema translation (§4)](../implementation-plan/04-schema-translation.md),
[API surface (§5)](../implementation-plan/05-api-surface.md),
[web rewiring ledger (§7)](../implementation-plan/07-web-rewiring.md),
[Supabase removal (§8)](../implementation-plan/08-supabase-removal.md),
[Drizzle removal (§9)](../implementation-plan/09-drizzle-removal.md),
[AGENTS.md spec (§10)](../implementation-plan/10-agents-md.md),
[gitignore spec (§11)](../implementation-plan/11-gitignore.md).
[docs/db-schema/](../db-schema/README.md) is retained as reference for the SD-module table
specs and production seed content — see its README for what the pivot superseded there.

## Final Architecture

- `./api` — Laravel 13 modular API copied from `../ka-cosmetics/api`
  (`app/Modules/{Accounts,Catalog,Content,Identity,Leads,Orders,Payments,Shopping}` plus new
  SD modules), Sanctum SPA-cookie + Fortify auth, no Filament, admin JSON endpoints under
  `/api/admin/*`, SQLite in development and MariaDB in production (B3).
- `./web` — the current Next.js app, unchanged location, serving both the storefront and the
  admin at `/admin`. All data comes from the API; no database access of any kind remains in
  `./web` at the end.

## Recorded Deviations From the Old Plan

These are deliberate and explicit, not silent drift:

| Old rule | New reality |
| --- | --- |
| R2 — `./api` is never copied from another Laravel project | Overridden: `./api` is a copy of `../ka-cosmetics/api` |
| B2 / §6 — admin is Filament at `api…/admin`; `src/app/admin/**` deleted | Replaced: admin JSON endpoints + the existing Next admin UI |
| A1 / A3 / A4 — `order_adjustments`, `order_customers`, `roles`+`role_user` | KA's schema wins where they conflict: order snapshots in `orders.email`/`orders.destination`, an `admins` table gating admin access |
| C8 — `/v1` prefix | KA's default `/api` prefix is kept to avoid churn; `./web` only knows `NEXT_PUBLIC_API_URL` |
| C10 — `shipping_zones` table | KA's existing `delivery_methods` module backs the "livraison" admin tab |

## Milestone Map

| ID | Milestone | Objective | Depends on | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| M1 | [Copy the API baseline](M1-copy-api-baseline.md) | Replace the empty `./api` scaffold with the KA API and prove the copied suite green. | — | 1 — KA spine | Done |
| M2 | [Remove Filament](M2-remove-filament.md) | Strip every Filament artifact while keeping the `Admin` model, policies, and domain intact. | M1 | 1 — KA spine | Done |
| M3 | [Admin JSON endpoints](M3-admin-json-endpoints.md) | Replace the deleted Filament resources with authorized `/api/admin/*` endpoints. | M2 | 1 — KA spine | Done |
| M4 | [Next wiring — KA surfaces](M4-next-wiring-ka-surfaces.md) | API client, admin auth, and rewiring of every admin tab and storefront call site the KA domain already covers. | M3 | 1 — KA spine | Done |
| M5 | [SD domains in the API](M5-sd-domains.md) | Settings, quiz, loyalty (Jeko), testimonials, and product reviews as new modules. | M2 (M3 conventions) | 2 — SD additions | Done |
| M6 | [Next wiring — SD surfaces](M6-next-wiring-sd-surfaces.md) | Rewire the remaining admin tabs and storefront pages; only `revalidate` and `csp-report` survive as Next routes. | M4, M5 | 2 — SD additions | Done |
| M7 | [Cleanup and release validation](M7-cleanup-and-validation.md) | Delete Drizzle/Supabase, rewrite repo docs, run the full manual walk and test gates. | M6 | 3 — cleanup | Done |

## Execution Order and the Priority Rule

**The KA migration is the priority.** M1 → M2 → M3 → M4 complete, tested, and committed
before any M5 work starts. If work is interrupted, the repo must be left with the KA spine
fully functional: admin tabs without an API domain (hero, contenu, faq, legal, branding,
marketing, paiement config, quiz, jeko, avis, témoignages) keep running on Drizzle until M5/M6
deliver their backing. Drizzle and Supabase are deleted only in M7, after nothing reaches them.

```text
M1 ──→ M2 ──→ M3 ──→ M4 ──┐
        └───→ M5 ──→ M6 ──┴──→ M7
```

M5 depends on M2 (module layout without Filament) and follows M3's endpoint conventions; it
must not start before M4 is done, per the priority rule, even though nothing technically
blocks it earlier.

## Mixed-State Note (closed)

Between M4 and M6 the app intentionally ran split: KA-covered surfaces read the Laravel
database, SD surfaces still read MySQL via Drizzle. M6 closed that split in `./web`. M7
deleted the unused Drizzle layer, seed scripts, and the `supabase/` tree. Nothing in
`./web` reaches a database.

## Global Definition of Done

- Pest suite green at the end of every milestone; MariaDB `migrate:fresh --seed` run at the
  end of M5 and M7 to compensate for SQLite permissiveness.
- No Filament package, provider, class, asset, or test remains after M2.
- Every admin tab in `web/src/features/admin/admin.view.tsx` works against `/api/admin/*`
  with authorization enforced server-side (active `admins` row), not by cookie presence.
- After M7: zero Drizzle/Supabase imports in `./web`, `pnpm build` succeeds, and the manual
  walk in [M7](M7-cleanup-and-validation.md) passes with a clean browser console.
- Deployment stays out of scope (C7); the Jeko webhook re-registration remains an external
  prerequisite handled at deploy time.
