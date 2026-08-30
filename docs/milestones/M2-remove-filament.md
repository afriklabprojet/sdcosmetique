# M2 — Remove Filament

**Objective:** strip every Filament artifact from the copied API while keeping the `Admin`
model, the `admins` table, and all policies — they authorize the domain API, not just the
panel.

**Depends on:** M1. **Priority:** 1 — KA spine.

## Footprint (verified against the KA source before copy)

- Composer: `filament/filament: ^5.0` (`composer.json:10`) and the
  `@php artisan filament:upgrade` hook in `post-autoload-dump` (`composer.json:63-66`).
- Provider: `App\Providers\Filament\AdminPanelProvider` registered in
  `bootstrap/providers.php:4,10`. No published `config/filament.php`, no Filament entries in
  `config/app.php`.
- ~37 app files: `app/Providers/Filament/`, `app/Shared/Filament/`
  (`TranslationRepeater`, `TranslationsRelationManager` — used only inside Filament
  resources), and `app/Modules/{Accounts,Catalog,Content,Leads,Orders,Payments,Shopping}/Filament/`
  (Identity has none).
- Module providers expose `filamentResources()` / `filamentWidgets()` hooks — base defaults
  in `app/Shared/Modules/ModuleServiceProvider.php:29-40`, overridden in the 7 module
  `Providers/ModuleServiceProvider.php` files.
- `app/Models/User.php` implements `Filament\Models\Contracts\FilamentUser` with
  `canAccessPanel()` delegating to `administrator()`.
- Published assets: `public/{js,css,fonts}/filament/`.
- Tests: `tests/Feature/web/admin-panel-test.php` (entirely Filament) and one clause in
  `tests/Feature/infrastructure/boundaries-test.php:12-36` (forbids mixed Http + Filament
  imports).

## Tasks

1. `composer remove filament/filament`; delete the `filament:upgrade` line from
   `post-autoload-dump`.
2. Delete `app/Providers/Filament/`, `app/Shared/Filament/`, every `app/Modules/*/Filament/`
   directory, and `public/{js,css,fonts}/filament/`.
3. Remove the `AdminPanelProvider` import and registration from `bootstrap/providers.php`.
4. Remove `filamentResources()` / `filamentWidgets()` (and their Filament imports) from the
   base `app/Shared/Modules/ModuleServiceProvider.php` and the 7 module providers.
5. `app/Models/User.php`: drop the `FilamentUser` contract, the `Panel` import, and
   `canAccessPanel()`. **Keep** `administrator()` and the `admin()` relation.
6. Delete `tests/Feature/web/admin-panel-test.php`; rewrite the Filament clause out of
   `tests/Feature/infrastructure/boundaries-test.php`.
7. Do **not** touch: `app/Modules/Identity/Models/Admin.php`, the
   `2026_01_01_000003_create_admins_table.php` migration, `AdminSeeder`, or any policy.

## Definition of Done

- `rg -i filament api/app api/tests api/config api/bootstrap api/composer.json` returns
  nothing.
- `composer install` runs clean (no missing `filament:upgrade` script).
- Full Pest suite green.
- `GET /admin` now 404s; the JSON API surface is unchanged (`php artisan route:list`
  before/after diff shows only `/admin*` routes removed).

## References

- KA panel provider: `app/Providers/Filament/AdminPanelProvider.php:31-51` (resource/widget
  aggregation being removed)
- Old Filament plan (replaced): archived `trash/ka-pivot/implementation-plan/06-filament-admin.md`
