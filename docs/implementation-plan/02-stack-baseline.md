# §2 Verified stack baseline

Everything below was verified on **2026-08-25** against a manifest in this repo, the
Packagist v2 metadata API, or an official page fetched that day. Nothing is recalled.

## §2.1 Local toolchain — actually installed on this machine

| Tool     | Version reported                                              |
| -------- | ------------------------------------------------------------- |
| PHP      | `8.5.9` (cli, NTS, built 2026-07-28)                          |
| Composer | `2.10.2`                                                      |
| Node     | `26.7.0`                                                      |
| pnpm     | `11.22.0`                                                     |
| MariaDB  | `11.8.8` (client 15.2)                                        |
| SQLite   | `3.53.4`                                                      |
| gpg      | `2.4.9` (GnuPG)                                               |

B4 asks for `"php": "^8.5"`; the machine already runs 8.5.9, so the constraint is
satisfiable locally today. Whether the production host runs PHP 8.5 is **UNKNOWN** —
resolve by running `php -v` on the target host once B8 is decided.

## §2.2 PHP support window

Fetched from `https://www.php.net/supported-versions.php`:

| Branch | Initial release | Active support until | Security support until |
| ------ | --------------- | -------------------- | ---------------------- |
| 8.3    | 23 Nov 2023     | 31 Dec 2025          | 31 Dec 2027            |
| 8.4    | 21 Nov 2024     | 31 Dec 2026          | 31 Dec 2028            |
| 8.5    | 20 Nov 2025     | 31 Dec 2027          | 31 Dec 2029            |

8.5 is the only branch still in *active* support past 2026. B4 picks the longest runway.

## §2.3 PHP packages

Constraints quoted verbatim from `https://repo.packagist.org/p2/<vendor>/<package>.json`.

| Package                       | Latest    | Its own `require`                                                        |
| ----------------------------- | --------- | ------------------------------------------------------------------------ |
| `laravel/framework`           | `v13.29.0`| `"php": "^8.3"`                                                          |
| `laravel/laravel` (skeleton)  | `v13.10.1`| `"php": "^8.3"`, `"laravel/framework": "^13.17"`, `"laravel/tinker": "^3.0"` |
| `filament/filament`           | `v5.7.6`  | `"php": "^8.2"` + eight `self.version` sub-packages                       |
| `filament/support`            | `v5.7.6`  | `"illuminate/contracts": "^11.28|^12.0|^13.0"`, `"livewire/livewire": "^4.1"` |
| `livewire/livewire`           | `v4.4.2`  | `"php": "^8.1"`, `"illuminate/support": "^10.0|^11.0|^12.0|^13.0"`        |
| `laravel/sanctum`             | `v4.3.3`  | `"php": "^8.2"`, `"illuminate/support": "^11.0|^12.0|^13.0"`             |
| `laravel/pint`                | `v1.30.5` | `"php": "^8.3.0"`                                                        |
| `pestphp/pest`                | `v5.1.3`  | `"php": "^8.4"`                                                          |
| `laravel/tinker`              | `v3.0.2`  | `"php": "^8.1"`                                                          |

Three conclusions that matter:

1. **Filament 5 supports Laravel 13.** `filament/support` v5.7.6 requires
   `illuminate/contracts: ^11.28|^12.0|^13.0`. Confirmed by constraint, not by changelog.
2. **`^8.3` includes 8.5** (Composer caret is `>=8.3.0 <9.0.0`), so B4's `"php": "^8.5"`
   is compatible with every package above. Pest's `^8.4` floor is the highest of the set
   and is also satisfied.
3. **Filament 5 pulls Livewire 4.** That means Blade + Livewire assets are served from
   `./api`, which is why B2 puts the panel there and not in `./web`.

The skeleton's `require-dev` at v13.10.1 is `fakerphp/faker ^1.23`, `laravel/pail ^1.2.5`,
`laravel/pao ^1.0.6`, `laravel/pint ^1.27`, `mockery/mockery ^1.6`,
`nunomaduro/collision ^8.6`, `phpunit/phpunit ^12.5.12`. Pest replaces PHPUnit's runner
in §3.4; PHPUnit stays as Pest's engine.

## §2.4 JavaScript packages — what `./web` inherits unchanged

| Package                 | Constraint  | Cite                 |
| ----------------------- | ----------- | -------------------- |
| `next`                  | `16.2.11`   | `package.json:39`    |
| `react` / `react-dom`   | `19.2.4`    | `package.json:40-41` |
| `@tailwindcss/postcss`  | `^4`        | `package.json:47`    |
| `bcryptjs`              | `^3.0.3`    | `package.json:34`    |
| `jose`                  | `^6.2.10`   | `package.json:37`    |
| `drizzle-orm`           | `^0.45.2`   | `package.json:35`    |
| `drizzle-kit`           | `^0.31.10`  | `package.json:53`    |
| `mysql2`                | `^3.23.4`   | `package.json:38`    |
| `@upstash/ratelimit`    | `^2.0.8`    | `package.json:32`    |
| `@upstash/redis`        | `^1.38.2`   | `package.json:33`    |

`engines.node: ">=20.0.0"` (`package.json:6`) contradicts `.nvmrc` (`24`) and the
installed Node 26.7.0. §9.4 reconciles them.

Of these, §9 removes `drizzle-orm`, `drizzle-kit`, `mysql2` and `bcryptjs`; §8 removes
`@upstash/ratelimit` and `@upstash/redis` (B11); `jose` is a **declared dependency with
zero imports anywhere in `src/`** and is removed as dead weight.

## §2.5 `.env.prod` is not a dotenv file

```
$ file .env.prod
.env.prod: PGP symmetric key encrypted data - AES with 256-bit key salted & iterated - SHA512
```

Six lines of binary. No process in the repo reads it, and no script decrypts it. This
invalidates any plan step that treats it as a source of `KEY=value` lines. See open
C9 — it is left exactly as it is, consumed by nothing in the repository.

## §2.6 Zero Supabase runtime

`package.json:31-58` contains no `@supabase/*` package, and
`grep -rn "@supabase" src scripts tests bin middleware.ts server.js` returns nothing.
Auth is already hand-rolled (`src/shared/auth/auth.service.ts`), storage is already local
disk (`src/app/api/upload/route.ts:75-81`), and the database is already MariaDB
(`drizzle.config.ts:6`, `mysql2`). R7 is therefore mostly a deletion of dead files and
stale strings — see §8.
