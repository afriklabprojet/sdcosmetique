<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->

## Repository layout

This repository has three parts. They do not share a package manager, a
dependency tree, or a test runner.

| Path      | What it is                              | Toolchain           |
| --------- | --------------------------------------- | ------------------- |
| `./api`   | Laravel 13 JSON API                     | Composer, artisan   |
| `./web`   | Next.js 16 storefront + `/admin`        | pnpm                |
| `./`      | AI markdown, `docs/`, root config       | none                |

`./web` has **no database access of any kind** — no driver, no ORM, no
credentials. Every read and write goes through `./api` over HTTP. If you find
yourself adding a database client to `./web`, stop: that is the one structural
rule this repository has.

Administration lives in `./web` at `/admin` and talks to `/api/admin/*`. There
is no Filament. Admin authorization is an active row in the `admins` table, not
cookie presence.

## Workspace Preferences

### Package managers — two, scoped by directory

Never run a package command from the repository root. There is no root
package.json and no root composer.json.

**`./api` — Composer + artisan**
- Install: `composer install`
- Dev server: `php artisan serve`
- Migrate: `php artisan migrate`
- Seed: `php artisan db:seed`
- Test: `php artisan test` (Pest)

**`./web` — pnpm**
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Test: `pnpm test`

### Command-line Tools
- **Prioritize Rust-based alternatives** for performance:
  - Use `rg` (ripgrep) instead of `grep` for searching file contents.
  - Use `fd` instead of `find` for finding files.
  - Use `graft` commands (`graft map`, `graft ask`, etc.) for codebase orientation and semantic searches.

### Language
- **Write everything in English** — code identifiers, comments, commit messages,
  documentation, logs, tests, branch names, and internal error/debug strings.
- **The only exception is customer-facing copy**: text actually rendered to the
  end user (UI labels, page content, emails, user-visible error messages).
  Keep that in the site's language, and keep it out of identifiers — put it in
  i18n resources or content files, not hardcoded in logic.

## Conventions

**Routing is CRUDdy by Design.** Controllers expose only `index`, `create`,
`store`, `show`, `edit`, `update`, `destroy`. If an action does not fit, it is a
new resource, not a new method. No `XxxService` or `XxxManager` classes.

**Strict schema adherence.** Always respect the exact Laravel database schema
column names and API payload field names. Never rename or alter schema columns
or payload keys, even if a user prompt or refactoring suggestion proposes different naming.

**No hardcoded magic strings or static lists.** Never hardcode lists of
methods, gateway identifiers, statuses, or domain values directly into controllers,
form requests, or business logic. Use backed Enums (PHP backed enums / TypeScript
enums) or configuration files (`config(...)`).

**Money is integer minor units.** XOF, never a float, never a decimal column.

**Orders snapshot the customer.** `orders` carries `email` and `destination`
JSON plus `subtotal` and `total` in minor units. There is no `order_customers`
or `order_adjustments` table.

**Admins, not an allow-list.** There is no `ADMIN_EMAILS` env var. Authorisation
is an active (non-revoked) row in `admins` for the signed-in user.
