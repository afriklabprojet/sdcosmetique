# M5 — SD domains in the API

**Objective:** add the SD-specific domains missing from the KA schema as new modules, per
the specs already written in [§4](../implementation-plan/04-schema-translation.md). Starts
only after M4 is done (priority rule).

**Depends on:** M2 structure, M3 conventions, M4 gate. **Priority:** 2 — SD additions.

## Modules and tables (one migration per table, schema-builder only)

### Settings — [§4.9, decision C3](../implementation-plan/04-schema-translation.md)

- Table `settings`: `key` varchar(191) PK, `value` json, `is_public` boolean, `updated_at`.
- Public `GET /api/settings` + `GET /api/settings/{key}` returning **public rows only**
  (the `is_public` flag exists to prevent admin-value leaks).
- Admin `admin/settings` index + update.
- Seeder from the current `DEFAULT_SITE_CONFIG` shape in `./web` so the storefront has
  content on a fresh install.
- Backs the Next admin tabs: hero, contenu, faq, legal, branding, marketing, paiement.

### Quiz — [§4.4, §4.6](../implementation-plan/04-schema-translation.md)

- Tables: `quiz_questions`, `quiz_options`, `quiz_rules`, `quiz_submissions`, `quiz_answers`.
  Today's `quiz_concerns`/`quiz_routines` become options under `skin_concern` / `routine`
  questions; enums are strings backed by PHP enums (`quiz_question_type`, `quiz_tier`).
- Public: `GET /api/quiz-questions` (embeds options), `POST /api/quiz-submissions`,
  `GET /api/quiz-submissions/{id}`.
- Admin: `admin/quiz-questions` (+ options), `admin/quiz-submissions` index (analytics feed).

### Loyalty (Jeko) — [§4.4](../implementation-plan/04-schema-translation.md), decision C6

- Tables: `loyalty_accounts` (`current_points`, linked to clients) and `loyalty_ledger`
  (`points_delta`, `balance_after`, `reason` + `LoyaltyReason` enum, `description`,
  polymorphic `reference_*`).
- Signup bonus: `Registered` listener writes a `signup_bonus` ledger row (20 pts).
- Webhook `POST /webhooks/jeko-pay` in the web routes next to KA's cinetpay handler:
  unversioned, raw payload preserved, idempotent by gateway reference, CSRF-exempt with a
  419-regression test — same pattern as the existing cinetpay webhook.
- Account: `GET /api/loyalty-entries` (authenticated customer's ledger).
- Admin: `admin/loyalty/accounts` (members), `admin/loyalty/entries` (transactions),
  `admin/loyalty/adjustments` store (manual point adjustment — a resource, not an RPC),
  `admin/metrics` extension for loyalty stats; Jeko config keys live in `settings`
  (non-public rows).

### Testimonials and reviews — decision C11

- Table `testimonials` (site-wide, not product-tied): public `GET /api/testimonials`,
  admin apiResource.
- Table `product_reviews`: public `GET /api/reviews` + `POST /api/reviews`,
  admin index/update/destroy (moderation for the "avis" tab).

## Tests

- Pest Unit + Feature per module, following the existing module test layout
  (`tests/Feature/<domain>/`). Webhook tests cover idempotency, raw-payload storage, and
  the 419 regression.
- End of milestone: `DB_CONNECTION=mariadb php artisan migrate:fresh --seed` once, to catch
  SQLite-masked schema issues (JSON columns especially).

## Execution (2026-08-31)

Started after the M4 W8 gate (`pnpm build` green; KA storefront journeys on Laravel).

| Module | Public | Admin | Notes |
| --- | --- | --- | --- |
| Settings | `GET /settings`, `GET /settings/{key}` (public rows only) | `GET/PATCH /admin/settings/{key}` | `is_public` hides `jeko`; seeder covers SiteConfig keys |
| Testimonials | `GET /testimonials` (approved) | `admin/testimonials` apiResource | `approved_at` timestamp, not boolean |
| Reviews | `GET /reviews`, `POST /reviews` (pending) | admin index/show/update/destroy | `product_reviews` FK to KA `products`; store takes child/parent **slug** |
| Quiz | `GET /quiz-questions`, `POST /quiz-submissions`, `GET /quiz-submissions/{id}` | `admin/quiz-questions` apiResource (nested options via `Question::syncOptions`), `admin/quiz-submissions` index | Questions `skin_tone` / `skin_concern` / `routine`; rules match `{ slug: value_code }` |
| Loyalty | `GET /loyalty-entries` (auth), `POST /webhooks/jeko-pay` | `admin/loyalty/accounts`, `entries`, `adjustments` store; metrics `loyalty.members` / `points_issued` | Signup bonus 20 pts on `Registered`; HMAC-SHA256 `Jeko-Signature`; extra `loyalty_webhook_logs` table for raw payload + idempotency |

Circular FK migration is last at `2026_01_01_000041_add_circular_foreign_keys.php` (38 domain files). 13 module providers. Full Pest **155** green. MariaDB `migrate:fresh --seed` ran once (JSON columns + quiz/loyalty FKs).

## Definition of Done

- All new tables migrate cleanly on SQLite and MariaDB; seeders provide working defaults.
- Public and admin endpoints answer with stable shapes consumed in M6.
- Full Pest suite green.

## References

- Schema authority: [§4.2–§4.10](../implementation-plan/04-schema-translation.md)
- Endpoint conventions: [§5.1–§5.2](../implementation-plan/05-api-surface.md), M3
- Existing webhook pattern: `api/routes/web/index.php` (cinetpay)
