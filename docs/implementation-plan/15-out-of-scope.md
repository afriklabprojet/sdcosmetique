# §15 Recommended, not in scope

R5's scope discipline: none of the following is part of this migration. Each is one line,
with the evidence that prompted it. Doing any of them during the migration widens the blast
radius of a cutover that already has no rollback (R-1).

## Load-bearing enough to schedule immediately after

| # | Recommendation | Why | Evidence |
| --- | --- | --- | --- |
| N-1 | A CI workflow that runs `php artisan test` and `pnpm build` on push | `.github/workflows/deploy.yml` is 0 bytes; nothing has ever gated a merge | — |
| N-2 | Fix `bin/deploy.sh:65` — it copies `.env.production`, which does not exist | The deploy script has a broken step *today*, independent of this migration | `bin/deploy.sh:65` |
| N-3 | Reconcile `bin/deploy.sh:9` (Hostinger, `~/domains/sdcosmetique.ci/nodejs`) with `ecosystem.config.js:7` (PM2, `/var/www/sd-cosmetique`) | Two files describe different servers. C7 puts deployment outside the migration deliberately — this is the first thing the hand-deploy will run into | both |
| N-4 | Make `middleware.ts` validate the session rather than test cookie presence | `middleware.ts:31-32` checks presence only. Equally weak today, so not a regression — but it is a real gap that this migration walks past | `middleware.ts:31-32` |
| N-5 | Edge-level rate limiting for the two route handlers staying in `./web` | C4's middleware limiter is per-instance. Adequate for one Next process, not for several | §7.8 |

## Worth doing, no urgency

| # | Recommendation | Why | Evidence |
| --- | --- | --- | --- |
| N-6 | Vitest in `./web` with mocks and fixtures | A5 provides for it; nothing in this migration requires it | A5 |
| N-19 | A MariaDB-backed Pest run in CI, alongside C2's `:memory:` suite | C2 trades fidelity for speed; §13 R-21 names what that misses. A nightly MariaDB run would close it without slowing the loop | C2 |
| N-7 | Playwright E2E against the new stack | The five existing specs audit the admin UI that B2 deletes — they will all fail and be deleted with it, leaving zero E2E coverage | `tests/`, B2 |
| N-8 | Reconcile `engines.node: ">=20.0.0"` with `.nvmrc` = 24 | Harmless until a host reads one of them | `package.json:6` |
| N-9 | ~~Repoint `docs/scraping-products.schema.toml:3`~~ | **Moot.** D1 deleted the file | D1 |
| N-10 | ~~Decide whether `docs/mockups/*.html` belong at the root~~ | **Moot.** D1 deleted them, aligning `docs/` with R4 | D1, R4 |
| N-19b | Move `notification_logs.payload` and `payment_webhook_logs.payload`/`headers` to the Laravel log channel, keeping only the queryable columns in the row | Those two `json` columns grow fastest and are read only when debugging. Keeping `provider_id`, `status`, and the timestamps in the table preserves every query that matters. Not applied — the schema keeps the blobs | §4.11 |
| N-20 | Replace `audit_logs` (`target-schema.md:320`) with Spatie Activitylog, or drop it | It is append-only, nothing reads it in a hot path, and nothing in R1–R11 asks for it. The only argument for the hand-rolled table is that Filament can show it | `target-schema.md:320` |
| N-11 | An observability story for `./api` — logs, errors, uptime | Splitting one process into two doubles the places a failure can hide, and R-2's silent-failure mode has no alerting today | §13 R-2 |

## Explicitly declined

These would be reasonable in another context and are **not** recommended here.

| # | Not doing | Why not |
| --- | --- | --- |
| N-12 | Spatie Laravel-Permission | A4's `roles` + `role_user` is compatible with it but does not need it. Five roles and a `hasRole()` method do not justify a dependency, and the plan's `isAdmin()` is four lines |
| N-13 | A monorepo tool (Turborepo, Nx) | B7 makes `./web` standalone. Two projects with disjoint toolchains share nothing worth orchestrating |
| N-14 | A design system or component library extraction | Nothing in R1–R11 touches presentation. `./web`'s components move unchanged |
| N-15 | Performance work on the new API | There is no baseline to compare against (§14.1), so any tuning would be guesswork. Measure after cutover |
| N-16 | Porting the five Playwright admin specs to Filament | They audit a UI that ceases to exist. Rewriting them is new test authorship, not migration |
| N-17 | Keeping Upstash for `./web` alone | Contradicts B11, and C4 settled the question with a zero-dependency in-process limiter |
| N-18 | An `api`/`web` shared types package | Tempting once both sides speak JSON. It re-creates the coupling R9 exists to remove, and OpenAPI generation would serve the same need without a build-time link |
