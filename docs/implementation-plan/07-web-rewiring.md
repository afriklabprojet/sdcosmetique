# §7 Web rewiring (R9) — connecting `./web` to `./api`

R9 is the whole of this section: after the split, `./web` holds no database driver, no
Drizzle, no repository, and no server-side SQL. Every piece of data it renders arrives over
HTTP from `api.sdcosmetique.ci/v1` (§5.2).

## §7.1 The three consumer classes

Today `./web` reads data in three different ways. Each needs a different rewrite, and
conflating them is the main way this migration goes wrong.

| Class | What it is | Count | Rewrite |
| --- | --- | --- | --- |
| **W1 — browser `fetch('/api/…')`** | Client components hitting the app's own route handlers on a relative path | 46 sites in 27 files | Absolute URL through the API client (§7.2); 14 sites disappear with the admin UI |
| **W2 — RSC direct repository import** | Server components importing `@/features/*/…repository` and running Drizzle during render | 16 imports in 12 files | `fetch` from the server component to `./api`, cached with Next's `fetch` options |
| **W3 — Server Actions** | `'use server'` modules calling repositories | 8 files | Either delete the action and fetch directly, or keep it as a thin proxy that forwards the session cookie |

Class W2 is the dangerous one. It runs today with no HTTP boundary and no auth check —
`src/app/page.tsx:14-17` calls four repositories inline — so latency, caching, and failure
modes all change character when it becomes a network call.

## §7.2 The API client — one new file

`./web/src/shared/api/client.ts` is created. It is the only place in `./web` that knows the
API's origin.

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. https://api.sdcosmetique.ci/v1

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',        // Sanctum SPA cookie mode (C1)
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}
```

Three properties this file must hold, none of which the current code has:

1. **`credentials: 'include'`** on every call. Under C1's SPA cookie mode the browser must
   send the `laravel_session` cookie cross-origin; the default `same-origin` will not.
2. **A CSRF priming call.** Sanctum SPA mode requires `GET /sanctum/csrf-cookie` before the
   first mutating request. Nothing equivalent exists today because `sd_session` is checked
   by presence alone (`middleware.ts:31-32`).
3. **Errors that throw.** Today `src/features/catalog/product.query.ts:38` swallows every
   failure and silently returns the hardcoded `PRODUCTS` constant. That fallback masks a
   dead API. It is removed — see §7.6.

C1 locks SPA cookie mode, so all three properties above are required. (Under API tokens,
`credentials: 'include'` would become an `Authorization: Bearer` header and the CSRF call
would disappear — noted only so the reason for each line is clear.)

## §7.3 Call-site ledger W1 — browser `fetch('/api/…')`

All 46 sites. `→` is the replacement path relative to `NEXT_PUBLIC_API_URL`.

### Rewritten — 32 sites in 23 files

| Site | Current path | → |
| --- | --- | --- |
| `src/app/(auth)/connexion/page.tsx:26` | `/api/auth/login` | `POST /sessions` |
| `src/app/(auth)/inscription/page.tsx:36` | `/api/auth/register` | `POST /registrations` |
| `src/app/(auth)/mot-de-passe-oublie/page.tsx:20` | `/api/auth/forgot-password` | `POST /password-resets` |
| `src/app/avis/page.tsx:39` | `/api/reviews` | `GET /reviews` |
| `src/app/categorie/body/page.tsx:16` | `/api/config/hero_body` | `GET /settings/hero_body` — **C3** |
| `src/app/categorie/duo/page.tsx:16` | `/api/config/hero_duo` | `GET /settings/hero_duo` — **C3** |
| `src/app/categorie/face/page.tsx:16` | `/api/config/hero_face` | `GET /settings/hero_face` — **C3** |
| `src/app/categorie/gammes/page.tsx:16` | `/api/config/hero_gammes` | `GET /settings/hero_gammes` — **C3** |
| `src/app/categorie/kits/page.tsx:16` | `/api/config/hero_kits` | `GET /settings/hero_kits` — **C3** |
| `src/app/checkout/page.tsx:65` | `/api/config/payment_methods_active` | `GET /settings/payment_methods_active` — **C3** |
| `src/app/checkout/page.tsx:130` | `/api/orders/create` | `POST /orders` |
| `src/app/checkout/page.tsx:153` | `/api/jeko-pay/checkout` | `POST /payments` |
| `src/app/compte/page.tsx:93` | `/api/auth/me` | `GET /profile` |
| `src/app/compte/page.tsx:124` | `/api/auth/logout` | `DELETE /sessions` |
| `src/app/compte/page.tsx:153` | `/api/auth/profile` | `PATCH /profile` |
| `src/app/confirmation/page.tsx:42` | `/api/jeko-pay/reconcile` | `GET /payments/{id}` — the reconcile *route* is deleted (§5.3); the page polls the transaction instead |
| `src/app/quiz/page.tsx:41` | `/api/config/hero_quiz` | `GET /settings/hero_quiz` — **C3** |
| `src/app/quiz/page.tsx:51` | `/api/products` | `GET /products` |
| `src/app/quiz/page.tsx:60` | `/api/quiz/submit` | `POST /quiz-submissions` |
| `src/app/(static)/contact/page.tsx:34` | `/api/contact` | `POST /contact-messages` |
| `src/features/account/tabs/newsletter.tab.tsx:40` | `/api/auth/profile` | `PATCH /profile` |
| `src/features/account/tabs/profile.tab.tsx:111` | `/api/auth/profile` | `PATCH /profile` |
| `src/features/account/tabs/settings.tab.tsx:70` | `/api/auth/logout` | `DELETE /sessions` |
| `src/features/catalog/product.query.ts:34` | `/api/products?…` | `GET /products?…` |
| `src/features/catalog/product.query.ts:51` | `/api/products/${slug}` | `GET /products/{slug}` |
| `src/features/catalog/views/category.view.tsx:54` | `/api/config/${configKey}` | `GET /settings/{key}` — **C3** |
| `src/features/home/payment-band.tsx:73` | `/api/config/payment_methods_active` | `GET /settings/payment_methods_active` — **C3** |
| `src/features/home/payment-band.tsx:82` | `/api/config/payment_images` | `GET /settings/payment_images` — **C3** |
| `src/features/site-config/site-config.util.ts:11` | `/api/config/${section}` | `GET /settings/{section}` — **C3** |
| `src/shared/layout/footer.tsx:52` | `/api/newsletter/subscribe` | `POST /newsletter-subscriptions` (C11) |
| `src/shared/ui/image.input.tsx:40` | `/api/upload` | `POST /v1/media` (C12) — the only site whose *response* shape changes: a `/uploads/…` string becomes a full `https://api.sdcosmetique.ci/storage/…` URL |

Nine of these 32 sites are read site config, now the `settings` table (C3). It is the single largest
unresolved dependency in the front end.

### Deleted with the admin UI — 14 sites in 4 files

B2 deletes `src/app/admin/**` and the Filament panel replaces it. These call sites are not
rewritten; the files holding them are removed.

| File | Sites | Replaced by |
| --- | --- | --- |
| `src/features/admin/admin.view.tsx` | `:63`, `:72`, `:443`, `:454`, `:461`, `:556`, `:571`, `:586`, `:608`, `:657`, `:850` (11) | Filament panel (§6) |
| `src/features/admin/tabs/newsletter.tab.tsx` | `:37`, `:47` (2) | Filament `NewsletterSubscriptionResource` (C11) |
| `src/features/admin/cards/quiz-analytics.card.tsx` | `:41` (1) | Filament widget (§6.3) |
| `src/app/admin/login/page.tsx` | `:33` (1) | Filament's own login |

## §7.4 Call-site ledger W2 — server components importing repositories

These execute Drizzle inside the render pass today. Every one becomes an HTTP call.

| Site | Import | → |
| --- | --- | --- |
| `src/app/page.tsx:14` | `fetchBestsellerProducts` | `GET /products?bestsellers=true` |
| `src/app/page.tsx:15` | `getSiteConfig` | `GET /settings` — **C3** |
| `src/app/page.tsx:16` | `fetchApprovedTestimonials` | `GET /testimonials` (C11) |
| `src/app/page.tsx:17` | `fetchActiveCategories` | `GET /categories` |
| `src/app/boutique/page.tsx:2` | `fetchProducts` | `GET /products` |
| `src/app/categorie/[slug]/page.tsx:1` | `fetchProductsByCategory` | `GET /products?category={slug}` |
| `src/app/produit/[slug]/page.tsx:3` | `fetchProductBySlug`, `fetchRelatedProducts`, `fetchReviewsByProduct` | `GET /products/{slug}` — the API Resource should embed related products and reviews so one round trip replaces three queries |
| `src/app/produit/[slug]/page.tsx:4` | `getSiteConfig` | `GET /settings` — **C3** |
| `src/app/teint/[slug]/page.tsx:4` | `fetchProducts` | `GET /products?skinTone={slug}` |
| `src/app/teint/[slug]/page.tsx:5` | `getSiteConfig` | `GET /settings` — **C3** |
| `src/app/quiz/page.tsx:12` | `fetchActiveConcerns`, `fetchActiveRoutines` | `GET /quiz-questions` (embeds options) |
| `src/app/(static)/cgv/page.tsx:3` | `getSiteConfig` | `GET /settings` — **C3** |
| `src/app/(static)/confidentialite/page.tsx:3` | `getSiteConfig` | `GET /settings` — **C3** |
| `src/app/(static)/mentions-legales/page.tsx:3` | `getSiteConfig` | `GET /settings` — **C3** |

`src/app/compte/page.tsx:8` imports `formatPrice` from `@/features/catalog/product.query`.
That is a pure `Intl.NumberFormat` helper with no database access. It stays. Do not delete
`product.query.ts` wholesale — split the formatters out from the fetchers.

**Caching.** Every W2 call must carry an explicit `next: { revalidate, tags }`. Today these
pages are implicitly dynamic because Drizzle runs per request. Once they are `fetch` calls,
Next will cache them by default and the shop will serve stale prices until something
revalidates. §7.5 is the mechanism.

## §7.5 Call-site ledger W3 — Server Actions

Eight files carry `'use server'`. Seven of them are repositories that are deleted outright
by R6 (§9); the eighth is a genuine action module.

| File | Disposition |
| --- | --- |
| `src/app/compte/actions.ts` | **Rewritten.** Its four actions (`:17`, `:21`, `:25`, `:29`) become API calls. `redeemLoyaltyRewardAction` (`:29`) must forward the session cookie — a Server Action runs on the Next server, so `credentials: 'include'` does nothing there; it has to read the cookie with `cookies()` and set it on the outbound request explicitly. |
| `src/features/catalog/review.repository.ts` | Deleted (R6) |
| `src/features/catalog/category.repository.ts` | Deleted (R6) |
| `src/features/orders/order.repository.ts` | Deleted (R6) |
| `src/features/loyalty/jeko.repository.ts` | Deleted (R6) |
| `src/features/quiz/quiz.repository.ts` | Deleted (R6) |
| `src/features/testimonials/testimonial.repository.ts` | Deleted (R6) |
| `src/features/admin/admin-actions.ts` | Deleted (B2 — Filament) |

Open decision, not yet an O-number because it is a style call rather than a fact: keep
`compte/actions.ts` as a cookie-forwarding proxy, or delete it and call the API from client
components with `credentials: 'include'`. The proxy keeps the API origin off the client and
costs one extra hop. **Recommendation: delete it.** The API client already handles cookies
in the browser, and a proxy in `./web` re-creates the coupling this migration removes.

## §7.6 The hardcoded-product fallback must go

`src/features/catalog/product.query.ts:38-46` and `:56` catch every fetch failure and return
rows from a `PRODUCTS` constant. `src/features/site-config/site-config.util.ts:15,17` does
the same with `DEFAULT_SITE_CONFIG`.

Across an in-process boundary that fallback was nearly unreachable. Across a network
boundary to a separate host it becomes the *normal* path during any API outage — the shop
would render a plausible catalogue with wrong prices and no error anywhere. Both fallbacks
are deleted and replaced with an error boundary. This is the single highest-severity item
in §13.

## §7.7 `middleware.ts`

Current state: `middleware.ts:31-32` reads `sd_session` and tests presence only — it never
validates. `:12` protects `/admin` and `/compte`. `:57` excludes `/api` from the matcher
entirely.

After the split:

- `/admin` leaves the matcher — B2 moves the panel to `./api` and Filament guards itself.
- `/compte` stays, but the cookie name changes from `sd_session` to Laravel's session
  cookie (`laravel_session` by default, configurable via `SESSION_COOKIE`).
- Presence-only checking stays acceptable **only** as a redirect optimisation. Real
  enforcement is `auth:sanctum` on the API side (§5.4). The middleware must not be treated
  as an authorisation boundary — it is not one today either.
- The `/api` exclusion at `:57` **must be narrowed, not dropped.** `./web` keeps two route
  handlers, and C4 puts their rate limiter in this middleware — so the matcher has to reach
  `/api/revalidate` and `/api/csp-report` while still excluding everything else. See §7.8.

## §7.8 Two route handlers stay in `./web` — and they have a dependency problem

§5.3 keeps `src/app/api/revalidate/route.ts` and `src/app/api/csp-report/route.ts` in
`./web`, because both need Next-only capabilities: `revalidatePath`/`revalidateTag`
(`revalidate/route.ts:17`) and the CSP header set at `next.config.ts:170-190`.

**The dependency they carry.** Both import the Upstash rate limiter —
`revalidate/route.ts:18` and `csp-report/route.ts:2` — and B11 removes Upstash. Laravel's
`RateLimiter` cannot protect a route running on the Next server, and the revalidate endpoint
relies on its limiter to blunt brute-forcing of `REVALIDATE_SECRET`
(`revalidate/route.ts:23-28`).

**C4 resolves this: a Next.js middleware limiter, using a package.** The verified candidate
is **`rate-limiter-flexible@11.2.0`** (ISC, **zero runtime dependencies** — checked against
the npm registry on 2026-08-25). Its `RateLimiterMemory` covers exactly this case and, being
dependency-free, adds nothing transitive to `./web`.

```ts
// web/middleware.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ points: 10, duration: 600 });
```

Two consequences that are easy to miss:

1. **The matcher must change.** `middleware.ts:57` currently excludes `/api` outright:
   `/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)`. A middleware limiter that
   never runs on `/api/*` protects nothing. Add a second matcher entry for
   `/api/revalidate` and `/api/csp-report` — those two paths only, not all of `/api`.
2. **Node runtime.** `RateLimiterMemory` is pure JavaScript, but confirm the middleware is
   running on the Node.js runtime rather than the edge one before relying on it. Verify at
   P6 rather than assuming.

Like the in-memory fallback it replaces, this is **per-instance**: two Next processes keep
two counters. That is the same guarantee `rate-limit.guard.ts:3-5` already degrades to
without Upstash credentials, so it is not a regression — but it is worth knowing that a
multi-instance deployment halves the effective limit per instance.

**Revalidation flow.** After the split, `./api` is the only thing that knows when a product
changed. So `./api` calls `./web`:

```
Filament saves a Product
  → Laravel model observer
  → Http::withHeader('x-revalidate-secret', config('services.web.revalidate_secret'))
        ->post(config('services.web.url').'/api/revalidate', ['tags' => ['products']])
```

This makes `REVALIDATE_SECRET` a **shared** secret present in both `api/.env` and
`web/.env`. It is the only value that must appear in both files.

## §7.9 `./web` environment variables after the split

| Variable | Status | Evidence |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | **New** | Required by §7.2; nothing equivalent exists today |
| `NEXT_PUBLIC_SITE_URL` | Keeps | `next.config.ts:6,61`; `src/app/layout.tsx:31`, `robots.ts:3`, `sitemap.ts:3`, `boutique/page.tsx:5`, `produit/[slug]/page.tsx:14,49` |
| `NEXT_PUBLIC_SITE_NAME` | Keeps | `next.config.ts:62` |
| `REVALIDATE_SECRET` | Keeps, now shared with `./api` | `src/app/api/revalidate/route.ts:31` |
| `SITE_URL` | **Moves to `./api`** | Only consumers are `jeko-pay/checkout/route.ts:23` and `email.service.ts:65,205`, all of which move (B12) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | **Moves to `./api`** | `src/shared/db/index.ts:13-17`; `./web` gets no database access (B3) |
| `ADMIN_EMAILS` | **Deleted** | `auth.service.ts:118,153`; A4 replaces it with `role_user` |
| `ADMIN_DEFAULT_PASSWORD` | **Deleted** | `scripts/create-admin-users.ts`; replaced by a Laravel seeder (§4.7) |
| `CRON_SECRET` | **Deleted** | `cron/cleanup/route.ts:10`; the route becomes a scheduled command (§5.3) |
| `JEKO_API_BASE_URL` `JEKO_WEBHOOK_SECRET` | **Moves to `./api`** | B12 |
| `RESEND_API_KEY` `RESEND_FROM_EMAIL` | **Moves to `./api`** | B12 |
| `WHATSAPP_TOKEN` `WHATSAPP_PHONE_NUMBER_ID` | **Moves to `./api`** | B12 |
| `UPSTASH_REDIS_REST_URL` `UPSTASH_REDIS_REST_TOKEN` | **Deleted.** C4 replaces them with an in-process middleware limiter (§7.8) | B11; `rate-limit.guard.ts:23-25` |
| `NEXT_PUBLIC_SUPABASE_URL` `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Deleted** | `next.config.ts:58-63`; already dead (§8) |
| `LSNODE_SOCKET` `PORT` `HOSTNAME` | Keeps | `server.js:46,71-78`; deployment-owned, and B8 defers deployment |

## §7.10 CORS — the API side of R9

Sanctum SPA cookie mode (C1) requires all three of these in `./api`, or the browser drops
every response:

| Setting | Value |
| --- | --- |
| `config/cors.php` → `allowed_origins` | `https://sdcosmetique.ci` (and the dev origin) |
| `config/cors.php` → `supports_credentials` | `true` |
| `SANCTUM_STATEFUL_DOMAINS` | `sdcosmetique.ci,api.sdcosmetique.ci` |
| `SESSION_DOMAIN` | `.sdcosmetique.ci` |

`SESSION_DOMAIN` is what makes the cookie visible to both hosts, and it is the reason C1's
answer is constrained: SPA cookie mode only works because both names sit under one
registrable apex. C1 depends on that: if `./api` is ever hosted on a domain outside
`sdcosmetique.ci`, SPA cookie mode stops working and the transport has to change to API
tokens. Worth remembering during C7's hand-deploy, which is where a host gets chosen.

## §7.11 UNKNOWNs introduced by this section

| # | Question | Resolution |
| --- | --- | --- |
| — | Whether Next.js middleware in this project runs on the Node.js runtime (required by C4's limiter) | Confirm at P6; §7.8 |
| — | Whether `GET /products/{slug}` embeds reviews and related products, or the page makes three calls | Decide when writing `ProductResource` in P5 |
