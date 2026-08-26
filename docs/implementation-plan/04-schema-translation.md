# §4 Schema translation — Drizzle → Eloquent

## §4.1 Sources and precedence

Three documents describe the schema, and they disagree. Precedence, highest first:

1. **Phase 0 decisions A0–A5 and Phase 1 decisions B1–B13** (§0.1). These override everything.
2. **`docs/db-schema/target-schema.md`** — 37 `mysqlTable(` declarations, the canonical spec.
3. **`src/shared/db/schema.ts`** — 211 lines, 15 tables, what actually runs today.

`trash/notes.md` is a decision scratchpad, not a specification. Where it names tables that
appear in neither (1) nor (2) — `settings`, `skin_tones`, `shipping_zones`,
`loyalty_tiers`, `loyalty_rewards`, `coupon_redemptions` — those tables are **UNKNOWN**
and are not built. See §4.8.

## §4.2 Final table ledger

| Step                                                          | Δ   | Running total |
| ------------------------------------------------------------- | --- | ------------- |
| `docs/db-schema/target-schema.md` as written                  |     | **37**        |
| − `admins` (`target-schema.md:103`) — A4 deletes it            | −1  | 36            |
| − `sessions` (`target-schema.md:113`) — collides with Laravel's own, §4.5 | −1  | 35            |
| + `roles`, `role_user` — A4                                    | +2  | 37            |
| + `order_customers` — A3                                       | +1  | 38            |
| + `order_adjustments` — A1                                     | +1  | 39            |
| + `settings` — C3, §4.9                                        | +1  | 40            |
| + `testimonials`, `newsletter_subscribers` — C11               | +2  | 42            |
| + `shipping_zones` — C10, §4.10                                | +1  | **43**        |

**43 domain tables**, plus the framework tables Laravel and Sanctum own:
`users` (shared — see §4.5), `password_reset_tokens`, `sessions`, `cache`, `cache_locks`,
`jobs`, `job_batches`, `failed_jobs`, `personal_access_tokens`.

Four of the 43 appear in **no** schema specification and are defined by this plan alone:
`settings` (§4.9), `shipping_zones` (§4.10), and — per C11 — `testimonials`
(`src/shared/db/schema.ts:111`) and `newsletter_subscribers` (`:159`), which exist in the
running app but in neither `docs/db-schema/target-schema.md` nor `trash/notes.md`. They
carry no cross-check against a written spec; see §13 R-8.

## §4.3 Type mapping rules

Applied uniformly. The right column is what goes into a Laravel `Blueprint`.

| Drizzle                                                     | Laravel migration                          | Note                                                                 |
| ----------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `varchar('id', {length: 36}).primaryKey().$defaultFn(uuid)` | `$table->uuid('id')->primary();`           | Model gets `HasUuids`, `$incrementing = false`, `$keyType = 'string'` |
| `varchar('x', {length: n})`                                  | `$table->string('x', n)`                   |                                                                       |
| `text('x')` / `mediumtext('x')`                              | `$table->text('x')` / `->mediumText('x')`  |                                                                       |
| `int('x')`                                                   | `$table->integer('x')`                     | Money is always integer minor units — XOF, never a float              |
| `decimal('x', {precision: p, scale: s})`                     | `$table->decimal('x', p, s)`               | Only `rating`, `seo.priority` — never money                           |
| `boolean('x')`                                               | `$table->boolean('x')`                     |                                                                       |
| `timestamp('x')`                                             | `$table->timestamp('x')->nullable()`       |                                                                       |
| `json('x')`                                                  | `$table->json('x')`                        | SQLite stores as TEXT; cast on the model with `'x' => 'array'`        |
| `mysqlEnum('x', [...])`                                      | `$table->string('x', 32)` + a PHP enum cast | **Never a native ENUM** — see below                                  |
| `.references(() => t.id, {onDelete: 'cascade'})`             | `->constrained()->cascadeOnDelete()`       |                                                                       |
| `.references(..., {onDelete: 'set null'})`                   | `->nullable()->constrained()->nullOnDelete()` |                                                                    |
| `primaryKey({columns: [a, b]})`                              | `$table->primary(['a', 'b'])`              |                                                                       |
| `index('n').on(a, b)` / `uniqueIndex(...)`                   | `$table->index([...], 'n')` / `->unique([...], 'n')` |                                                             |
| ``.default(sql`... ON UPDATE CURRENT_TIMESTAMP`)`` | `$table->timestamps()`           | **Never emit `ON UPDATE`** — see below                                |

Two rules exist because of B3 (SQLite in development, MariaDB in production):

- **No native `ENUM`.** SQLite has none. Every one of the target schema's 17
  `mysqlEnum` declarations (`admin_role`, `address_role`, `product_status`, `media_type`,
  `tag_kind`, `twitter_card`, `change_frequency`, `notification_channel`,
  `notification_status`, `stock_movement_reason`, `order_status`, `shipment_status`,
  `gateway_mode`, `gateway_fee_type`, `payment_txn_status`, `loyalty_tier`,
  `loyalty_reason`, `discount_kind`, `quiz_question_type`, `quiz_tier`) becomes
  `string` + a backed PHP enum in `app/Enums/`, cast on the model. This also gives
  Filament its `->options(...)` for free.
- **No `ON UPDATE CURRENT_TIMESTAMP`.** SQLite has no such clause. Eloquent maintains
  `updated_at` in PHP via `$table->timestamps()`, which is portable and is what Filament
  and every Laravel convention expect.

## §4.4 Column-level mapping — the 15 tables that exist today

### `users` — `src/shared/db/schema.ts:6-19`

| Today                         | Becomes                                                  | Note                                                     |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `id varchar(36)`              | `users.id` uuid                                          | unchanged                                                |
| `email varchar(255)` unique   | `users.email` unique                                     | unchanged                                                |
| `password_hash varchar(255)`  | `users.password`                                         | **renamed** — Laravel's `Authenticatable` requires `password`. bcrypt hashes from `bcryptjs` are `$2a$`/`$2b$` and PHP's `password_verify` reads them, but A2 discards all data, so nothing is carried over. |
| `role varchar(32)`            | **dropped**                                              | A4 — `roles` + `role_user` replace it                    |
| `prenom varchar(128)`         | `users.first_name`                                       | French → English, `AGENTS.md:60-64`                      |
| `nom varchar(128)`            | `users.last_name`                                        | idem                                                     |
| `telephone varchar(64)`       | `users.phone` unique                                     | idem; target adds UNIQUE (`target-schema.md:69`)         |
| `avatar_url text`             | → `media` row, `attachable_type = 'user'`                | `target-schema.md:270`                                   |
| `newsletter boolean`          | → `clients.subscribed_at` / `unsubscribed_at`            | `target-schema.md:92-93` — boolean becomes two timestamps |
| `points int`                  | → `loyalty_accounts.current_points`                      | `target-schema.md:568` — denormalised cache becomes a ledger balance |
| `created_at` / `updated_at`   | `$table->timestamps()`                                   |                                                          |
| —                             | `users.verified_at`, `phone_at`, `logout_at`, `archived_at` | new, `target-schema.md:73-76`                         |

> `users.verified_at` is the target's name. Laravel's `MustVerifyEmail` contract expects
> `email_verified_at`. Keep `verified_at` and override `markEmailAsVerified()` on the
> model, or rename — either works; the plan uses `verified_at` because the spec says so.

### `sessions` — `src/shared/db/schema.ts:21-26`

Dropped entirely. Sanctum SPA cookie sessions (C1) use **Laravel's own** `sessions`
table, shipped by `0001_01_01_000000_create_users_table.php` with a different shape
(`payload longText`, `last_activity int`). The opaque 128-char token in
`src/shared/auth/auth.service.ts:7` (`sd_session`, 30-day TTL `:8`) has no successor
column — the cookie becomes Laravel's encrypted session cookie.

### `products` — `src/shared/db/schema.ts:29-54`

| Today                              | Becomes                                                     |
| ---------------------------------- | ----------------------------------------------------------- |
| `id varchar(64)`                   | `products.id` **uuid(36)** — `target-schema.md:172`, `trash/notes.md` D10 |
| `name`, `slug`                     | unchanged                                                   |
| `category varchar(64)`             | → `product_categories` pivot (`target-schema.md:193`)       |
| `price int`, `original_price int`  | → `product_variants.price` / `.compare_price` (`:207-208`)  |
| `images json`                      | → `media` rows, `collection = 'gallery'` (`:270`)           |
| `skin_tones json`                  | → `taggables` with `tag_kind = 'skin_concern'`, **or** an UNKNOWN `skin_tones` table — see §4.8 |
| `badges json`                      | → `taggables` with `tag_kind = 'badge'` (`:249,260`)        |
| `rating decimal(3,1)`              | `products.rating decimal(3,2)` — **precision changes** (`:187`) |
| `review_count int`                 | unchanged (`:188`)                                          |
| `short_description text`           | `products.summary` (`:175`)                                 |
| `description text`                 | `products.description mediumtext` (`:176`) — **also absorbs A0's `results_title`/`results_subtitle`** |
| `benefits json`                    | → `taggables`, or prose inside `description` per A0         |
| `usage text`                       | `products.instructions` (`:177`)                            |
| `ingredients text`                 | unchanged (`:178`)                                          |
| `in_stock boolean`                 | → derived from `inventory_items.on_hand - reserved` (`:371-372`) |
| `stock_qty int`                    | → `inventory_items.on_hand` (`:371`)                        |
| `low_stock_threshold int`          | → `inventory_items.threshold` (`:373`)                      |
| `results_title`, `results_subtitle`| **deleted** — A0                                            |
| `is_new boolean`                   | → `products.new_until timestamp` (`:184`)                   |
| `is_bestseller boolean`            | → `products.bestseller_at timestamp` (`:183`)               |
| —                                  | new: `status`, `published_at`, `featured_at`, `archived_at` (`:179-185`) |

### `orders` — `src/shared/db/schema.ts:57-81`

A1 is the governing decision and it overrides the target schema, which still carries
`discount`/`shipping`/`tax` columns at `target-schema.md:432-435`. Those three columns are
**not built**.

| Today                                                          | Becomes                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `id`, `order_number`                                            | unchanged                                                                      |
| `user_id` → `users.id` `set null`                               | `orders.client_id` → `clients.id` `set null` (`target-schema.md:417`); nullable per A3 |
| `status varchar(32)` default `'confirmed'`                      | `orders.status` string + `OrderStatus` enum, 8 cases (`:404-413`). `'confirmed'` is not one of them — the seeded default becomes `pending_payment` |
| `subtotal int`                                                  | unchanged                                                                      |
| `shipping_cost int`                                             | **deleted** → `order_adjustments` row, `type = 'shipping'` (A1)                |
| `total int`                                                     | unchanged, but now **derived**: `total = subtotal + Σ order_adjustments.amount` |
| `payment_method`, `payment_status`, `payment_reference`, `payment_provider`, `payment_provider_txn_id`, `payment_request_id`, `payment_paid_at` (7 columns) | **all deleted** → `payment_transactions` (`:518`) + `orders.paid_at` (`:445`) |
| `delivery_first_name`, `delivery_last_name`, `delivery_email`, `delivery_phone` | → `order_customers` (A3) — immutable snapshot, written for guests **and** logged-in users |
| `delivery_address`, `delivery_city`, `delivery_country`         | → `addresses` with `addressable_type = 'order'`, `role = 'shipping'` (`:128-152`) |
| `created_at`, `updated_at`                                      | `$table->timestamps()`                                                         |
| —                                                               | new: `currency` default `'XOF'`, `coupon_code`, `notes`, `memo`, `cancelled_at` (`:431,437-439,446`) |

**`order_adjustments`** (A1, new — in no existing spec):

```php
$table->uuid('id')->primary();
$table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
$table->string('type', 32);              // discount | shipping | shipping_discount
$table->integer('amount');               // signed minor units; discounts are negative
$table->string('label', 255)->nullable();
$table->timestamps();
$table->index('order_id');               // A1 asks for this index explicitly
```

`orders.total` is recomputed on every adjustment write. Put that in an `Order::recalculate()`
method on the model, invoked from an `OrderAdjustment` observer — not in a service class
(§5.1).

**`order_customers`** (A3, new — in no existing spec):

```php
$table->uuid('id')->primary();
$table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
$table->string('first_name', 128);
$table->string('last_name', 128);
$table->string('email', 255);
$table->string('phone', 64);
$table->timestamps();
$table->unique('order_id');              // exactly one snapshot per order
```

Filled from `users` at checkout when the buyer is logged in, from the checkout form when
they are a guest. Never updated after the order is placed — that is the whole point
(A3: order immutability, legal invoicing, uniform processing).

### `order_items` — `src/shared/db/schema.ts:83-93`

| Today                        | Becomes                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `id`, `order_id`             | unchanged (`target-schema.md:440-441`)                      |
| `product_id varchar(64)`     | `product_id` uuid, FK, `set null` (`:442`)                  |
| `product_slug varchar(255)`  | → `order_items.snapshot json` (`:448`)                      |
| `name varchar(255)`          | `order_items.product_name` (`:446`)                         |
| `price int`                  | `order_items.unit_price` (`:450`)                           |
| `quantity int`               | unchanged (`:452`)                                          |
| `image_url text`             | → `snapshot json`                                           |
| `shade varchar(64)`          | → `variant_id` + `variant_name` (`:443,447`)                |
| —                            | new: `sku`, `compare_price`, `discount`, `line_total` (`:445,451,453,454`) |

### `reviews` → `product_reviews` — `src/shared/db/schema.ts:96-109` → `target-schema.md:610`

| Today                | Becomes                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `product_id`         | `product_id` uuid, **now NOT NULL** with FK cascade (`:612`)     |
| `author varchar(128)`| `author_name` (`:616`)                                           |
| `city varchar(128)`  | `author_city` (`:617`)                                           |
| `product varchar(255)`, `product_slug varchar(255)` | **deleted** — denormalised duplicates of the FK |
| `rating int`         | unchanged (`:619`)                                               |
| `title varchar(255)` | unchanged (`:620`)                                               |
| `text text`          | `content` (`:621`)                                               |
| `verified boolean`   | `verified_at timestamp` (`:622`)                                 |
| `skin_tone`          | unchanged (`:618`)                                               |
| —                    | new: `variant_id`, `client_id`, `item_id`, `approved_at`, `rejected_at`, `votes_count`, `reply_content` |

### `categories` — `src/shared/db/schema.ts:121-133`

| Today                 | Becomes                                                   |
| --------------------- | --------------------------------------------------------- |
| `id`, `slug`          | unchanged (`target-schema.md:172-174`)                    |
| `label varchar(128)`  | `categories.name` (`:173`)                                |
| `sub_label`           | `categories.description` (`:175`)                         |
| `image text`          | → `media`, `attachable_type = 'category'`                 |
| `href varchar(255)`   | **deleted** — derivable from `slug`                       |
| `icon varchar(64)`    | unchanged (`:176`)                                        |
| `is_quiz boolean`     | **UNKNOWN** — no counterpart in the target schema. Resolve by deciding whether the quiz entry point is a category row or a static route. |
| `order_index int`     | `sort_order` (`:177`)                                     |
| `active boolean`      | `archived_at timestamp` (`:178`) — inverted polarity      |
| —                     | new: `parent_id` self-FK (`:171`)                         |

### `jeko_transactions` → `loyalty_ledger` — `src/shared/db/schema.ts:142-150` → `target-schema.md:576`

| Today                     | Becomes                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `user_id`                 | `account_id` → `loyalty_accounts.id` → `clients.id` (`:578`) — two hops now   |
| `points int`              | `points_delta` (`:579`)                                                       |
| —                         | `balance_after int` NOT NULL (`:580`) — the ledger invariant                  |
| `reason varchar(64)`      | `reason` + `LoyaltyReason` enum, 8 cases (`:551-561`)                          |
| `label varchar(255)`      | `description` (`:584`)                                                        |
| `reference_id`            | `reference_type` + `reference_id` (`:582-583`) — now polymorphic              |

The 20 welcome points written at registration (`src/shared/auth/auth.service.ts:160-179`,
one transaction inserting the user and a `jekoTransactions` row) become a
`loyalty_reason = 'signup_bonus'` ledger entry created by a `Registered` event listener.

### `site_config` and `jeko_config` — `src/shared/db/schema.ts:136-140, 152-156`

Both are `(key varchar(128) PK, value json, updated_at)` key-value stores. Both are
**UNKNOWN** — see §4.8. They have no destination in `target-schema.md`.

### `newsletter_subscribers`, `testimonials`, `quiz_concerns`, `quiz_routines`

| Today                                | Status                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `newsletter_subscribers` (`:159`)    | **Kept as its own table** (C11). Not folded into `clients.subscribed_at`/`unsubscribed_at`: that would only cover subscribers who have an account, and the footer form (`src/shared/layout/footer.tsx:52`) accepts a bare email with no user behind it. |
| `testimonials` (`:111`)              | **Kept** (C11). Distinct from `product_reviews` — a testimonial is not tied to a product. |
| `quiz_concerns` (`:176`)             | → `quiz_options` rows under a `skin_concern` question (`target-schema.md:648`)     |
| `quiz_routines` (`:186`)             | → `quiz_options` rows under a `routine` question (`:648`)                          |
| `quiz_submissions` (`:167`)          | → `quiz_submissions` (`:673`) + `quiz_answers` (`:684`); `skin_tone`/`concern`/`routine` become answer rows, `user_email` becomes `email` |

## §4.5 Framework table collisions

Three names collide between the Laravel skeleton and the target schema. Each needs a
deliberate decision, not a silent overwrite.

| Table       | Laravel's version                                                     | Target's version                            | Resolution                                                      |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `users`     | `id` bigint, `name`, `email`, `password`, `remember_token`, timestamps | `target-schema.md:64` — uuid, `first_name`/`last_name`/`phone`/`verified_at`/… | Rewrite the generated migration in place. Keep the file name so the `0001_01_01_000000` ordering survives. Add `remember_token` — Sanctum's SPA mode and Laravel's session guard both want it, and the target schema omits it. |
| `sessions`  | `id` string PK, `user_id`, `ip_address`, `user_agent`, `payload` longText, `last_activity` int | `target-schema.md:113` — `expires_at`, no payload | **Keep Laravel's.** Drop the target's. The target's table was modelling the hand-rolled `sd_session` scheme, which B1 replaces. |
| `notifications` | Laravel's database-notification table (`make:notifications-table`), used by Filament 5 for its notification bell | `target-schema.md:339` — an outbound-message log with `channel`/`template`/`recipient`/`provider_id` | **Resolved by C13.** The domain table is renamed **`notification_logs`**; `notifications` is left to the framework. This departs from the canonical spec deliberately — see §4.11. |

## §4.6 Migration file ordering

Laravel resolves migrations by filename timestamp; foreign keys mean order matters.
Emit in this sequence:

1. Framework: `0001_01_01_000000` (users/password_reset_tokens/sessions),
   `_000001` (cache), `_000002` (jobs), Sanctum's `2019_12_14_000001`.
2. `roles`, `role_user` (A4) — needed before anything checks a permission.
3. `clients`, `addresses`.
4. `categories`, `products`, `product_categories`, `product_variants`, `attributes`,
   `attribute_values`, `variant_attribute_values`.
5. `tags`, `taggables`, `media`, `seo`, `audit_logs`.
6. `inventory_items`, `stock_movements`.
7. `orders`, `order_customers`, `order_adjustments`, `order_items`, `shipments`,
   `shipment_items`, `order_status_history`.
8. `payment_gateways`, `payment_transactions`, `payment_webhook_logs`.
9. `loyalty_accounts`, `loyalty_ledger`.
10. `coupons`, `product_reviews`.
11. `quiz_questions`, `quiz_options`, `quiz_rules`, `quiz_submissions`, `quiz_answers`.

`categories.parent_id` is a self-referencing FK — add it in a second `Schema::table()`
call inside the same migration, after the create.

## §4.7 Seeders

A2 says fresh install, so seeders are the only source of data. `docs/db-schema/production-seeders.md`
already specifies seven, of which one is blocked:

| #   | Seeder                                              | Spec                            | Status                                                          |
| --- | --------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| 1   | `payment_gateways`                                  | `production-seeders.md:41`      | portable as-is                                                  |
| 2   | super-admin account                                 | `:123`                          | **rewrite** — spec seeds `users` + `admins`; A4 deletes `admins`, so it seeds `users` + `roles` + `role_user` |
| 3   | `attributes`, `attribute_values`                    | `:154`                          | portable                                                        |
| 4   | `categories`                                        | `:180`                          | portable                                                        |
| 5   | `tags`                                              | `:195`                          | portable                                                        |
| 6   | shipping zones                                      | `:216`                          | **unblocked by C10** — seeds `shipping_zones` (§4.10). One open detail: the seed at `:227-233` has two methods for the Abidjan zone; decide one row or two when writing it |
| 7   | `quiz_questions`, `quiz_options`                    | `:242`                          | portable                                                        |
| new | `roles` — the five roles from A4                    | —                               | `super_admin`, `store_manager`, `support_operator`, `warehouse_operator`, `customer` |

The two current seed scripts, `scripts/seed-mariadb.ts` (14 Drizzle call sites) and
`scripts/create-admin-users.ts` (3), are deleted by §9. `ADMIN_EMAILS`
(`src/shared/auth/auth.service.ts:118,153`) and `ADMIN_DEFAULT_PASSWORD` become inputs to
seeder 2 and then disappear as runtime env vars.

Seeders must be idempotent — `production-seeders.md:12` already requires it, and
`updateOrCreate` gives it for free.

## §4.8 UNKNOWNs in this section

| Item                                    | Why unknown                                                                                       | How to resolve                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `jeko_config` destination               | `trash/notes.md:18-22` fans it into `settings` / `loyalty_tiers` / `loyalty_rewards`; none exist   | **Partly resolved by C3** — the `settings` half now has a home. `loyalty_tiers` / `loyalty_rewards` still have no spec |
| `coupon_redemptions`                    | `trash/notes.md:3` proposes it, keyed by phone number; no spec                                     | Decide before `coupons` is built, since `coupons.user_limit` (`target-schema.md:601`) is unenforceable without it |
| `categories.is_quiz`                    | No counterpart                                                                                     | Decide if the quiz is a category                                                    |

## §4.9 `site_config` → `settings` (C3, resolves C3)

`site_config` (`src/shared/db/schema.ts:152-156`) becomes **one `settings` table** in
`./api`, read through a public endpoint. The fan-out proposed at `trash/notes.md:6-16` —
into `categories.hero_*`, `shipping_zones`, `coupons`, `skin_tones` — **does not happen**.

| Column | Type | Note |
| --- | --- | --- |
| `key` | `varchar(191)` primary key | Matches today's lookup shape: `GET /api/config/{key}` (`src/app/api/config/[key]/route.ts`) |
| `value` | `json` | Today's values are already mixed scalars and objects |
| `is_public` | `boolean` | `SettingController@index` and `@show` return only `is_public` rows; Filament edits all of them |
| `updated_at` | timestamp | — |

Consequences that were blocked on O4 and are now unblocked:

- **§7.3** — nine call sites move to `GET /settings/{key}`: the five `categorie/*/page.tsx:16`
  hero lookups, `checkout/page.tsx:65`, `quiz/page.tsx:41`, `payment-band.tsx:73,82`,
  `category.view.tsx:54`, `site-config.util.ts:11`.
- **§7.4** — five server components move to `GET /settings`: `page.tsx:15`,
  `produit/[slug]/page.tsx:4`, `teint/[slug]/page.tsx:5`, and the three `(static)` pages.
- **§4.2** — `settings` joins the table ledger. It is **not** in
  `docs/db-schema/target-schema.md`; C3 adds it.

`is_public` matters. `config/full/route.ts:6` calls `requireAdmin()` today, so the current
code already distinguishes the full config from the public subset. Without the flag, that
distinction is lost and admin-only settings leak through the public endpoint.

Shipping is **not** part of this table. C10 gives it its own — see §4.10.

## §4.10 `shipping_zones` (C10, resolves C10)

`site_config.shipping` (`src/features/site-config/site-config.type.ts:118-121`) becomes one
table. `production-seeders.md:216-221` flagged this as blocking; C10 unblocks it.

Columns are derived from `ShippingOption` (`site-config.type.ts:109-116`), which is what the
front end already renders and what `DEFAULT_SHIPPING` (`site-config.constant.ts:124-136`)
already populates:

| Column | Source | Note |
| --- | --- | --- |
| `id` | `ShippingOption.id` (`:110`) | `varchar(36)` |
| `name` | `ShippingOption.label` (`:111`) | English identifier, French value (`AGENTS.md:59-64`) |
| `description` | `:112` | "Délai 3-5 jours ouvrés" |
| `country` | `production-seeders.md:224-225` | `char(2)`, `'CI'` in both seed rows |
| `cost` | `:113` | **Integer minor units** (§4.3). `DEFAULT_SHIPPING` already uses 2500, not 25.00 |
| `free_from` | `:114` | The tier threshold — free above this subtotal. 25000 today |
| `active` | `:115` | — |
| `sort_order` | — | New; the current shape is an ordered array |

**No `orders.method_id`.** `production-seeders.md:221` proposed one; A1 makes it
unnecessary. Shipping reaches an order as an `order_adjustments` row of type `'shipping'`,
and `orders` carries only `subtotal` and `total`. `shipping_zones` supplies the rate; A1
records what was charged. Keeping both a foreign key and an adjustment row would let them
disagree.

`freeShippingMessage` (`site-config.type.ts:120`) is display copy, not rate data. It goes to
`settings` (§4.9), not here.

**One thing C10 does not cover.** `production-seeders.md:227-233` seeds *two* methods for
the Abidjan zone — "Livraison Express Moto" at 1500 and "Retrait en Boutique / Point Relais"
at 0, with different delay windows. A single row per zone cannot hold two. Either each row
is a zone × method pair and `name` carries the method (which the columns above already
support — `zone-abidjan` simply becomes two rows), or that seeder is rewritten. **Decide when
writing the seeder**, not before; nothing else depends on it.

## §4.11 `notification_logs` (C13, resolves C13)

`target-schema.md:339` names the domain table `notifications`. Laravel's own
`notifications` table — created by `make:notifications-table`, used by Filament 5 for its
notification bell — has the same name and an unrelated purpose. C13 renames the domain table
**`notification_logs`** and leaves `notifications` to the framework.

The two are not variations on a theme:

| | `notifications` (framework) | `notification_logs` (domain) |
| --- | --- | --- |
| Holds | in-app messages to display | a record of outbound sends |
| Written by | `$user->notify()` on the database channel | the WhatsApp / Resend send path |
| Read by | Filament's bell | support, and the send path itself |
| Lifecycle | read / unread | `queued → sent → delivered → failed` |

Columns are `target-schema.md:339-355` unchanged, with `notifiable_type` / `notifiable_id`
kept as-is — they are the polymorphic target, and they still work under the new table name.

**Why it earns its place**, given nothing logs sends today: every failure path in
`whatsapp.service.ts:106,113` and `email.service.ts:53` ends at a console line, and B12
moves those into a queue worker, further from anyone who would read them. Three things need
a row rather than a log line:

- `provider_id` is the handle that lets a delivery callback from Resend or WhatsApp fill in
  `delivered_at`. Without it, delivery status is unknowable.
- `idx_notif_target` on `(notifiable_type, notifiable_id)` answers "have we already sent
  order-shipped for this order?" — which matters because §5.3 turns `orders/notify-shipped`
  into a Filament button a human clicks, and `src/app/api/orders/notify-shipped/route.ts`
  has no double-send guard today (`:18-35` are auth, rate limit, and JSON validity only).
- WhatsApp Cloud API bills per conversation, so an unlogged send loop is an unbilled
  surprise.
