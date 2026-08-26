# §13 Risk register

Ordered by expected cost, not by likelihood. Each row names the phase it threatens and the
evidence it is drawn from. Risks with no citation are not listed — speculation is not a risk
register.

## §13.1 Severe

### R-1 — There is no rollback

**Phase:** P8 · **Evidence:** A2, B13

A2 discards the production database; B13 is a big-bang cutover. Together these remove the
possibility of reverting. Redeploying `main` after a failed cutover points the old Drizzle
code at a database that no longer has `site_config`, `jeko_transactions`, or the `users.role`
column it reads at `src/shared/auth/auth.service.ts:124`.

**Mitigation.** Take a full `mysqldump` of the production database before P8 and store it
outside the repository. It cannot be restored *into* the new schema, but it is the only
thing that makes a same-day revert possible at all. Confirm the dump restores into a scratch
database before starting P8 — an untested backup is not a backup.

**Residual.** Any order placed between cutover and revert is lost. Cut over at the lowest
traffic hour.

### R-2 — The catalogue fallback masks a dead API

**Phase:** P6 · **Evidence:** `src/features/catalog/product.query.ts:38-46,56`,
`src/features/site-config/site-config.util.ts:15,17`

Both modules catch every fetch failure and return hardcoded constants. In-process against
Drizzle this path was nearly unreachable. Against a separate host it becomes the normal path
during any API outage or CORS misconfiguration — the storefront renders a plausible
catalogue with stale prices, no error, no alert, and no log.

This is the failure mode most likely to run for days unnoticed.

**Mitigation.** §7.6 deletes both fallbacks in the same commit that rewires the call sites.
Replace with an error boundary that fails visibly. Do not defer this to "after cutover".

### R-3 — CSP blocks every rewired call

**Phase:** P6 · **Evidence:** `next.config.ts:178`

`connect-src 'self' https://*.supabase.co wss://*.supabase.co …` does not include
`https://api.sdcosmetique.ci`. Every call from §7.2's client is blocked by the browser the
moment the front end points at the new origin. Symptom: total front-end failure with nothing
in the server logs, because the request never leaves the browser.

**Mitigation.** §12.7 step 5 pins the CSP edit to the same commit as the rewiring. Verify in
a real browser with the console open, not with curl — curl ignores CSP entirely.

### R-4 — The Jeko webhook is not repointed

**Phase:** P8 · **Evidence:** `src/app/api/jeko-pay/webhook/route.ts`, C6, C8, B12

The payment webhook receiver moves to a new host. Reconfiguring it happens in Jeko's
dashboard, outside this repository, by whoever holds that account. If it is missed,
checkout appears to work and payments silently never settle. The discovery mechanism is a
customer complaint.

**Mitigation.** C6's plan: register the new URL before the switch, keep the old endpoint
alive 48 h, confirm settlement on a real order within the hour. Assign the owner in P0, not
P8.

**Two sharp edges in that plan.** The 48 h proxy must forward the **raw body byte-for-byte**
— signatures are computed over those exact bytes, and re-serialising parsed JSON invalidates
every one of them. And the URL is **`https://api.sdcosmetique.ci/webhooks/jeko-pay`** — no
`/v1`, no `/api`, per C8 (§3.5b). A third party hardcodes this value; changing it later is a
coordinated change, not an edit, so confirm it against the deployed route list before
registering it.

## §13.2 High

### R-5 — No parity harness exists

**Phase:** P5, P6 · **Evidence:** `package.json:23`, `playwright.config.ts:7`,
`.github/workflows/deploy.yml` (0 bytes)

There are effectively zero tests. `tests/` holds five Playwright UI and accessibility audits.
The one unit test, `src/features/payment/payment-settlement.test.ts`, never executes:
`package.json:23` runs `playwright test` and `playwright.config.ts:7` scopes to `./tests`.

So nothing can confirm that a Laravel endpoint returns what the Drizzle route returned. Every
one of §5.3's 20 ported routes must be checked by hand.

**Mitigation.** §12.6 requires the settlement logic be re-expressed as a Pest test before its
original is deleted. Beyond that, accept that P6's verification is manual and budget for it —
§14.3 is the checklist. Do not let this become an argument for building a test framework;
§15 keeps that out of scope.

### R-6 — Caching semantics invert

**Phase:** P6 · **Evidence:** §7.4, `src/app/page.tsx:14-17`

Sixteen server-component imports (§7.4's W2 class) run Drizzle during render today, which makes those pages
implicitly dynamic. As `fetch` calls they are cached by Next by default. Prices and stock
will go stale, and the staleness window is invisible until a customer sees a wrong price.

**Mitigation.** Every W2 call carries an explicit `next: { revalidate, tags }`. §7.8's
revalidation flow — `./api` calling `./web`'s surviving `/api/revalidate` endpoint from a
model observer — is what makes the tags meaningful. Test it by editing a product in Filament
and watching the storefront.

### R-7 — Sanctum SPA mode has three settings and fails silently on any one

**Phase:** P3 · **Evidence:** §7.10, C1

`SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, and `config/cors.php:supports_credentials` must
all be right. Any one wrong and authentication fails in a way that looks like a 401 from
application code. The whole mode also depends on `sdcosmetique.ci` and
`api.sdcosmetique.ci` sharing a registrable apex — if `./api` is ever hosted elsewhere, C1
must flip to API tokens and §7.2 changes shape.

**Mitigation.** §12.4 requires the auth check be done from a browser at the real front-end
origin. Curl will pass while the browser fails.

### R-8 — `settings` is a new table with no specification behind it

**Phase:** P4 · **Evidence:** C3, `src/shared/db/schema.ts:152`, `trash/notes.md:6-16`

C3 resolves where site config goes — one `settings` table — and unblocks the nine §7.3 call
sites, the five §7.4 server components, and the six Filament tabs that were waiting on it.

What remains: `settings` appears in **no** schema specification. It is not in
`docs/db-schema/target-schema.md`; §4.9 defines it from scratch. Every other table in §4 was
translated from something written down, so this one carries the errors nobody else can catch
by comparison.

**Mitigation.** Seed `settings` from the live `site_config` rows before P4 closes, and check
the key set against the nine call sites in §7.3. A missing key surfaces as a hero image that
does not render — visible, but only if someone looks at that page.

## §13.3 Moderate

### R-9 — `git mv` recorded as delete-plus-add

**Phase:** P1 · **Evidence:** R3

R3 requires history to survive. Moving files in two commits, or moving them with `mv` instead
of `git mv`, breaks `git log --follow` for the whole application.

**Mitigation.** §12.2's verification runs `git log --follow` on a moved file and requires
more than one line. Cheap to check, cheap to redo immediately, expensive to fix later.

### R-10 — Root `.gitignore` collapse leaks a secret

**Phase:** P1 · **Evidence:** `.gitignore:28-34`, §11.3

Seven env patterns collapse to `.env`, `.env.*`, `!.env.example`. R10 requires `.env.prod`
stay ignored. The negation line is the risk: a mistake there makes secrets committable, and
the change looks obviously correct on review.

**Mitigation.** §11.6's `git check-ignore -v` block, run before the next `git add`.

### R-11 — Anchored ignore patterns silently stop matching

**Phase:** P1 · **Evidence:** `.gitignore:48-52`

`/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`,
`/.playwright-mcp/` are root-anchored. After R3 the artefacts land in `web/` and stop
matching. Test output starts getting committed with no error.

**Mitigation.** §11.5 drops the anchors inside `web/.gitignore`.

### R-12 — Deleting `pnpm-workspace.yaml` breaks the build

**Phase:** P6 · **Evidence:** `pnpm-workspace.yaml:6-12,16-17`, C5

B7 deletes the file. Its `esbuild: false` rationale does evaporate with drizzle-kit, but
`sharp: true` and `unrs-resolver: true` are unrelated to Drizzle and load-bearing — `:7`
records `ERR_PNPM_IGNORED_BUILDS` as a past deployment failure.

**Mitigation.** C5 keeps the file and moves it to `./web`, stripped of its drizzle-era
entries. See §9.8.

### R-13 — The middleware limiter never runs on the routes it protects

**Phase:** P6 · **Evidence:** `middleware.ts:57`, `src/app/api/revalidate/route.ts:23-28`, C4

C4 moves rate limiting for the two surviving `./web` routes into Next middleware. But
`middleware.ts:57` excludes `/api` from the matcher outright. If the matcher is not narrowed
to admit `/api/revalidate` and `/api/csp-report`, the limiter is installed, appears correct
on review, and protects nothing — while `REVALIDATE_SECRET` becomes brute-forceable.

**Mitigation.** §7.8. Test it by firing 15 requests at `/api/revalidate` with a wrong secret
and confirming a 429, not by reading the matcher.

### R-14 — Media URLs break

**Phase:** P5, P6 · **Evidence:** `src/app/api/upload/route.ts:75-81`,
`next.config.ts:78,177`, C12

Uploads write to `public/uploads/` today — a directory that does not yet exist, so zero files
are stored and there is nothing to migrate. But §1's layout puts `./api` on a different host,
so `./web` can no longer serve `/uploads/...`. Both the CSP `img-src` and Next's
`remotePatterns` need the new origin, and `image.input.tsx:40` is the one call site whose
response shape changes.

**Mitigation.** C12 answers it: `Storage::disk('public')`, `php artisan storage:link`, served
from `https://api.sdcosmetique.ci/storage/…`. That origin must reach `next.config.ts:78`
(`remotePatterns`) and `:177` (`img-src`) in the same commit as the rewiring. That the store
is empty today makes this cheap now and expensive after launch.

### R-21 — `:memory:` tests pass while MariaDB queries fail

**Phase:** P4, P5 · **Evidence:** C2, `src/shared/db/schema.ts:36-38,43`

C2 runs Pest against SQLite `:memory:`. Four `json` columns on `products` become text in
SQLite, and `whereJsonContains` behaves differently there than in MariaDB. SQLite is also
more permissive about types and some constraint violations. A fully green suite therefore
does not prove the queries work in production.

Narrower than it sounds — §4.3 makes money integer minor units, so the classic decimal trap
is absent; only `products.rating` (`:39`) is a decimal, and harmlessly so.

**Mitigation.** §14.2 — run `DB_CONNECTION=mariadb php artisan migrate:fresh --seed` once at
STOP 3 and once at STOP 4. That catches schema-level divergence without slowing the test
loop.

## §13.4 Low, but worth naming

| # | Risk | Evidence |
| --- | --- | --- |
| R-15 | `engines.node: ">=20.0.0"` (`package.json:6`) contradicts `.nvmrc` = 24. Harmless today; becomes a deploy-time surprise if the host reads either | `package.json:6` |
| R-16 | `bin/deploy.sh:65` copies `.env.production`, a file that **does not exist**. The deploy script has a broken step today, before any migration | `bin/deploy.sh:65` |
| R-17 | `bin/deploy.sh:18` runs `npm run build` while `AGENTS.md:46` mandates pnpm | `bin/deploy.sh:18` |
| R-18 | `ecosystem.config.js:7` and `bin/deploy.sh:9` name different servers. C7 puts deployment outside the migration, so the contradiction ships untouched — by design, to be resolved during the first hand-deploy | both |
| R-19 | `middleware.ts:31-32` checks cookie presence without validation. Not a regression — it is equally weak today — but it must not be mistaken for an authorisation boundary during the rewrite | `middleware.ts:31-32` |
| R-20 | ~~`notifications` name collision~~ — resolved by C13; the domain table is `notification_logs` | C13 |
| R-22 | `settings.is_public` (C3) is what keeps admin-only config off the public endpoint. `config/full/route.ts:6` makes that distinction today via `requireAdmin()`; if the flag is dropped, the distinction is lost silently | §4.9 |

## §13.5 Risks explicitly not carried

- **Data loss during migration.** A2 removed the migration. There is no ETL to get wrong.
- **Supabase regression.** §8.1 verified zero Supabase code paths remain. Deleting dead files
  cannot break a runtime.
- **Dependency conflicts in `./web`.** The dependency set shrinks; nothing is added.
