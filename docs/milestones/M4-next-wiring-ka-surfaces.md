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
