# §1 Target repo layout

R4: at the end, only AI-related markdown and root-level config remain at the root.
`docs/` also stays at the root.

## §1.1 Before — root today

Verbatim `ls -A`, 2026-08-25, 46 entries.

```
AGENTS.md          .env.example    .ignore              pnpm-lock.yaml       supabase
bin/               .env.local      .mcp.json            pnpm-workspace.yaml  tests/
.claude/           .env.prod       middleware.ts        postcss.config.mjs   todo.md
CLAUDE.md          eslint.config.mjs  .next/            public/              trash/
docs/              .gemini/        next.config.ts       README.md            tsconfig.json
drizzle/           GEMINI.md       next-env.d.ts        scripts/             tsconfig.tsbuildinfo
drizzle.config.ts  .git/           node_modules/        server.js            .vscode/
ecosystem.config.js .github/       .npmrc               src/
                   .gitignore      .nvmrc               .playwright-mcp/
                   graft/          opencode.json        playwright.config.ts
                                   package.json
```

`.mcp.json` and `opencode.json` are already staged for deletion (`git status` → `D`).

## §1.2 After

```
.
├── AGENTS.md                 # R8 — rewritten, see §10
├── CLAUDE.md                 # unchanged, points at AGENTS.md
├── GEMINI.md
├── README.md                 # B9 — rewritten to describe the three-part repo
├── todo.md
├── .claude/  .gemini/  .vscode/  .github/  graft/  trash/
├── .git/  .gitignore  .ignore   # R11 — see §11
├── .env.prod                 # R10 — PGP blob, git-ignored, stays at root
├── docs/                     # R4 — stays at root
│   ├── db-schema/
│   └── implementation-plan/  # this directory
│                             # D1 emptied the rest
│
├── api/                      # R1, R2 — created by composer create-project
│   ├── app/  bootstrap/  config/  database/  public/  resources/  routes/
│   ├── storage/  tests/  vendor/
│   ├── .env  .env.example    # B5, B6
│   ├── composer.json  composer.lock
│   └── README.md             # B9
│
└── web/                      # R3 — git mv of the Next.js app
    ├── src/  public/  tests/
    ├── .env  .env.example    # B5, B6
    ├── .npmrc  .nvmrc
    ├── eslint.config.mjs  postcss.config.mjs
    ├── middleware.ts  next.config.ts  next-env.d.ts
    ├── package.json  pnpm-lock.yaml
    ├── playwright.config.ts  tsconfig.json
    ├── server.js
    └── README.md             # B9
```

## §1.3 Disposition of every root entry

| Entry                                                        | Destination                | Basis                                                              |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------ |
| `AGENTS.md` `CLAUDE.md` `GEMINI.md` `todo.md`                 | root                       | R4 — AI markdown                                                   |
| `.claude/` `.gemini/` `.vscode/` `.github/` `graft/` `trash/` | root                       | tooling; `.claude/` `.gemini/` `trash/` ignored `.gitignore:90-92` |
| `docs/`                                                       | root                       | R4, explicit                                                        |
| `.git/` `.gitignore` `.ignore`                                | root                       | R11                                                                 |
| `.env.prod`                                                   | root                       | R10; `.gitignore:34`                                                |
| `README.md`                                                   | root, rewritten            | B9 — plus a new one in each of `api/` and `web/`                    |
| `.env.example`                                                | **split**                  | B6 → `api/.env.example` + `web/.env.example`; root copy deleted     |
| `.env.local`                                                  | → `web/.env`               | B5; server-only keys move to `api/.env`. Ignored `.gitignore:29`    |
| `src/` `public/` `tests/`                                     | `web/`                     | R3, `git mv`                                                        |
| `middleware.ts` `next.config.ts` `next-env.d.ts` `server.js`  | `web/`                     | R3                                                                  |
| `package.json` `pnpm-lock.yaml` `.npmrc` `.nvmrc`             | `web/`                     | R3                                                                  |
| `tsconfig.json` `eslint.config.mjs` `postcss.config.mjs`      | `web/`                     | R3                                                                  |
| `playwright.config.ts`                                        | `web/`                     | R3; `:7` `testDir: './tests'` and `:59-63` `pnpm dev` still resolve |
| `pnpm-workspace.yaml`                                         | **delete**                 | B7 — its whole body (`:8-12`) blocks `esbuild`, which arrives only via `drizzle-kit` |
| `drizzle/` `drizzle.config.ts`                                | **delete**                 | R6 — see §9                                                         |
| `supabase/` (35 files)                                        | **delete**                 | R7 — see §8                                                         |
| `scripts/create-admin-users.ts` `scripts/seed-mariadb.ts`     | **delete**                 | R6 — replaced by Laravel seeders, §4.7                              |
| `scripts/setup-jeko-africa.js`                                | **delete**                 | B12 — Jeko provisioning moves to an Artisan command                 |
| `scripts/reorganize-admin-tabs.mjs`                           | **delete**                 | one-shot codemod against `src/app/admin/**`, which B2 deletes       |
| `bin/deploy.sh` `ecosystem.config.js`                         | **UNKNOWN**                | B8 defers deploy. Neither can host PHP as written (§13 R7)          |
| `.next/` `node_modules/` `.playwright-mcp/` `tsconfig.tsbuildinfo` | regenerated in `web/` | build output, ignored                                               |
| `.mcp.json` `opencode.json`                                   | already deleted            | `git status` → `D`                                                  |

**Nothing at the root moves into `./api`.** R2 — `./api` is created fresh by Composer,
never hand-scaffolded and never copied from another Laravel project.

## §1.4 Two `docs/` files that R4 and R7 pull in opposite directions

`docs/supabase-full-migration.sql` and `docs/supabase-schema.sql` sat under `docs/`,
which R4 pins to the root, but they are Supabase artefacts, which R7 deletes.
**Already resolved — both are deleted (D1), along with the rest of `docs/` except this plan
and `db-schema/`.** That includes `docs/mockups/*.html` (9 files), which B10 had kept; D1
supersedes B10 on that point. The deletions are staged in git, so history retains them.
