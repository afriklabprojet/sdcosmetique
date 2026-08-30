# M1 — Copy the API baseline

**Objective:** replace the empty Laravel scaffold at `./api` with the implemented
`../ka-cosmetics/api` and prove the copied test suite green in this repo.

**Depends on:** nothing. **Priority:** 1 — KA spine.

## Tasks

1. Move the current `./api` (untracked fresh scaffold with a stray
   `app/Providers/Filament/AdminadminPanelProvider.php`) to `trash/ka-pivot/api-scaffold/`.
2. Copy `../ka-cosmetics/api` → `./api`, excluding:
   - `vendor/`, `node_modules/` (reinstalled),
   - `graft/` (belongs to the KA repo),
   - `.env` (never copy credentials; recreate from `.env.example`),
   - `database/database.sqlite` (KA data),
   - `storage/` runtime files — keep the directory skeleton and `.gitignore` stubs,
   - `bootstrap/cache/*.php` (host-specific compiled state),
   - `web/` (an empty `web/v1/` placeholder with no code references).
   `../ka-cosmetics` is left untouched — this is a copy, not a move.
3. Rebrand minimally:
   - `composer.json` → `"name": "sdcosmetique/api"`,
   - `.env` from `.env.example`: `APP_NAME`, `APP_URL=http://localhost:8000`,
     `FRONTEND_URL` → the Next dev origin, SQLite database (B3),
     `SANCTUM_STATEFUL_DOMAINS`/`SESSION_DOMAIN` for local dev.
   - Leave KA-branded seeder content alone for now; catalog content is client data, replaced
     at seed time, and is not a blocker for the spine.
4. Install and verify:
   - `composer install`
   - `php artisan key:generate`
   - `php artisan migrate:fresh --seed`
   - `./vendor/bin/pest` — the full copied suite (~31 files) must pass unmodified.
5. Confirm `.gitignore` coverage: `api/.env` ignored, `api/.env.example` tracked, `vendor/`
   ignored (the copied `api/.gitignore` should already do this — verify with
   `git check-ignore`).

## Definition of Done

- `php artisan --version` reports Laravel 13.x from `./api`.
- Full Pest suite green with zero source modifications (proves the copy is faithful).
- `git status` shows `api/` as clean tracked additions, no env file staged.
- The API boots and `GET /api/ping` answers.

## References

- Source project: `/home/llyam/lab/dev/clients/ka-cosmetics/api`
- KA route entry: `api/bootstrap/app.php` → `routes/api/index.php` (default `/api` prefix)
- Old scaffold rule R2 (overridden): archived `trash/ka-pivot/implementation-plan/03-scaffolding.md`
