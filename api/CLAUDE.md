# API architecture

New code follows a three-layer pattern under `src/modules/<domain>/`, one file per layer:

- **`*.controller.ts`** (HTTP) — routes, request validation (zod), auth/identity, response shaping. No DB.
- **`*.service.ts`** (business logic) — orchestration and rules. No DB; calls repositories.
- **`*.repository.ts`** (data) — the only layer that touches the DB. Owns SQL and maps DB rows → camelCase domain types.
- **`*.types.ts`** — the domain types; raw SQL row types stay internal to the repo.

## Rules

- **Import direction is one-way:** controller → service → repository. Never sideways or backward.
- **The repository is the only consumer of `@lib/db`.** Use `@lib/queryAsync` with `?`-bound params — never string-interpolate values into SQL.
- **The mapping boundary is the repo.** snake_case SQL row shapes must not leak past it; everything above sees camelCase domain types.

## Reference slice

`modules/trips/trips.*` is the canonical example — copy its structure for new work.
