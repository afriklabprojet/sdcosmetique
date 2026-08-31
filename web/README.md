# SD Cosmétique storefront

Next.js 16 App Router. Serves the public boutique and the admin UI at
`/admin`. **No database access** — no driver, no ORM, no credentials. Every
read and write goes through the Laravel API (`NEXT_PUBLIC_API_URL`).

The only surviving Next route handlers are `src/app/api/revalidate/route.ts`
and `src/app/api/csp-report/route.ts`. Middleware rate-limits those two.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Never run `pnpm` from the repository root.

## Env

See `.env.example`. Runtime needs:

- `NEXT_PUBLIC_API_URL` — Laravel origin + `/api` (e.g. `http://localhost:8000/api`)
- `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_NAME`
- `REVALIDATE_SECRET` — must match `api/.env` `WEB_REVALIDATE_SECRET`

Browse as `http://localhost:3000`, not `127.0.0.1:3000`, so the Sanctum cookie
set for `SESSION_DOMAIN=localhost` is sent.

`pnpm build` prerenders catalog pages and needs the API running.
