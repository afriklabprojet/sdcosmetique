# §3 Scaffolding procedure (R2)

R2 is absolute: `./api` is created by `composer create-project`. It is never
hand-scaffolded, and no file is ever copied in from another Laravel project.

## §3.1 Preconditions

- On branch `migration-laravel` (B13), created from `main`, with a clean tree.
- `./api` does not exist. If it does, the run stops — Composer refuses a non-empty target,
  and forcing it defeats R2.
- PHP ≥ 8.5 and Composer 2.10.2 on `PATH` (§2.1).

## §3.2 Create the project

```bash
composer create-project laravel/laravel api
```

This resolves `laravel/laravel` v13.10.1 today (§2.3), which pins
`laravel/framework: ^13.17`. The installer generates `api/.env` from its own
`api/.env.example` and runs `php artisan key:generate`.

Verify before doing anything else:

```bash
cd api && php artisan --version && composer show laravel/framework | head -3
```

## §3.3 Set the package identity (B4)

`composer create-project` writes `"name": "laravel/laravel"`. Edit `api/composer.json`
to B4's exact values:

```json
{
    "name": "sdcosmetique/api",
    "require": {
        "php": "^8.5",
        "laravel/framework": "^13.0"
    }
}
```

Raising the `php` floor from the skeleton's `^8.3` to `^8.5` is a narrowing, so no
dependency needs re-resolution; run `composer update --lock` to refresh the content hash.

> **Note.** `"laravel/framework": "^13.0"` is looser than the skeleton's `^13.17`. Keep
> `^13.0` because B4 states it, but be aware the lock file will still hold 13.29.0 —
> the constraint is a floor, not a pin.

## §3.4 First-party packages

Installed by Composer, one command each, in this order.

| Package             | Command                                                       | Why                                    |
| ------------------- | ------------------------------------------------------------- | -------------------------------------- |
| Sanctum             | `php artisan install:api`                                     | B1. Installs `laravel/sanctum`, publishes the `personal_access_tokens` migration (`2019_12_14_000001_create_personal_access_tokens_table.php`), and creates `routes/api.php`. |
| Filament 5          | `composer require filament/filament:"^5.0"` then `php artisan filament:install --panels` | R5, B2. Pulls Livewire 4 (§2.3).       |
| Pest 5              | `composer require pestphp/pest --dev --with-all-dependencies` then `php artisan pest:install` | A5.                                    |

Filament's panel provider is generated at `api/app/Providers/Filament/AdminPanelProvider.php`
with `->path('admin')` — which is exactly B2's `api.sdcosmetique.ci/admin`. Do not change
the path.

## §3.5 Route prefix — `/v1`, and the one route that escapes it (B2, C8)

`install:api` registers `routes/api.php` under the `/api` prefix by default. B2 wants
`/v1`, on a host that is already `api.`, so `/api/v1/...` would stutter. In
`api/bootstrap/app.php`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'v1',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Result: `https://api.sdcosmetique.ci/v1/...` for JSON, `https://api.sdcosmetique.ci/admin`
for Filament, `https://api.sdcosmetique.ci/up` for the health check that replaces
`src/app/api/health/route.ts`.

## §3.6 Database configuration (B3)

Development is SQLite; production is MariaDB. The skeleton already defaults to SQLite and
creates `database/database.sqlite`, so development needs no change beyond keeping
`DB_CONNECTION=sqlite` in `api/.env`.

`api/.env.example` (B6) documents both, with production values left empty:

```
DB_CONNECTION=sqlite
# Production (MariaDB) — set DB_CONNECTION=mariadb and fill these:
# DB_HOST=
# DB_PORT=3306
# DB_DATABASE=
# DB_USERNAME=
# DB_PASSWORD=
```

The three renames from today's names are: `DB_USER` → `DB_USERNAME`,
`DB_NAME` → `DB_DATABASE`, and `DB_CONNECTION` is new. `DB_HOST`/`DB_PORT` keep their
names. Current consumers: `src/shared/db/index.ts:13-17` and `drizzle.config.ts:8-12`,
both deleted by §9.

Laravel 13 ships a `mariadb` connection driver distinct from `mysql`; use `mariadb`,
since §2.1 confirms the server is MariaDB 11.8.8 and not MySQL.

**Consequence to carry into §13:** every migration must emit DDL that both SQLite and
MariaDB accept. That rules out `ON UPDATE CURRENT_TIMESTAMP` and native `ENUM`, both of
which the target schema uses heavily. §4.3 handles it.

## §3.7 What `composer create-project` gives you that must then be reshaped

| Generated artefact                                                | Fate                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `database/migrations/0001_01_01_000000_create_users_table.php`     | Rewritten — creates `users`, `password_reset_tokens`, `sessions`; all three collide with the target schema. See §4.5. |
| `database/migrations/0001_01_01_000001_create_cache_table.php`     | Kept as-is (`cache`, `cache_locks`) — B11 uses it for rate limiting.  |
| `database/migrations/0001_01_01_000002_create_jobs_table.php`      | Kept as-is (`jobs`, `job_batches`, `failed_jobs`) — B12 queues notifications. |
| `app/Models/User.php`                                              | Rewritten for UUID keys, `HasApiTokens`, `roles()`, `isAdmin()`. §4.2 |
| `resources/views/welcome.blade.php`                                | Deleted — `./api` serves no marketing HTML.                           |
| `resources/js/`, `resources/css/`, `vite.config.js`, `package.json`| **Kept.** Filament 5 builds its panel assets through Vite. Do not delete these on the assumption that `./api` is headless — it is not, it hosts Filament. |
| `routes/web.php`                                                   | Reduced to nothing but Filament's own registration.                   |

## §3.8 Verification gate for this section

```bash
cd api
php artisan --version                 # Laravel Framework 13.x
php artisan about --only=environment  # PHP 8.5.x, driver sqlite
php artisan migrate                   # framework tables only, so far
php artisan test                      # Pest runs, 0 failures
```

Then open `http://127.0.0.1:8000/admin` after `php artisan serve` and confirm the Filament
login screen renders. Nothing beyond this point should start until it does.

### §3.5b The webhook is deliberately unversioned (C8)

C8 puts the JSON API under `/v1` and the Jeko receiver **outside it**, at
`api.sdcosmetique.ci/webhooks/jeko-pay`. That is the right split: a third party stores this
URL in their dashboard, so it must never move when the API version does — you cannot
coordinate a version bump with someone else's config.

It needs a second route file registered without the prefix:

```php
// bootstrap/app.php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'v1',
    then: function () {
        Route::middleware('api')            // no session, no CSRF
            ->group(base_path('routes/webhooks.php'));
    },
)
```

`routes/webhooks.php` holds one route (§5.2). Registering it on the `api` middleware group
rather than `web` is what keeps CSRF off it — a webhook has no session and no token.

**The exact string to give Jeko is `https://api.sdcosmetique.ci/webhooks/jeko-pay`.** No
`/v1`, no `/api`. Confirm it against the deployed route list before registering it, because
this is the one path in the system that an external party hardcodes.
