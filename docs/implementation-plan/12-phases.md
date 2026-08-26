# §12 Execution phases with STOP gates

Nine phases. Four carry a hard stop — nothing in the following phase starts until the gate
is cleared. The gates are placed where a wrong answer becomes expensive to reverse, not at
even intervals.

B13 locks a **big-bang cutover on a branch named `migration-laravel`**. That governs
deployment only. Inside the branch the order below is strict, and §9.9 explains why the one
place it must not be violated is the Drizzle deletion.

## §12.0 Phase map

| Phase | Name | Delivers | Blocked by | Gate |
| --- | --- | --- | --- | --- |
| **P0** | Preparation | Branch, decisions, backups | — | **STOP 1** |
| **P1** | Repository restructure | `./web` exists, history preserved (R3, R11) | — | — |
| **P2** | Laravel scaffolding | `./api` exists via Composer (R2) | — | **STOP 2** |
| **P3** | Identity and auth | `users`, `roles`, `role_user`, Sanctum SPA cookies (A3, A4, C1) | — | — |
| **P4** | Domain schema | 43 tables (§4.2) incl. `settings`, `shipping_zones`, `notification_logs` | — | **STOP 3** |
| **P5** | `./api` application layer | Controllers, resources, policies, Filament (§5, §6) | — | — |
| **P6** | `./web` cutover | Rewiring (§7), Drizzle removal (§9) | — | **STOP 4** |
| **P7** | Cleanup | Supabase (§8), `AGENTS.md` (§10), env, READMEs | — | — |
| **P8** | Handover | Verified branch, ready to deploy by hand (C7) | — | — |

---

## §12.1 P0 — Preparation

1. Answer the eleven open questions in §0.2, §7.11, and §9.11.
2. Cut `migration-laravel` from `main`.
3. Commit the working tree first. `git status` currently shows seven modified or deleted
   paths (`.mcp.json`, `AGENTS.md`, `opencode.json`, `package.json`, `pnpm-lock.yaml`,
   `todo.md`, plus two untracked `docs/` directories). Starting a restructure on a dirty
   tree makes `git mv` unreadable in review.
4. Copy `drizzle/0000_previous_freak.sql` to `trash/` (§9.2). A2 says the production
   database is discarded; this file is the only machine-readable record of what it looked
   like.
5. Confirm PHP and Composer are installed at the versions §2.1 verified.

### STOP 1

**Do not create `./web` or `./api` until every question in §0.2 has an answer.**

**All of them are answered** — B1–B13 and C1–C13 in §0.1. Nothing in §0.2 is outstanding.

What remains at this gate is confirmation rather than decision: that the working tree is
committed, that the branch is cut, and that PHP and Composer match §2.1. Three details are
deliberately deferred to the moment they are read — Laravel's shipped `.gitignore` (§11.4),
the Next middleware runtime (§7.8), and whether `shipping_zones` needs one row or two per
zone (§4.10). None gates the start.

---

## §12.2 P1 — Repository restructure (R3, R11)

R3 requires git history to survive the move. That means `git mv`, one commit, no
intermediate deletion.

```sh
mkdir web
git mv src public tests scripts bin \
       package.json pnpm-lock.yaml tsconfig.json next.config.ts \
       middleware.ts server.js ecosystem.config.js playwright.config.ts \
       postcss.config.mjs eslint.config.mjs .nvmrc \
       web/
git commit -m "refactor: move the Next.js application to ./web"
```

**Verify the exact top-level inventory before running this.** The list above is derived from
§1.3 and must be re-read at execution time — a file added between planning and execution
would be silently left at the root.

What stays at the root, per R4: `docs/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`,
`.ignore`, `.env.prod`, `trash/`, `graft/`, `.git/`.

Then write the root and `web/` `.gitignore` files (§11.3, §11.5) in the same phase, so the
first commit after the move already has correct ignore rules.

**Verification.**

```sh
git log --follow --oneline web/src/shared/db/schema.ts | wc -l   # > 1
git status --porcelain                                            # clean
cd web && pnpm install && pnpm build                              # still builds
```

The `--follow` check is the one that proves R3. If it returns 1, the move was recorded as a
delete-plus-add and the history is gone; reset and redo.

`./web` still runs on Drizzle at the end of this phase. That is intended — nothing is broken
yet.

---

## §12.3 P2 — Laravel scaffolding (R2)

Follow §3 exactly. R2 forbids hand-scaffolding and forbids copying from another Laravel
project.

```sh
composer create-project laravel/laravel api
```

Then §3.3 sets the package identity, §3.4 installs Sanctum and Filament, §3.5 sets the `v1`
prefix, §3.6 configures the database.

**Read `api/.gitignore` as shipped** and apply §11.4's additions. Do not assume its
contents.

### STOP 2

**Do not write a migration until the scaffold is verified.**

- `cd api && php artisan --version` reports Laravel 13.x
- `php artisan test` passes on the untouched skeleton
- `composer.json` shows `sdcosmetique/api` (B4)
- `git check-ignore -v api/.env` prints a rule; `api/.env.example` prints nothing (§11.6)

This gate is cheap and catches the expensive failure: a scaffold created with the wrong PHP
version or the wrong Laravel minor, discovered forty migrations later.

---

## §12.4 P3 — Identity and auth

Delivers A3's three-way identity split and A4's RBAC.

1. Migrations: `users` (reshaped — no `role` column, A4), `roles`, `role_user` with a
   composite primary key, `clients`, `sessions`. No `personal_access_tokens` — C1 is cookie
   mode, not tokens.
2. Models with `belongsToMany`, `hasRole()`, `isAdmin()`.
3. Sanctum in SPA cookie mode (C1): `SANCTUM_STATEFUL_DOMAINS`,
   `SESSION_DOMAIN`, and `config/cors.php` per §7.10.
4. `SessionController`, `RegistrationController`, `PasswordResetController` (§5.2).
5. A role seeder creating the five roles from A4.

`users.prenom` / `nom` / `telephone` (`src/shared/db/schema.ts:11-13`) become
`first_name` / `last_name` / `phone` — French identifiers violate `AGENTS.md:60-64` and this
is the phase that fixes them.

**Verification.** A user can register, log in, and hit an `auth:sanctum` route with a cookie
issued by `./api`. Test it from a browser at the real front-end origin, not with curl — CORS
and `SameSite` failures only appear cross-origin.

---

## §12.5 P4 — Domain schema

The remaining tables from §4, their models, and §4.7's seeders.

Order matters: §4.6 sets the migration sequence, and the framework-table collisions in §4.5
(notably C13's rename of the domain `notifications` table to `notification_logs`) have to be settled before the first
`php artisan migrate` runs, not after.

A1's `order_adjustments` and its `order_id` index land here, along with the rule that
`orders.total` is recomputed on every adjustment write.

### STOP 3

**Do not write a controller until the schema is final and seeded.**

- `php artisan migrate:fresh --seed` runs clean from an empty database
- The table count matches §4.2's ledger
- §4.2's 43 tables all exist, including the four this plan defines alone —
  `settings` (§4.9), `shipping_zones` (§4.10), `testimonials`, `newsletter_subscribers`.
  Those four have no written spec to check against, so check them against their call sites
  in §7.3 instead

---

## §12.6 P5 — `./api` application layer

Two bodies of work against the same models, both delivered here because both depend only on
P4 and neither depends on the other.

**§5 — the JSON API.** Twenty controllers, restricted to the seven CRUDdy actions (§5.1).
Form Requests for validation, API Resources for serialisation, Policies for authorisation
(§5.5). The third-party integrations move here per B12: Resend as Mail, WhatsApp Cloud API
and Jeko Pay as HTTP clients, reconciliation as a scheduled command.

**§6 — the Filament admin office.** The panel, its resources, and the actions that replace
the thirteen deleted admin route handlers.

Two items need naming because they are easy to lose:

- `payment-settlement.service.ts` must be re-expressed as a Pest test **before** its Drizzle
  original is deleted in P6 (§9.4). It is the only unit test in the repository and it covers
  the most intricate logic being ported.
- `MediaController` uses `Storage::disk('public')` with `php artisan storage:link` (C12).
  The same decision fixes `next.config.ts:78,177` in P6 — media is served from
  `https://api.sdcosmetique.ci/storage/…`.

**Verification.** Every endpoint in §5.2 answers with the right shape, exercised against the
seeded database. This is the parity harness §14 needs, and it does not exist today —
`.github/workflows/deploy.yml` is 0 bytes and `tests/` holds five Playwright UI audits.

---

## §12.7 P6 — `./web` cutover

The riskiest phase. §9.9 gives the order and it is not negotiable:

1. Rewire §7's call sites — all 32 W1 sites, all 16 W2 imports, `compte/actions.ts`.
2. Delete the hardcoded fallbacks (§7.6). Across a network boundary they turn an API outage
   into a silently wrong catalogue.
3. Delete `src/app/admin/**` and the four admin files holding §7.3's 14 deleted call sites.
4. Rewrite `middleware.ts` (§7.7).
5. Edit `next.config.ts` CSP (§8.4) — add `https://api.sdcosmetique.ci` to `connect-src`
   and the media origin to `img-src`. **Both must land in the same commit as step 1**, or
   every rewired call is blocked by CSP.
6. **Confirm `./web` works end to end with Drizzle still present but unreached.**
7. Only then delete §9.3–§9.7 and move `pnpm-workspace.yaml` into `./web`, stripped of its
   drizzle-era entries (§9.8, C5).

Step 6 is the checkpoint that makes step 7 mechanical:

```sh
cd web && grep -rn "from '@/shared/db'\|from 'drizzle-orm" src scripts   # → zero
```

### STOP 4

**Do not proceed to cleanup until `./web` runs entirely on `./api`.**

Walk the storefront by hand: home, boutique, a category, a product, quiz, checkout,
confirmation, account. Nothing in the repository can do this for you — §14 explains why the
verification here is manual.

---

## §12.8 P7 — Cleanup

Everything that is inert once P6 lands.

1. §8 — delete `supabase/` (35 files), the two `docs/` SQL files (B10), and the eight stale
   comments. Note §8.5's warning: `ecosystem.config.js:12`'s comment is obsolete but the
   `--dns-result-order=ipv4first` flag it explains may not be.
2. §10 — rewrite `AGENTS.md`. Last, per §10.6, so it never describes directories that do not
   exist.
3. §11.6 — run the R10 verification block.
4. B6 — write `api/.env.example` and `web/.env.example` from §7.9's inventory.
5. B9 — three READMEs. The current root `README.md:10` still claims the database is Supabase.
6. `todo.md:5` — check off "clean the old supabase codes".
7. **C9** — `.env.prod` stays exactly where it is, git-ignored, read by nothing. `api/.env`
   and `web/.env` are written by hand. Nothing in this phase touches the blob, and no script
   is added to decrypt it.

---

## §12.9 P8 — Handover, not deployment

**C7 takes deployment out of the migration entirely.** No milestone covers it. The branch is
verified, merged, and handed over; the first production deploy is performed by hand,
deliberately, to learn the shape of it before any of it is automated. That is a sound call
here — `bin/deploy.sh:65` already copies a `.env.production` that does not exist, so the
existing automation is not a foundation worth extending blind.

So P8 delivers a **branch that is ready to deploy**, and nothing else:

1. §14.3's manual storefront walk passes against a local `./api` + `./web`.
2. `api/.env.example` and `web/.env.example` document every variable §7.9 inventories, so
   the person doing the deploy is not reverse-engineering it from code.
3. `api/.env.example` and `web/.env.example` are complete, since C9 means the hand-deploy
   fills the real files from them rather than from `.env.prod`.
4. The two items below are scheduled, with owners.

### Two things that must happen outside the repository

**C6 — the Jeko webhook.** The receiver moves to a new host. This is the only change in the
migration that a third party has to make, and its failure mode is silent: checkout keeps
working and payments stop settling.

| Step | When | Note |
| --- | --- | --- |
| Register `https://api.sdcosmetique.ci/webhooks/jeko-pay` with Jeko | **Before** the switch | Unversioned by design (C8, §3.5b) — it must not move when `/v1` does |
| Keep the old endpoint alive 48 h | From the switch | It survives as a raw-body proxy, not as the Drizzle handler §9.5 deletes. See §5.6 |
| Confirm settlement on a real order | Within the hour after | The only genuine test of the new endpoint |

Verify whether Jeko follows redirects on webhook delivery before relying on a 307 instead of
a proxy — if it does not, the proxy is mandatory.

**C7 — the manual deploy.** Nothing in this plan says where `./api` runs.
`bin/deploy.sh:7-9` targets Hostinger over rsync; `ecosystem.config.js:7` names
`/var/www/sd-cosmetique` under PM2; neither mentions PHP. Answering that is the first task
of the hand-deploy, not of this migration.

## §12.10 What this phase plan does not cover

- **Rollback.** A2 discards the production database and B13 is a big bang, so there is no
  rollback to a working state — only a redeploy of the old branch against a database that no
  longer matches it. §13 carries this as the top risk.
- **Data migration.** A2 removed it entirely.
- **Parallel running.** B13 chose against it.
- **Deployment.** C7 removed it. `bin/deploy.sh`, `ecosystem.config.js`, and `server.js` are
  moved by P1 and otherwise untouched — including their existing contradictions (§13 R-16
  to R-18), which ship as they are.
