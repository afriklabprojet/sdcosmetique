# §9 Drizzle removal ledger (R6)

R6: "Drizzle is removed completely — code, schema, migrations, config, dependencies,
scripts." Unlike R7 (§8, dead code), this one removes the **live data layer**. It cannot be
done early, and it cannot be done in pieces. §12 places it in a single phase, after §5's
controllers answer every request §7 needs.

## §9.1 Footprint

| Category | Count | Where |
| --- | --- | --- |
| Files importing `drizzle-orm` | 37 | 20 route handlers, 13 feature modules, 2 scripts, `src/shared/db/index.ts`, `src/shared/db/schema.ts` |
| Files importing the `db` client | 35 | `grep -rn "from '@/shared/db'"` |
| Drizzle query calls | 91 | `db.select` / `insert` / `update` / `delete` / `query` / `transaction` |
| Generated migration artefacts | 3 | `drizzle/` |
| npm dependencies | 2 direct + transitive | `drizzle-orm`, `drizzle-kit` |
| npm scripts | 3 | `package.json:27-29` |
| Config files | 1 | `drizzle.config.ts` |

## §9.2 Config and generated artefacts — deleted

| Path | Lines | Note |
| --- | --- | --- |
| `drizzle.config.ts` | 14 | Points at `./src/shared/db/schema.ts`, outputs to `./drizzle`, reads the same five `DB_*` env vars as `src/shared/db/index.ts:13-17` |
| `drizzle/0000_previous_freak.sql` | — | The only generated migration. Superseded by §4 |
| `drizzle/meta/0000_snapshot.json` | — | Drizzle-kit state |
| `drizzle/meta/_journal.json` | — | Drizzle-kit state |

A2 (fresh install, no legacy) is what makes deleting `drizzle/` safe. If A2 ever reverses,
`0000_previous_freak.sql` becomes the only machine-readable description of the production
schema and must be preserved before this step. Copy it to `trash/` before deleting — it is
git-ignored there, but recoverable during the migration.

## §9.3 The data layer — deleted

| Path | Lines | Replaced by |
| --- | --- | --- |
| `src/shared/db/index.ts` | 29 | Laravel's connection manager, `api/config/database.php` (§3.6) |
| `src/shared/db/schema.ts` | 211 | 37 Eloquent models + migrations (§4) |

`src/shared/db/index.ts:22-25` keeps the mysql2 pool on `globalThis` to survive Next's dev
hot reload. That whole class of problem disappears — Laravel manages its own pool per
worker.

## §9.4 Feature modules — deleted, not ported

Thirteen modules. Each is replaced by a controller (§5) or a Filament resource (§6). None is
copied into `./api`; the logic is re-expressed in Eloquent.

| Module | Drizzle calls | Replaced by |
| --- | --- | --- |
| `src/features/quiz/quiz.repository.ts` | 10 | `QuizSubmissionController`, `QuizQuestion` model |
| `src/features/admin/admin-actions.ts` | 8 | Filament actions (§6.4) |
| `src/shared/auth/auth.service.ts` | 7 | Sanctum + `SessionController` / `RegistrationController` (§5.4) |
| `src/features/testimonials/testimonial.repository.ts` | 4 | `TestimonialController` (C11) |
| `src/features/loyalty/jeko.repository.ts` | 3 | `LoyaltyLedgerController` + `LoyaltyAccount` model |
| `src/features/catalog/review.repository.ts` | 3 | `ProductReviewController` |
| `src/features/catalog/category.repository.ts` | 3 | `CategoryController` |
| `src/features/site-config/site-config.server.ts` | 2 | `SettingController` — **C3** |
| `src/features/catalog/product.repository.ts` | 2 | `ProductController` |
| `src/features/site-config/site-config.query.ts` | 1 | `SettingController` — **C3** |
| `src/features/orders/order.repository.ts` | 1 | `OrderController` |
| `src/features/admin/product.repository.ts` | 1 | Filament `ProductResource` |
| `src/features/testimonials/testimonial.query.ts` | — | imports `drizzle-orm` operators only |
| `src/features/orders/order-notification.service.ts` | — | `OrderPlaced` notification (B12) |
| `src/features/payment/payment-settlement.service.ts` | — | `PaymentTransactionController` + reconcile command (B12) |

`src/features/payment/payment-settlement.service.ts` has the only unit test in the
repository — `payment-settlement.test.ts`, which **never runs**: `package.json:23` invokes
`playwright test`, and `playwright.config.ts:7` scopes to `./tests`. The settlement logic it
covers is the most intricate thing being ported. §14 requires it be re-expressed as a Pest
test **before** the Drizzle version is deleted, so there is at least one behavioural anchor.

## §9.5 Route handlers — 20 files

All 20 are covered by §5.3's ledger. They are deleted, not edited. Nothing in `./web`
retains a `src/app/api/` handler that touches a database — the two survivors
(`revalidate/`, `csp-report/`, §7.8) never did.

## §9.6 Scripts

| Script | Disposition |
| --- | --- |
| `scripts/seed-mariadb.ts` (14 Drizzle calls) | **Deleted.** Replaced by Laravel seeders (§4.7) |
| `scripts/create-admin-users.ts` (3 Drizzle calls) | **Deleted.** Replaced by a role-aware seeder (A4). `ADMIN_DEFAULT_PASSWORD` disappears with it |
| `scripts/setup-jeko-africa.js` | Reads/writes env files, no database. **Moves to `./api`** or is replaced by `php artisan` config — B12 puts Jeko in Laravel |
| `scripts/reorganize-admin-tabs.mjs` | A one-shot codemod against `src/app/admin/AdminDashboard.tsx` (`:6`). That file is deleted by B2. **Delete the script** |

`package.json:22,27-29` lose four entries: `setup:admin`, `db:generate`, `db:migrate`,
`db:seed`. Their Laravel equivalents are `php artisan migrate`, `php artisan db:seed`.

## §9.7 Dependencies

| Package | Where | Action |
| --- | --- | --- |
| `drizzle-orm` `^0.45.2` | `package.json:35` | Remove |
| `drizzle-kit` `^0.31.10` | `package.json:53` | Remove |
| `mysql2` `^3.23.4` | `package.json:38` | Remove — sole importer is `src/shared/db/index.ts:2`. Also drop `serverExternalPackages: ['mysql2']` at `next.config.ts:12` |
| `bcryptjs` `^3.0.3` | `package.json:34` | Remove — sole importer is `src/shared/auth/auth.service.ts:2`; hashing moves to Laravel's `Hash` facade |
| `dotenv-cli` `^11.0.0` | `package.json:52` | Remove — only used by the three deleted `dotenv -e .env.local` scripts |
| `@upstash/ratelimit` `^2.0.8`, `@upstash/redis` `^1.38.2` | `package.json:32-33` | Remove (B11). C4 replaces the guard with `rate-limiter-flexible` in middleware (§7.8); `src/shared/http/rate-limit.guard.ts` is rewritten, not deleted |
| `jose` `^6.2.10` | `package.json:37` | Remove — **zero imports anywhere**. Dead before this migration started |
| `@types/bun` `^1.4.0` | `package.json:47` | Remove — the repo migrated off Bun at `b7d95d0`; nothing imports Bun types |

`jose` and `@types/bun` are not R6 items. They are listed because this is the commit where
`package.json` is rewritten, and leaving verified-dead dependencies in place while
performing a dependency cleanup is worse than removing them. Flagged rather than assumed —
if you want strict scope discipline, drop these two rows.

## §9.8 `pnpm-workspace.yaml` — the file exists because of Drizzle

Its 29 lines are almost entirely one argument, stated at `:6-12`: `esbuild`'s postinstall
fails with `EACCES` on the host, and **esbuild arrives only via `drizzle-kit`**. Remove
drizzle-kit and the entire `allowBuilds.esbuild: false` rationale evaporates.

**C5 supersedes B7's "delete": the file is kept and moved to `./web`.** That is the right
call — pnpm reads these settings from `pnpm-workspace.yaml` and nowhere else
(`pnpm-workspace.yaml:1-2`), so a standalone `./web` still needs one. What changes is its
contents, because two of its four blocks exist only because of Drizzle:

| Entry | Line | Disposition in `web/pnpm-workspace.yaml` |
| --- | --- | --- |
| `allowBuilds: sharp: true` | `:16` | **Keep.** Next's image optimiser needs sharp's postinstall; losing it breaks image processing at build time |
| `allowBuilds: unrs-resolver: true` | `:17` | **Keep.** Required by the eslint/next resolver chain |
| `allowBuilds: esbuild: false` | `:15` | **Drop.** esbuild arrives only via `drizzle-kit`; with §9.7 done, nothing pulls it in |
| `minimumReleaseAgeExclude: mysql2@3.23.4` | `:21-22` | **Drop.** §9.7 removes mysql2 |
| `onlyBuiltDependencies` / `ignoredBuiltDependencies` | `:25-29` | pnpm 10 duplicates of the `allowBuilds` block; same treatment, entry for entry |

The whole 12-line comment header (`:1-12`) goes with the esbuild entry — it is an argument
about drizzle-kit and becomes false the moment §9.7 lands. Replace it with one line naming
why `sharp` and `unrs-resolver` are listed.

Dropping the file entirely — B7's original reading — reintroduces `ERR_PNPM_IGNORED_BUILDS`,
which `:7` records as a past deployment failure.

## §9.9 Ordering — R6 is the point of no return

Drizzle is the only thing serving data today. The deletion order that does not break the
site:

1. `./api` answers every endpoint in §5.2 against a migrated schema (§4). Verified by §14.
2. `./web` is rewired to `./api` (§7) — all 32 W1 sites, all 16 W2 imports.
3. `./web` runs correctly with the Drizzle code still present but unreached.
4. **Only then** delete §9.3–§9.7.

Step 3 is the checkpoint. If `./web` still works with `src/shared/db/` present but no longer
imported, the deletion is mechanical. Verify with a build, not by reading:

```sh
# In ./web, after step 2 — must return zero
grep -rn "from '@/shared/db'\|from 'drizzle-orm" src scripts
```

Skipping step 3 and deleting in parallel with the rewiring is how this migration produces a
week of unattributable breakage. B13's big-bang cutover applies to *deployment*, not to the
edit order inside the branch.

## §9.10 Verification

```sh
test ! -d drizzle
test ! -f drizzle.config.ts
test ! -d src/shared/db
grep -c "drizzle" package.json          # → 0
grep -rn "drizzle" web/src | wc -l      # → 0
```

## §9.11 UNKNOWNs introduced by this section

| # | Question | Resolution |
| --- | --- | --- |
| — | Whether `jose` and `@types/bun` are removed in this commit (§9.7) | Style call; recommendation is yes |
