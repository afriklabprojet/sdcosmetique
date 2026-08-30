# db-schema — post-pivot standing

These documents predate the 2026-08-30 pivot (see [docs/milestones/](../milestones/README.md)):
the schema is no longer built from scratch to this target — the copied KA schema is the
base, and only the SD-specific modules are added on top (milestone
[M5](../milestones/M5-sd-domains.md)).

| File | Standing |
| --- | --- |
| [target-schema.md](target-schema.md) | **Superseded as overall schema authority.** Retained because [§4 schema translation](../implementation-plan/04-schema-translation.md) builds on it and it remains the base spec for the SD modules M5 adds (quiz, loyalty, settings, testimonials, reviews). Everything the KA schema already covers (identity, catalog, orders, payments, RBAC ideas) is dead as written. |
| [production-seeders.md](production-seeders.md) | **Retained as seed-content reference.** The reference data (category taxonomy, skin tones/attributes, CI delivery zones, quiz questions, initial admin) feeds the M1/M5 Laravel seeders. Its Drizzle/TypeScript framing and its link to a nonexistent milestone file are obsolete; the idempotence rule carries over to the Laravel seeders. |

`DATABASE_ARCHITECTURE_FR.md` (French narrative of the abandoned 44-table target, including
RBAC and Filament) was archived to `trash/ka-pivot/db-schema/` on 2026-08-30.
