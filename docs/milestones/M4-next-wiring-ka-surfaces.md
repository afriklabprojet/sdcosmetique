# M4 — Next wiring: KA-covered surfaces

**Objective:** connect `./web` to the API for everything the KA domain already models —
the shared API client, admin authentication, the KA-covered admin tabs, and the KA-covered
storefront call sites. This milestone completes the KA spine; the repo must be shippable in
this state.

**Depends on:** M3. **Priority:** 1 — KA spine.

## API client

Create `web/src/shared/api/client.ts` per [§7.2](../implementation-plan/07-web-rewiring.md):
the only file that knows `NEXT_PUBLIC_API_URL`, always `credentials: 'include'`, primes
`GET /sanctum/csrf-cookie` before mutating requests, sends `X-XSRF-TOKEN`, and throws on
errors — no silent fallbacks to hardcoded constants (§7.6).

## Admin auth cutover

- `web/src/app/admin/login/page.tsx`: csrf-cookie → Fortify `POST /login` →
  `GET /api/admin/session`; non-admin users get an explicit denial, not a redirect loop.
- `web/middleware.ts`: keep guarding `/admin/*` but check the Laravel session cookie instead
  of `sd_session`; presence-only redirect stays a UX convenience — real enforcement is the
  server-side `admin` middleware (M3).
- `requireAdmin()` in `web/src/shared/auth/` becomes a thin call to
  `GET /api/admin/session`; `ADMIN_EMAILS` handling is deleted.

## Admin tabs rewired in this milestone

From `web/src/features/admin/admin.view.tsx` tabs, the KA-backed ones:

| Tab | Endpoint(s) | Replaces |
| --- | --- | --- |
| commandes | `admin/orders`, `admin/orders/{id}` | `web/src/app/api/admin/orders/route.ts` (Drizzle) |
| produits | `admin/products`, `admin/media` | `web/src/app/api/admin/products/route.ts`, `product.repository.ts`, product parts of `admin-actions.ts` |
| categories | `admin/categories` | `category.repository.ts` server actions |
| clients | `admin/customers` | in-memory derivation from orders |
| newsletter | `admin/newsletter-subscriptions` | `GET /api/newsletter/list` |
| promos | `admin/coupons` | coupon slice of site-config actions |
| livraison | `admin/delivery-methods` | shipping slice of site-config actions |
| dashboard | `admin/metrics/*` | `admin-metrics.ts` Drizzle queries |

Delete each replaced Next route handler / repository in the same change as its rewire.
Tabs **not** in this table (hero, contenu, faq, legal, branding, marketing, paiement, quiz,
jeko, avis, temoignages) stay on Drizzle until M6 — do not stub or break them.

## Storefront call sites rewired in this milestone

From the [§7.3–§7.5 ledger](../implementation-plan/07-web-rewiring.md), the KA-covered
subset: products/categories reads (boutique, categorie, produit pages), cart/checkout
(`orders`, `payments`, KA's cart endpoints), auth (`sessions`/`registrations`/
`password-resets` via Fortify routes, `/compte` profile + addresses + orders), newsletter
subscribe, contact form. Settings-driven and quiz/loyalty call sites wait for M6.

## Definition of Done

- Admin login works end-to-end against Laravel; a revoked admin is denied.
- Every tab in the table above is fully functional against `/api/admin/*`; their old Next
  handlers and Drizzle repositories are deleted.
- KA-covered storefront journeys pass in a browser with a clean console: browse → product →
  cart → checkout → account.
- `pnpm build` succeeds; remaining Drizzle usage is exactly the M6 scope (verifiable by
  grep against the §7 ledger).
- This is the priority-1 gate: commit and leave the repo healthy here before starting M5.

## References

- Call-site ledger: [§7.1–§7.8](../implementation-plan/07-web-rewiring.md) — the 14 admin
  sites listed there as "deleted with admin UI" are rewired instead, per the pivot
- Env changes: [§7.9](../implementation-plan/07-web-rewiring.md) — add `NEXT_PUBLIC_API_URL`

## Execution (from `web/` inventory, 2026-08-30)

Grounded in the current tree. Do not start coding until this section is accepted.
§7 still describes Filament and `POST /sessions`; the live KA API uses Fortify
`POST /login` and `GET /api/session`. Prefer the live routes.

### Current shape of `./web`

- No API client exists. Browser calls are relative `fetch('/api/…')`; RSC and
  Server Actions import Drizzle repositories.
- Auth is first-party Next: `sd_session` httpOnly cookie, bcrypt users in MariaDB,
  `requireAdmin()` = `role === 'admin'` or `ADMIN_EMAILS`. Used from 20 files
  (admin page, leftover Next admin routes, `admin-actions.ts`).
- Admin login POSTs `/api/auth/login` then `location.href = '/admin'`. The client
  dashboard re-checks `/api/auth/me` and hydrates every tab in `initAfterAuth`
  (`admin.view.tsx`).
- Cart is `localStorage` (`sd-cosmetique-cart`). KA checkout is a server-side
  draft built from the Laravel cart — wiring checkout without the cart API will
  not work.
- `web/.env.example` has no `NEXT_PUBLIC_API_URL`. Laravel already has
  `FRONTEND_URL=http://localhost:3000` and `SANCTUM_STATEFUL_DOMAINS=localhost:3000`.

### Cross-origin cookie constraint (locks the auth design)

`localhost:3000` and `localhost:8000` are same-site but **not same-host**.
Laravel's `laravel_session` is host-only on `:8000`. Next middleware, RSC, and
Next route handlers on `:3000` never see it. Only browser `fetch` with
`credentials: 'include'` to the API origin sends it.

Therefore a literal `requireAdmin()` → `GET /api/admin/session` from a Next
server function cannot work, and leftover M6 routes that still call
`requireAdmin()` would all 401 if we delete `sd_session`.

**Mixed-state rule (do not break leftover tabs):**

1. Browser talks to Laravel directly (Sanctum SPA). That is the real admin gate.
2. Admin login also keeps creating `sd_session` via the existing Next
   `/api/auth/login`, so jeko / quiz / avis / site-config routes keep working.
3. `requireAdmin()` and `ADMIN_EMAILS` stay until M6 deletes those routes.
4. `web/middleware.ts` keeps checking `sd_session` for `/admin` and `/compte`
   presence-only redirects. Laravel's `admin` middleware is the real check on
   `/api/admin/*`.
5. Same admin email must exist in both DBs (Laravel `AdminSeeder` + current
   Next admin user). Document in `web/.env.example`.

This defers the milestone line "requireAdmin becomes a thin Laravel call" to
M6. The M4 login page itself is Fortify-first: csrf → `POST /login` →
`GET /api/admin/session` → deny non-admin → then Next `/api/auth/login` for
the leftover-tab session.

### Schema adapters (the real work)

Laravel JSON is not the Next `Product` / `OrderDraft` shape. Put mappers next
to the client; do not rewrite every tab to KA field names in this milestone.

| Next field | Laravel field | Notes |
| --- | --- | --- |
| `Product.name` | `title` | |
| `Product.price` / `originalPrice` | `price` / `compare_at_price` | integer minor units (XOF) on both sides today |
| `Product.category` (string slug) | nested `category.slug` | admin writes `category_id` |
| `Product.shortDescription` | `summary` | |
| `Product.newArrival` / `bestseller` | `recent` / `featured` | |
| `Product.skinTones`, `rating`, `benefits`, `lowStockThreshold` | — | no KA column; omit on write, default on read |
| `OrderDraft.orderNumber` | `reference` | |
| `OrderDraft.status` (`pending_payment`…) | `draft` / `placed` / `paid` / `shipped` / `delivered` / `cancelled` | map both ways; paid orders cannot be cancelled (API 422) |
| `OrderDraft.delivery.*` | `destination` object + `email` | |
| Clients tab | `GET /api/admin/customers` | replace in-memory derivation from orders |
| Promos tab | `admin/coupons` (`code`, `type`, `value`, `threshold`, …) | replace `siteConfig.promo_codes` |
| Livraison tab | `admin/delivery-methods` | replace `siteConfig.shipping` |

### Waves (commit after each)

**W1 — client + env (no UI change)**
- Add `web/src/shared/api/client.ts` (`api`, `apiMutate`, `ApiError`, csrf prime).
- Add `web/src/shared/api/mappers/{product,order,category,coupon,delivery,customer}.ts`.
- Add `NEXT_PUBLIC_API_URL=http://localhost:8000/api` to `web/.env.example`.
- Confirm Laravel CORS / Sanctum already allow `:3000`.

**W2 — admin login (dual session)**
- `admin/login/page.tsx`: Fortify path first, Next `/api/auth/login` second.
- `admin.view.tsx` `useEffect`: `GET /api/admin/session` (via client) instead of
  `/api/auth/me`. Keep leftover-tab hydration (reviews, jeko, quiz, site-config).
- Leave `requireAdmin()` and middleware on `sd_session`.

**W3 — admin KA tabs (one tab per change, delete the replaced Next handler with it)**

| Order | Tab | Client calls | Delete with the rewire |
| --- | --- | --- | --- |
| 1 | commandes | `GET/PATCH /admin/orders`, `POST /admin/orders/{id}/adjustments` | `web/src/app/api/admin/orders/route.ts` |
| 2 | produits | `admin/products` CRUD + `POST /admin/media` | `web/src/app/api/admin/products/route.ts`; product functions in `admin-actions.ts` |
| 3 | categories | `admin/categories` CRUD | `fetchAllCategoriesAdmin` / add / update / delete in `category.repository.ts` if nothing else imports them |
| 4 | clients | `admin/customers` | in-memory clients list in `admin.view.tsx` |
| 5 | newsletter (subs list only) | `admin/newsletter-subscriptions` | `web/src/app/api/newsletter/list/route.ts`. Copy block `saveConfigSection('newsletter', …)` stays on Drizzle |
| 6 | promos | `admin/coupons` | coupon writes in `PromosTab`; `siteConfig.promo_codes` left for marketing tab until M6 |
| 7 | livraison | `admin/delivery-methods` | shipping writes in `ShippingTab` |
| 8 | dashboard | `GET /admin/metrics/overview` | client-side totals in `admin-metrics.ts` that only the dashboard uses |

**W4 — storefront catalog (public, no cookie)**
- RSC pages (`page.tsx`, `boutique`, `categorie/[slug]`, `produit/[slug]`,
  `teint/[slug]`) call Laravel `GET /products` and `GET /categories` through a
  server helper that uses the same base URL (no credentials).
- `product.query.ts` browser fetchers use the API client; **delete the
  `PRODUCTS` fallback** (§7.6). Split `formatPrice` out so account pages can
  keep importing it.
- Delete `web/src/app/api/products/route.ts` and `products/[slug]/route.ts`
  once nothing relative-fetches them.

**W5 — storefront auth + account**
- `connexion` / `inscription` / `mot-de-passe-oublie` / `reset-password` → Fortify
  (`POST /login`, `POST /register`, `POST /forgot-password`, `POST /reset-password`).
- `/compte` profile, addresses, orders → `GET /api/session`, Accounts module
  (`/api/account`, `/api/account/addresses`, `/api/account/orders`). Password
  change → `PUT /user/password`.
- `web/middleware.ts` no longer gates `/compte` on `sd_session`: the Laravel
  session cookie is host-only on `:8000`, so the page self-gates via
  `GET /api/session`. Admin routes still use leftover `sd_session`.
- Next `/api/auth/{login,register,logout,me,profile,forgot-password}` stay
  until M6. Storefront login/register still best-effort mirror a Next session
  so leftover Jeko / newsletter tabs keep working when both DBs have the user.

**W6 — cart, checkout, payments**
- Replace `localStorage` cart with KA `/api/cart` (guest `guest_token` cookie
  is set by Laravel on `:8000`; browser `credentials: 'include'` carries it).
- Add-to-cart sends the sellable child slug (`Product.variantSlug`).
- Checkout: `PUT /checkout/contact` → `PUT /checkout/delivery` →
  `PUT /checkout/payment` (`null` for COD, `cinetpay` for mobile) →
  `POST /orders` → `POST /orders/{ref}/payments` when not COD.
- Confirmation polls `GET /api/orders/{reference}` (no `GET /payments/{id}`
  on the KA API). NullGateway returns `/order/{ref}`; that page redirects to
  `/confirmation?ref=`.
- Deleted `web/src/app/api/orders/create/route.ts` and jeko-pay checkout /
  reconcile / status routes. Jeko *loyalty* routes and the leftover webhook
  stay until M6.

**W7 — leads**
- Footer subscribe → `POST /api/newsletter-subscriptions` (`shared/api/leads.ts`).
- Contact page → `POST /api/contact-messages` (`name`/`email`/`subject`/`message`).
- Deleted `web/src/app/api/newsletter/subscribe/route.ts` and
  `web/src/app/api/contact/route.ts`. `newsletter/manage` stays until M6
  (leftover admin copy block + cron).

**W8 — gate**
- `pnpm --filter web build` green.
- Grep remaining Drizzle usage: only M6 surfaces (site-config, quiz, jeko,
  reviews, testimonials, leftover Next routes, `requireAdmin`).
- Browser walk (2026-08-31, `localhost:3000` — `127.0.0.1` is now also
  stateful/CORS-allowed): boutique add-to-cart → drawer (`POST /api/cart-items`
  201) → checkout delivery methods from Laravel → COD
  (`PUT /checkout/contact|delivery|payment` + `POST /orders` 201) →
  confirmation polls `GET /api/orders/{ref}` 200. Contact
  `POST /api/contact-messages` 201; footer
  `POST /api/newsletter-subscriptions` 201.
- Dead Drizzle category admin writes removed (`fetchAllCategoriesAdmin` /
  add / update / delete). `/api/products` stays until M6 (quiz still relative-fetches it).
- Commit. Do not start M5.

### Out of scope (leave on Drizzle)

hero, contenu, faq, legal, branding, marketing, paiement config, quiz, jeko,
avis, temoignages, `saveSiteConfigSection`, `getSiteConfig`, category hero
`/api/config/*`, `ADMIN_EMAILS` / `requireAdmin` for leftover Next routes.
