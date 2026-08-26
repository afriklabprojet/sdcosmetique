# §14 Verification

## §14.1 What exists to verify with, today

Honest baseline, because the plan's verification strategy follows from it:

| Asset | State | Evidence |
| --- | --- | --- |
| Unit tests | **One file, never executed.** `src/features/payment/payment-settlement.test.ts` | `package.json:23` runs `playwright test`; `playwright.config.ts:7` scopes to `./tests` |
| E2E tests | Five Playwright specs, all UI and accessibility audits of the admin panel — not behavioural coverage of the data layer | `tests/`, `playwright.config.ts:31-56` |
| CI | **None.** `.github/workflows/deploy.yml` is 0 bytes | — |
| Type checking | `tsc` via `next build`, with `exclude: ["node_modules", "tests"]` | `tsconfig.json:33` |

There is no parity harness and no way to build one cheaply — a harness that compared Drizzle
output to Eloquent output would need both stacks running against the same data, and A2
discards the data. So verification here is **checklist-driven and largely manual**, and this
section says so rather than implying an automation that will not exist.

**C2 settles the test database: SQLite `:memory:`.** That supersedes A5's
`sdcosmetique_api_test`, and it is the fast choice — no service to run, no state between
tests, `RefreshDatabase` costs nothing.

Two things it does not cover, worth knowing rather than discovering:

- **`json` columns.** `products.images`, `skin_tones`, `badges`, `benefits`
  (`src/shared/db/schema.ts:36-38,43`) are JSON. SQLite stores them as text and supports
  JSON path queries, but its behaviour on `whereJsonContains` differs from MariaDB's. A
  green suite does not prove those queries work in production.
- **Strictness.** SQLite is permissive about types and about some constraint violations that
  MariaDB rejects outright.

`decimal` is *not* on this list: §4.3 makes money integer minor units, so the only decimal
left is `products.rating` (`:39`), where SQLite's float storage is harmless.

The gap is narrow and the speed is real, so `:memory:` is a reasonable default. The one
compensating check: **run `php artisan migrate:fresh --seed` against a real MariaDB at least
once per phase**, at STOP 3 and again at STOP 4. That catches the schema-level divergence
without paying for it on every test run.

## §14.2 Per-phase gates

Each is the minimum that makes the following phase safe. They restate §12's gates as
runnable checks.

### P1 — the move preserved history

```sh
git log --follow --oneline web/src/shared/db/schema.ts | wc -l   # > 1
git status --porcelain                                            # empty
cd web && pnpm install && pnpm build                              # succeeds
git check-ignore -v .env.prod                                     # prints a rule
git ls-files | grep -E '\.env' || echo clean                      # clean
```

### P2 — the scaffold is real

```sh
cd api
php artisan --version                    # Laravel 13.x
php artisan test                         # skeleton tests pass
grep '"name"' composer.json              # sdcosmetique/api
git check-ignore -v api/.env             # prints a rule
git check-ignore -v api/.env.example     # prints NOTHING
```

### P3 — auth works cross-origin

Not scriptable. Open a browser at the front-end origin and, with the network panel open:

1. Register a user. `Set-Cookie` arrives from `api.sdcosmetique.ci` and the browser keeps it.
2. Log in, then call an `auth:sanctum` route. It returns 200.
3. Log out. The same route returns 401.
4. Confirm the cookie's `Domain` is `.sdcosmetique.ci` and `SameSite` permits the
   cross-subdomain send.

**Curl will pass all four while the browser fails.** Curl does not enforce CORS, does not
apply `SameSite`, and does not care about `supports_credentials`. R-7 is exactly this.

### P4 — the schema is final

```sh
php artisan migrate:fresh --seed         # clean from empty, on SQLite
php artisan db:show --counts             # table count matches §4.2 (38 with `settings`, C3)

# C2 compensating check — the one time per phase MariaDB is exercised
DB_CONNECTION=mariadb php artisan migrate:fresh --seed
```

Then read the output against §4.2's ledger by eye. A missing table here is discovered by a
controller failing in P5, twenty files later.

### P5 — every endpoint answers

Walk §5.2 and confirm each route returns the shape §7 expects. Twenty routes; there is no
shortcut. Record the actual response shape for each — §7's rewiring is written against
assumptions about those shapes, and the two must agree.

The one automated requirement: **`payment-settlement.test.ts` re-expressed as a Pest test,
passing, before its Drizzle original is deleted in P6.** It is the only behavioural anchor
this migration has.

### P6 — `./web` is clean

```sh
cd web
grep -rn "from '@/shared/db'\|from 'drizzle-orm" src scripts   # zero
grep -c drizzle package.json                                    # 0
test ! -d src/shared/db && test ! -d ../drizzle
pnpm build                                                       # succeeds
```

Then §14.3.

### P7 — nothing Supabase survives

```sh
grep -rni supabase --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=trash --exclude-dir=.next .
```

Expected survivors: `docs/implementation-plan/**` only. The audit files that used to
mention Supabase are gone (D1), so this grep is now stricter than §8 assumed — anything
outside this plan is a miss (§8.9).

## §14.3 The manual storefront walk — STOP 4's real content

This is the verification that matters, because it is the only one that covers §7's rewiring
end to end. Do it in a browser with the console and network panel open. **A console error is
a failure even if the page renders** — R-2 exists precisely because a broken API produces a
page that looks fine.

| # | Path | Proves | Watch for |
| --- | --- | --- | --- |
| 1 | `/` | §7.4's four server-component calls | Bestsellers, testimonials (C11), categories, and settings (C3) all populate |
| 2 | `/boutique` | `GET /products` | Prices are real, not the `PRODUCTS` constant (R-2) |
| 3 | `/categorie/face` | `GET /products?category=` + `GET /settings/hero_face` (C3) | Hero image loads — C12's storage origin lands here |
| 4 | `/produit/{slug}` | `GET /products/{slug}` | Reviews and related products present, whether embedded or fetched separately |
| 5 | `/teint/{slug}` | `?skinTone=` filter | Filter actually filters |
| 6 | `/quiz` | Three calls: settings, products, submission | Submission persists — check the row in `./api` |
| 7 | `/avis` | `GET /reviews` | — |
| 8 | `/inscription` → `/connexion` → `/compte` | Full auth cycle | Cookie survives a hard refresh |
| 9 | `/compte` tabs | `PATCH /profile`, `DELETE /sessions`, loyalty | Profile edit persists |
| 10 | `/checkout` | `POST /orders`, `POST /payments` | **`orders.total` equals `subtotal + Σ order_adjustments.amount`** (A1) — verify in the database, not the UI |
| 11 | `/confirmation` | `GET /payments/{id}` | Polling resolves |
| 12 | Footer newsletter | `POST /newsletter-subscriptions` (C11) | Accepts a bare email, no account |
| 13 | `/contact` | `POST /contact-messages` | Email actually sends via Laravel Mail (B12) |
| 14 | Filament `/admin` | The panel replaces the deleted Next admin | Log in with each of A4's five roles; confirm `canViewAny()` gates differ |
| 15 | Filament: edit a product | §7.8's revalidation flow | The storefront reflects the change — this is the R-6 check |
| 16 | Filament: upload an image | C12 end to end | The `https://api.sdcosmetique.ci/storage/…` URL loads inside the storefront, and CSP `img-src` permits it |

Step 10 is the one to be slowest about. A1's derived-total rule is the plan's most
consequential schema decision and the only way to check it is to read the rows.

## §14.4 Cutover checks — for the hand-deploy (C7)

Deployment is outside this migration. This checklist is handed over with the branch so that
whoever performs the first manual deploy has one.

Before:

1. `mysqldump` of production, restored into a scratch database to prove it is readable (R-1).
2. C6's Jeko webhook reconfiguration confirmed, with the person who did it named. The URL is
   `https://api.sdcosmetique.ci/webhooks/jeko-pay` (C8).
3. `api/.env` and `web/.env` written by hand. C9 leaves `.env.prod` untouched at the root —
   nothing reads it, so it is not a deploy input.

After, within the hour:

1. Repeat §14.3 steps 1, 2, 8, and 10 against production.
2. Place one real order end to end and confirm the payment settles — this is the only test of
   the repointed webhook.
3. Confirm `./api` logs show traffic. Silence means CSP or CORS (R-3).
4. Confirm no request in the browser network panel goes to the old `/api/*` paths on the web
   origin. Any that do are missed §7.3 call sites.

## §14.5 What is deliberately not built

Per R5's scope discipline and §15:

- No CI pipeline. `.github/workflows/deploy.yml` stays 0 bytes.
- No test framework beyond Pest, which arrives with Laravel.
- No MariaDB test database. C2 chose `:memory:`; A5's `sdcosmetique_api_test` and
  `sdcosmetique_web_test` are not created.
- No Vitest setup in `./web`. A5 provides for it; nothing in this migration requires it.
- No parity automation. §14.1 explains why it cannot be built cheaply.

Each is listed in §15 as recommended-not-in-scope. None is a prerequisite for cutover.
