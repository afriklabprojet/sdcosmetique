# §11 `.gitignore` spec (R11)

R11: "The repo gets a `.gitignore` adapted to the new three-part layout (root + `api` +
`web`)."

## §11.1 The structural problem with the current file

The current 93-line file was written for a repository whose root **is** the Next.js app.
After the split, that assumption breaks in two opposite directions at once:

**Anchored patterns become wrong.** Six entries are root-anchored with a leading slash:
`/npm-debug.log*` (`:11`), `/test-results/` (`:48`), `/playwright-report/` (`:49`),
`/blob-report/` (`:50`), `/playwright/.cache/` (`:51`), `/.playwright-mcp/` (`:52`). After
R3 moves the app to `./web`, Playwright writes to `web/test-results/`, which
`/test-results/` **does not match**. Those artefacts start getting committed silently.

**Unanchored patterns become too broad.** `.next/` (`:20`), `out/` (`:21`), `build/` (`:22`),
`node_modules/` (`:10`) match at any depth. `build/` in particular is a real collision risk:
it is a plausible directory name inside a Laravel project, and ignoring it there would be
invisible until something went missing.

Neither failure produces an error. Both produce a repository that is quietly wrong.

## §11.2 Three files, not one

The layout gets three `.gitignore` files. This is the standard Laravel + Node arrangement
and it is what makes the anchoring correct in each context.

| File | Owns | Origin |
| --- | --- | --- |
| `.gitignore` | Root-only concerns: `.env.prod`, `trash/`, `graft/`, IDE and OS noise | Rewritten from the current file |
| `api/.gitignore` | Laravel artefacts | **Ships with `composer create-project`** (§3) — do not hand-write it |
| `web/.gitignore` | Next.js artefacts | Derived from the current file's Next and Playwright blocks |

R2's "never hand-scaffolded" applies to `api/.gitignore` exactly as it applies to the rest of
the Laravel skeleton. Composer writes it; §11.4 only records what to *add*.

## §11.3 Root `.gitignore` — full specification

```gitignore
# ==============================================================================
# Graft (local graph cache)
# ==============================================================================
graft/

# ==============================================================================
# Environments & secrets
# ==============================================================================
# R10: .env.prod stays at the repository root and is never committed.
.env
.env.*
!.env.example

# ==============================================================================
# IDEs & system files
# ==============================================================================
.DS_Store
.AppleDouble
.LSOverride
Thumbs.db
ehthumbs.db
.vscode/*
!.vscode/extensions.json
!.vscode/launch.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# ==============================================================================
# Local AI assistant / CLI caches
# ==============================================================================
.claude/
.gemini/
trash/
```

Changes from the current file, each with a reason:

| Change | Reason |
| --- | --- |
| `.env` / `.env.local` / `.env.development.local` / `.env.test.local` / `.env.production.local` / `.env*.local` / `.env.prod` (`:28-34`) collapse to `.env`, `.env.*`, `!.env.example` | Seven patterns to catch what two catch. The negation is what makes B6's `api/.env.example` and `web/.env.example` committable. **This is the one edit where a mistake leaks a secret** — verify with `git check-ignore -v .env.prod` before committing |
| Supabase block (`:39-43`) deleted | §8.6 |
| Next.js block (`:17-22`) moves to `web/.gitignore` | Would match Laravel paths otherwise |
| Playwright block (`:45-54`) moves to `web/.gitignore` | Anchoring; see §11.1 |
| Build-cache block (`:56-61`) splits | `.turbo/`, `.eslintcache`, `*.tsbuildinfo` are Node-only → `web/` |
| `next-env.d.ts` (`:93`) moves to `web/.gitignore` | Next generates it inside `./web` |
| `node_modules/` (`:10`) moves to `web/.gitignore` | With `./web` standalone (B7), there is no root `node_modules/` |
| `.vercel` (`:37`) deleted | Nothing in the repo deploys to Vercel; `bin/deploy.sh:7-9` targets Hostinger. If that changes, it belongs in `web/` |
| `graft/` (`:5`) stays at root | The graph indexes all three parts |
| `trash/` (`:92`) stays at root | Where this plan's working notes live |

`.ignore` (5 lines) re-admits `graft/` to ripgrep and is unrelated to git. It stays at the
root, unchanged.

## §11.4 `api/.gitignore` — additions only

Composer's Laravel skeleton already ignores `/vendor`, `/storage/*.key`, `/public/build`,
`/public/hot`, `/public/storage`, `/bootstrap/cache`, `.env`, `.phpunit.result.cache`,
`/.fleet`, `/.idea`, `/.vscode`, `/.zed`, and `/node_modules`. **Verify this list against
the actual file after scaffolding rather than trusting it** — §3's scaffolding step is where
it is read.

Additions this project needs:

```gitignore
# SQLite development database (B3)
/database/*.sqlite
/database/*.sqlite-journal

# Locally stored media (C12)
/storage/app/public/*
!/storage/app/public/.gitkeep

# Filament
/storage/framework/cache/filament/
```

The SQLite entry follows directly from B3 (SQLite in development, MariaDB in production). It
is the single most likely thing to be committed by accident, because `database/database.sqlite`
is created by the first `php artisan migrate` and looks like a source file.

The media entry is **required** by C12: the local `public` disk means uploads land in
`storage/app/public/`, which must not be committed while its `.gitkeep` must be.

## §11.5 `web/.gitignore` — full specification

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Next.js
.next/
out/
build/
next-env.d.ts

# Testing
test-results/
playwright-report/
blob-report/
playwright/.cache/
.playwright-mcp/
coverage/
.nyc_output/

# Tooling caches
.turbo/
.eslintcache
*.tsbuildinfo

# Environment — the root file already covers .env*, this is belt and braces
.env
.env.*
!.env.example
```

Every leading slash from the root file is dropped. Inside `web/.gitignore` the patterns are
already scoped to `./web`, so anchoring adds nothing and re-creates §11.1's bug if the
directory ever moves again.

`build/` is safe here in a way it is not at the root: `./web` has no PHP.

## §11.6 R10 verification

R10 is the only requirement in this section that has a security consequence. It is already
satisfied today (`.gitignore:34`) and must stay satisfied through the rewrite.

```sh
# All three must print an ignoring rule, not empty
git check-ignore -v .env.prod
git check-ignore -v api/.env
git check-ignore -v web/.env

# These must print NOTHING — the examples have to be committable (B6)
git check-ignore -v api/.env.example
git check-ignore -v web/.env.example

# Nothing sensitive is already tracked
git ls-files | grep -E '\.env' || echo "clean"
```

Run this **immediately after** editing `.gitignore`, before the next `git add`. The
collapse from seven env patterns to two in §11.3 is the kind of change that looks obviously
correct and is worth one command to prove.

## §11.7 Sequencing

`api/.gitignore` cannot be written before §3 scaffolds Laravel — Composer creates it. The
root and `web/` files can be written as soon as R3 moves the app. In practice all three land
in the same phase as the directory move, so that the first commit after the move already has
correct ignore rules and no artefact is ever tracked.

## §11.8 UNKNOWNs introduced by this section

| # | Question | Resolution |
| --- | --- | --- |
| — | Exact contents of Laravel 13's shipped `.gitignore` | Read it after `composer create-project` in §3; do not assume |
