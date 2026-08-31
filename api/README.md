# SD Cosmétique API

Laravel 13 JSON API copied from the KA cosmetics project, without Filament.
Modules live under `app/Modules/`. Storefront and admin clients in `../web`
call this app over HTTP.

## Stack

- PHP 8.5, Laravel 13, Pest
- Auth: Fortify + Sanctum SPA cookies (`FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`)
- SQLite in development (`DB_CONNECTION=sqlite`), MariaDB in production
- Public disk for media (`/storage/…`); observers POST `../web`'s `/api/revalidate`

## Commands

```bash
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan test
```

MariaDB compensating run (not the default Pest DB):

```bash
DB_CONNECTION=mariadb php artisan migrate:fresh --seed
```

## Env

See `.env.example`. The keys `web` must share are `FRONTEND_URL` (storefront
origin) and `WEB_REVALIDATE_SECRET` (must equal `web/.env` `REVALIDATE_SECRET`).
Jeko, CinetPay, Resend, and mail credentials live here — never in `../web`.

Admin JSON is under `/api/admin/*`. An active row in `admins` is required;
there is no Filament panel.
