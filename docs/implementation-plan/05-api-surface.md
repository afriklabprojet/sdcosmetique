# §5 API surface — CRUDdy by Design

## §5.1 The two rules

**Rule 1 — seven actions, no more.** Every controller exposes only
`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`. A JSON API has no forms,
so `create` and `edit` are never registered: use `Route::apiResource()`, which emits the
other five.

An action that does not fit becomes **its own resource**, not an extra method. The verb in
the old route name tells you what the noun is:

| Old shape                       | New resource                       | Action  |
| ------------------------------- | ---------------------------------- | ------- |
| `POST /auth/login`              | a *session*                        | `store` |
| `POST /auth/logout`             | a *session*                        | `destroy` |
| `POST /auth/forgot-password`    | a *password reset*                 | `store` |
| `POST /orders/notify-shipped`   | a *shipment*                       | `store` |
| `POST /admin/jeko/adjust`       | a *loyalty adjustment*             | `store` |
| `POST /jeko-pay/webhook`        | a *payment webhook*                | `store` |

**Rule 2 — no `XxxService`, no `XxxManager`.** Behaviour lives on the model, in an
Action/Job when it is a queued unit of work, or in an event listener. The two service
classes that exist today — `src/features/payment/payment-settlement.service.ts` and
`src/features/orders/order-notification.service.ts` — do not survive as services:
settlement becomes `PaymentTransaction` model methods plus a `PaymentSucceeded` event;
notification becomes Laravel Notifications on the `Order` model.

Supporting Laravel pieces, one per resource, no exceptions:
`app/Http/Controllers/`, `app/Http/Requests/` (Form Requests — all validation),
`app/Http/Resources/` (API Resources — all serialisation), `app/Policies/` (all
authorisation, registered by convention, enforced with `authorizeResource()`).

## §5.2 Route file skeleton — `api/routes/api.php`

Prefix is `v1` from `bootstrap/app.php` (§3.5), so every path below is served at
`https://api.sdcosmetique.ci/v1/...`.

```php
// Public
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('reviews', ProductReviewController::class)->only(['index', 'store']);
Route::apiResource('testimonials', TestimonialController::class)->only(['index']);   // C11
Route::apiResource('newsletter-subscriptions', NewsletterSubscriptionController::class)
    ->only(['store', 'destroy']);                                                    // C11
Route::apiResource('quiz-submissions', QuizSubmissionController::class)->only(['store', 'show']);
Route::apiResource('contact-messages', ContactMessageController::class)->only(['store']);
Route::apiResource('settings', SettingController::class)->only(['index', 'show']);   // C3

// Guest checkout + payment
Route::apiResource('orders', OrderController::class)->only(['store', 'show']);
Route::apiResource('payments', PaymentTransactionController::class)->only(['store', 'show']);
// NOTE: this one lives in routes/webhooks.php, NOT here — it is unversioned (C8, §3.5b).
// Route::post('webhooks/jeko-pay', [JekoWebhookController::class, 'store'])
//     ->middleware('webhook.jeko');

// Auth (Sanctum, SPA cookie mode — C1)
Route::apiResource('sessions', SessionController::class)->only(['store', 'destroy']);
Route::apiResource('registrations', RegistrationController::class)->only(['store']);
Route::apiResource('password-resets', PasswordResetController::class)->only(['store', 'update']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);
    Route::apiResource('orders', OrderController::class)->only(['index']);
    Route::apiResource('loyalty-entries', LoyaltyLedgerController::class)->only(['index']);
    Route::apiResource('addresses', AddressController::class);
});
```

Admin CRUD is **not** in this file. B2 puts administration in Filament (§6), which reaches
Eloquent directly and needs no JSON endpoints. That deletes seven route handlers outright.

## §5.3 Route-by-route ledger — all 38 handlers

Every `route.ts` under `src/app/api/` and where it goes. `HTTP` is what the file currently
exports.

| Current file (`src/app/api/…`)      | HTTP           | Destination                                             |
| ----------------------------------- | -------------- | ------------------------------------------------------- |
| `products/route.ts`                 | GET            | `ProductController@index` — `GET /v1/products`          |
| `products/[slug]/route.ts`          | GET            | `ProductController@show` — route-model bound on `slug`  |
| `reviews/route.ts`                  | GET            | `ProductReviewController@index`                         |
| `config/[key]/route.ts`             | GET            | `SettingController@show` — reads `settings` (C3)            |
| `config/full/route.ts`              | GET            | `SettingController@index` — reads `settings` (C3); the `requireAdmin()` at `:6` becomes a Policy |
| `quiz/submit/route.ts`              | POST, GET      | POST → `QuizSubmissionController@store`; GET → `@show`. Two verbs in one file split into two actions. |
| `contact/route.ts`                  | POST           | `ContactMessageController@store` + a `ContactMessage` Mailable |
| `newsletter/subscribe/route.ts`     | POST           | `NewsletterSubscriptionController@store` (C11)          |
| `newsletter/manage/route.ts`        | PATCH, DELETE  | `@update` / `@destroy` (C11)                            |
| `newsletter/list/route.ts`          | GET            | **deleted** — Filament resource (§6)                    |
| `auth/login/route.ts`               | POST           | `SessionController@store`                               |
| `auth/logout/route.ts`              | POST           | `SessionController@destroy`                             |
| `auth/register/route.ts`            | POST           | `RegistrationController@store`                          |
| `auth/me/route.ts`                  | GET            | `ProfileController@show`. Note: `2fc489b` just added an `isAdmin` flag to this response — in Laravel that is `$user->isAdmin()` from A4's `role_user`, exposed by `UserResource`. |
| `auth/profile/route.ts`             | PATCH          | `ProfileController@update`                              |
| `auth/forgot-password/route.ts`     | POST           | `PasswordResetController@store` — Laravel's built-in broker |
| `orders/create/route.ts`            | POST           | `OrderController@store` — 148 lines, 6 Drizzle calls; the largest single rewrite |
| `orders/notify/route.ts`            | POST           | **deleted** — an `OrderPlaced` notification fired by `OrderController@store` |
| `orders/notify-shipped/route.ts`    | POST           | `ShipmentController@store` — creating a shipment sends the notification |
| `jeko-pay/checkout/route.ts`        | POST           | `PaymentTransactionController@store` (153 lines)        |
| `jeko-pay/status/[id]/route.ts`     | GET            | `PaymentTransactionController@show`                     |
| `jeko-pay/webhook/route.ts`         | POST           | `JekoWebhookController@store` at `POST …/webhooks/jeko-pay` (C6) — **external re-registration**; also survives 48 h in `./web` as a raw-body proxy |
| `jeko-pay/reconcile/route.ts`       | POST           | **deleted** — becomes `php artisan payments:reconcile`, scheduled |
| `jeko/notify/route.ts`              | POST           | **deleted** — Filament action                           |
| `jeko/export/route.ts`              | GET            | **deleted** — Filament table export                     |
| `admin/orders/route.ts`             | GET, PATCH     | **deleted** — Filament `OrderResource`                  |
| `admin/products/route.ts`           | GET,POST,DELETE| **deleted** — Filament `ProductResource`                |
| `admin/jeko/config/route.ts`        | GET, POST      | **deleted** — Filament settings page                    |
| `admin/jeko/members/route.ts`       | GET            | **deleted** — Filament `LoyaltyAccountResource`         |
| `admin/jeko/stats/route.ts`         | GET            | **deleted** — Filament widget                           |
| `admin/jeko/transactions/route.ts`  | GET            | **deleted** — Filament `LoyaltyLedgerResource`          |
| `admin/jeko/adjust/route.ts`        | POST           | **deleted** — Filament table action                     |
| `upload/route.ts`                   | POST           | `MediaController@store` — `Storage::disk('public')` (C12)             |
| `cron/cleanup/route.ts`             | GET            | **deleted** — `routes/console.php` schedule; `CRON_SECRET` disappears |
| `health/route.ts`                   | GET            | **deleted** — Laravel's built-in `/up` (§3.5)           |
| `revalidate/route.ts`               | POST           | **stays in `./web`** — it calls Next's `revalidatePath`, which only the Next server can do. `./api` now *calls* it. See §7.5. |
| `csp-report/route.ts`               | POST           | **stays in `./web`** — CSP is set by `next.config.ts:170-190`, so the report endpoint belongs with it |
| `whatsapp/test/route.ts`            | POST           | **deleted** — `php artisan whatsapp:test` |

Tally: **20 become Laravel routes**, **16 are deleted** (13 absorbed by Filament or the
scheduler, 3 replaced by framework features), **2 stay in `./web`**.

## §5.4 Authentication (B1, C1)

Written for **Sanctum SPA cookie sessions**. `sdcosmetique.ci` and `api.sdcosmetique.ci`
share a registrable apex, which is the precondition.

`api/.env`:
```
SESSION_DRIVER=database
SESSION_DOMAIN=.sdcosmetique.ci
SANCTUM_STATEFUL_DOMAINS=sdcosmetique.ci,www.sdcosmetique.ci
```
`api/config/cors.php`: `'supports_credentials' => true`, allowed origins listed
explicitly — never `*`, which is invalid with credentials.

Flow: `./web` calls `GET /sanctum/csrf-cookie`, then `POST /v1/sessions` with
`credentials: 'include'`. Every later request carries the session cookie and the
`X-XSRF-TOKEN` header.

What this replaces, precisely:

| Today                                                                 | Becomes                                             |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `SESSION_COOKIE_NAME = 'sd_session'` (`src/shared/auth/auth.service.ts:7`) | Laravel's session cookie, named from `config/session.php` |
| `SESSION_DURATION_MS` = 30 days (`:8`)                                 | `SESSION_LIFETIME` in minutes                        |
| `bcryptjs` hash/compare (`:39,43`)                                     | `Hash::make` / `Hash::check` (bcrypt, same algorithm) |
| `createSession()` sets httpOnly, `sameSite: 'lax'` (`:57-63`)          | Laravel's session cookie, same flags by default      |
| `requireAdmin()` — `role === 'admin' \|\| ADMIN_EMAILS.has(email)` (`:117-127`) | a Policy + `$user->isAdmin()` over `role_user` (A4). The env allow-list disappears. |
| `registerUser()` — 20 welcome points in one transaction (`:160-179`)   | `RegistrationController@store` + a `Registered` listener writing the ledger entry (§4.4) |
| `middleware.ts:31` — checks cookie **presence only**, never validates  | §7.4 — the guard becomes a real one                  |

C1 locks SPA cookie mode, so this is the shape that ships. Recorded for completeness: had
it come back "API tokens", three things would change and nothing else — no
`/sanctum/csrf-cookie` round trip, `SANCTUM_STATEFUL_DOMAINS` is unset, and `./web` stores
a bearer token — which cannot be `httpOnly`, so it is XSS-reachable. That is the trade.

## §5.5 Authorisation (A4)

Five roles: `super_admin`, `store_manager`, `support_operator`, `warehouse_operator`,
`customer`.

```php
// app/Models/User.php
public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class);       // role_user, composite PK
}

public function hasRole(string $name): bool { … }
public function isAdmin(): bool { … }              // any role except 'customer'
```

`role_user` has a composite primary key `(user_id, role_id)` and therefore **no `id`
column** — set `public $incrementing = false;` if the pivot is ever modelled explicitly,
and prefer `belongsToMany` with `withTimestamps()` over a pivot model.

Every controller calls `authorizeResource(Model::class, 'param')` in its constructor. No
inline role checks in controllers, ever.

## §5.6 Third-party integrations moving to `./api` (B12)

| Integration      | Today                                                                     | In Laravel                                                    |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Resend           | `src/shared/notifications/email.service.ts:16`                            | A `resend` mail transport in `config/mail.php`; each email a Mailable + Notification |
| WhatsApp Cloud   | `src/shared/notifications/whatsapp.service.ts:20`                          | A custom Notification channel over `Http::` — no package needed |
| Jeko Pay         | `src/features/payment/jeko-pay.client.ts:17,27-28`                        | An `Http::baseUrl()` client bound in a service provider        |
| Jeko webhook     | `src/features/payment/jeko-pay-webhook.validator.ts`                       | Signature verification in a route middleware; body logged to `payment_webhook_logs` (`target-schema.md:536`) before processing |
| Settlement rules | `src/features/payment/payment-rules.ts`, `payment-settlement.service.ts`   | Model methods + a `PaymentSucceeded` event (Rule 2)            |
| Rate limiting    | `src/shared/http/rate-limit.guard.ts:11-30` (Upstash)                      | B11 — `RateLimiter::for()` in `AppServiceProvider`, `cache` driver on the `cache` table from §3.7 |

All notifications are queued (`ShouldQueue`) onto the `jobs` table that §3.7 keeps. That
is why the jobs migration is not deleted.

**C6 settles this.** The endpoint is `POST /webhooks/jeko-pay`, behind a
`webhook.jeko` route middleware that verifies the signature before the controller runs.
Three things follow, and none of them can be done by merging a branch:

1. **Register the URL with Jeko before P8**, not during it.
2. **Keep the old endpoint alive for 48 h** after the switch. This is not free: the old
   receiver is `src/app/api/jeko-pay/webhook/route.ts`, which uses Drizzle and is deleted by
   §9.5. For the 48 h window it has to survive as a **thin proxy** that forwards to `./api`
   — and it must forward the **raw request body byte-for-byte**, because signature
   verification is computed over those exact bytes. Re-serialising parsed JSON breaks every
   signature. Forward the signature headers verbatim too.
3. **C8** — the URL Jeko is given is `api.sdcosmetique.ci/api/webhooks/jeko-pay`, but B2
   fixes the API prefix at `/v1`. Settle the prefix before registering anything externally;
   this is the one path in the system that a third party hardcodes.
