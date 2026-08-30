# M3 — Admin JSON endpoints

**Objective:** replace the removed Filament resources with authorized JSON endpoints under
`/api/admin/*`, following the module conventions already in the codebase (Controller +
FormRequest + API Resource + Policy; middleware on route indexes, never on leaves).

**Depends on:** M2. **Priority:** 1 — KA spine.

## Auth model

Admins are ordinary `users` with an active row in `admins`
(`app/Modules/Identity/Models/Admin.php`, `User::administrator()`). Authentication reuses
the existing Fortify session login on the `web` guard with Sanctum stateful SPA cookies —
no new login system.

1. Add an `admin` middleware (e.g. `app/Shared/Http/Middleware/EnsureUserIsAdmin.php`)
   that 403s unless `$request->user()?->administrator()`; register the alias in
   `bootstrap/app.php`.
2. Add `GET /api/admin/session` returning the authenticated admin (user + admin role
   fields) so the Next admin can verify access after Fortify login. 401 for guests,
   403 for non-admin users.

## Routes

New route index `routes/api/admin.php`, registered from `routes/api/index.php`, wrapped in
`auth:sanctum` + `admin`. Resource leaves stay middleware-free per the repo convention.

## Endpoints (mirroring the deleted Filament resources)

| Domain | Resource(s) | Notes |
| --- | --- | --- |
| Accounts | `admin/customers` index, show | replaces `CustomerResource` |
| Catalog | `admin/categories`, `admin/products` full apiResource; nested translations; `admin/media` store | replaces Category/Product resources + relation managers; media upload for product images |
| Content | `admin/banners`, `admin/pages` full apiResource | replaces Banner/Page resources |
| Leads | `admin/contact-messages` index, show, update (handled state); `admin/newsletter-subscriptions` index, destroy | replaces Leads resources; feeds the Next "newsletter" tab export |
| Orders | `admin/orders` index, show, update (status transitions); `admin/orders/{id}/adjustments`; `admin/delivery-methods` apiResource | replaces Order/DeliveryMethod resources + relation managers; backs the "livraison" tab |
| Payments | `admin/payments` index, show; `admin/payment-notifications` index, show | replaces Payment/Notification resources; read-mostly |
| Shopping | `admin/coupons` apiResource | replaces `CouponResource`; backs the "promos" tab |
| Metrics | `admin/metrics/overview` (or per-widget endpoints) | reproduces the widget queries: revenue overview, orders per day, low stock, pending payments, unhandled notifications |

Status transitions and other verbs follow the CRUDdy rule from
[§5.1](../implementation-plan/05-api-surface.md): a non-CRUD verb becomes a sub-resource
(e.g. `PATCH admin/orders/{order}` with a guarded status field, or a
`admin/orders/{order}/shipment` resource), never an RPC route.

## Tests

- Pest Feature tests per admin resource: happy path, validation, and the authorization
  matrix — 401 unauthenticated, 403 authenticated non-admin, 200 active admin, 403 revoked
  admin (`admins.revoked_at` set).
- Reuse the existing module factories; extend `AdminSeeder` if a dev admin login is needed.

## Definition of Done

- Every admin tab data need in `web/src/features/admin/` (KA-covered domains) has a
  documented endpoint answering with a stable JSON shape.
- `php artisan route:list` shows all `/api/admin/*` routes inside `auth:sanctum` + `admin`.
- Full Pest suite green, including the new admin tests.

## References

- Conventions: [§5.1–§5.2](../implementation-plan/05-api-surface.md); existing route
  indexes `api/routes/api/index.php`
- Filament resources being mirrored: archived list in
  `trash/ka-pivot/implementation-plan/06-filament-admin.md` and M2's footprint table
