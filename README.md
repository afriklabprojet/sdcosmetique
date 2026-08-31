# SD Cosmétique

Premium cosmetics storefront for melanin-rich skin. Two apps, one repository:
the Laravel API owns data and sessions; the Next.js app owns the storefront and
the admin UI.

## Layout

| Path | Role | Toolchain |
| --- | --- | --- |
| [`./api`](api/README.md) | Laravel 13 JSON API (Sanctum SPA-cookie + Fortify). SQLite in development, MariaDB in production. | Composer, artisan |
| [`./web`](web/README.md) | Next.js 16 storefront + `/admin`. No database client. | pnpm |
| [`./docs`](docs/milestones/README.md) | Migration milestones and schema notes. | — |

`./web` never talks to a database. Every read and write goes through `./api`
over HTTP (`NEXT_PUBLIC_API_URL`). Admin writes hit `/api/admin/*` and are
gated by an active `admins` row, not an env allow-list.

## Local development

Run both apps. Browse the storefront as **`http://localhost:3000`** (not
`127.0.0.1`) so the Sanctum session cookie (`SESSION_DOMAIN=localhost`) is
visible to the browser.

```bash
# API
cd api
cp .env.example .env   # then php artisan key:generate
php artisan migrate --seed
php artisan serve      # http://127.0.0.1:8000

# Storefront (second terminal)
cd web
cp .env.example .env   # NEXT_PUBLIC_API_URL + REVALIDATE_SECRET
pnpm install
pnpm dev               # http://localhost:3000
```

`WEB_REVALIDATE_SECRET` in `api/.env` must match `REVALIDATE_SECRET` in
`web/.env`. Seeded admin: `admin@ka.ci` / `password`.

## Tests

```bash
cd api && php artisan test    # Pest
cd web && pnpm build          # production build (API must be up for prerender)
```

Customer-facing copy is French. Identifiers, comments, and docs in this repo
are English.
