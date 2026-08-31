# M6 — Next wiring: SD surfaces

**Objective:** rewire everything left on Drizzle — the SD-dependent admin tabs and
storefront pages — so that no code path in `./web` reaches a database, and only two Next
API routes survive.

**Depends on:** M4, M5. **Priority:** 2 — SD additions.

## Admin tabs rewired in this milestone

| Tab(s) | Endpoint(s) | Replaces |
| --- | --- | --- |
| hero, contenu, faq, legal, branding, marketing, paiement | `admin/settings` | `saveSiteConfigSection` in `admin-actions.ts`, `GET /api/config/full` |
| quiz | `admin/quiz-questions`, `admin/quiz-submissions` | `quiz.repository.ts`, quiz analytics card |
| jeko | `admin/loyalty/*`, `admin/settings` (config keys) | `web/src/app/api/admin/jeko/*` handlers, `jeko-admin.repository.ts` |
| avis | `admin/reviews` | `review.repository.ts` |
| temoignages | `admin/testimonials` | `testimonial.repository.ts` |

Delete each replaced handler, repository, and server action in the same change. After this
table, `web/src/app/api/admin/` and `admin-actions.ts` are gone entirely.

## Storefront call sites rewired in this milestone

The remaining [§7.4–§7.5](../implementation-plan/07-web-rewiring.md) sites: home page
settings/testimonials blocks, static legal pages (`GET /settings`), `/quiz`
(`quiz-questions` + `quiz-submissions`), `/avis` (`reviews`), loyalty display in `/compte`
(`loyalty-entries`), and any `config/{key}` fetch → `settings/{key}`.

## Next route cleanup

- Only `web/src/app/api/revalidate/route.ts` and `web/src/app/api/csp-report/route.ts`
  survive (§7.8). `revalidate` is called by Laravel after admin writes, authenticated by a
  shared `REVALIDATE_SECRET`; add the corresponding call in the API's admin write paths (or
  a model-observer hook) for products, categories, banners, pages, and settings.
- Rate-limit the two survivors in Next middleware with `rate-limiter-flexible` (C4);
  middleware matcher covers exactly `/admin/*` (auth redirect) plus these two paths.
- Delete every hardcoded data fallback (`PRODUCTS`, `DEFAULT_SITE_CONFIG`, …) per §7.6 —
  errors must surface, not mask a dead API.

## Definition of Done

- `rg "from '@/shared/db'|drizzle-orm" web/src web/scripts` → only `web/src/shared/db/`
  itself remains (deleted in M7, per the §9.9 ordering: prove unreached first, delete after).
- Every admin tab works against the API; `web/src/app/api/` contains exactly `revalidate`
  and `csp-report`.
- Editing a product, a setting, and a banner in the admin visibly updates the storefront
  (revalidation flow proven).
- E2E smoke in a browser with a clean console: home → boutique → produit → quiz → checkout
  → compte → every admin tab.
- `pnpm build` succeeds.

## Execution (2026-08-31)

Started after the M5 gate (Pest 155 green; quiz/loyalty/settings modules in `./api`).

| Surface | Laravel | Replaces |
| --- | --- | --- |
| Admin settings tabs (hero, contenu, faq, legal, branding, marketing, paiement) | `GET/PATCH /admin/settings/{key}` | `saveSiteConfigSection`, `GET /api/config/full` |
| Quiz tab + analytics + `/quiz` | `admin/quiz-questions`, `admin/quiz-submissions`, `POST /quiz-submissions` | Drizzle `quiz.repository.ts`, `GET /api/quiz/*` |
| Jeko tab + `/compte` loyalty | `admin/loyalty/*`, `GET/POST /loyalty-entries` | `web/src/app/api/admin/jeko/*`, Drizzle `jeko.repository.ts` |
| Avis tab + `/avis` | `admin/reviews`, `GET /reviews` | Drizzle `review.repository.ts`, `GET /api/reviews` |
| Témoignages tab + home | `admin/testimonials`, `GET /testimonials` | leftover Next config fetches |
| Storefront settings | `GET /settings/{key}` | `GET /api/config/{key}` |
| Uploads | `POST /admin/media` | `POST /api/upload` |

`web/src/app/api/` now contains only `revalidate/route.ts` and `csp-report/route.ts`. Middleware rate-limits those two with `rate-limiter-flexible@11.2.0`. Laravel observers (`RevalidatesStorefront`) POST storefront tags after product/category/banner/page/setting writes.

`pnpm build` green (43 routes; the two survivors are ƒ). `rg "from '@/shared/db'|drizzle-orm" web/src` hits only `web/src/shared/db/` — `web/scripts/*` stay until M7 per §9.9.

Smoke follow-up (same day): Fortify login/register/logout now always return JSON (browser `fetch` was following a 302 to `GET /` and 404ing). The quiz posts Laravel `value_code`s from `/quiz-questions` instead of hardcoded `SKIN_TONES` ids. `WEB_REVALIDATE_SECRET` is wired to match `web` `REVALIDATE_SECRET` so observers can bust ISR.

## References

- Rewiring ledger and survivors: [§7.3–§7.8](../implementation-plan/07-web-rewiring.md)
- Deletion ordering rule: [§9.9](../implementation-plan/09-drizzle-removal.md)
