# Database migrations

Schema changes are managed with [dbmate](https://github.com/amacneil/dbmate) — versioned, plain-SQL
migration files in `api/db/migrations/`. dbmate is installed as a devDependency of
`@spend-watcher/api`; no global install needed.

## How it works

Each migration is one `.sql` file named `<timestamp>_<description>.sql` containing an
`-- migrate:up` section (the change) and a `-- migrate:down` section (how to undo it). dbmate keeps
a `schema_migrations` table in the database recording which files have been applied, so `db:migrate`
runs only the pending ones, in timestamp order. The same files run against dev, the e2e container,
and prod — that is the point: every environment reaches the same schema by replaying the same
ordered history, instead of by hand-run `ALTER`s that drift apart.

The first file, `20260709000000_baseline_prod_schema.sql`, is a snapshot of the production schema
taken 2026-07-09. It is special: every statement is guarded (`IF NOT EXISTS`) so it no-ops on
databases that already had the schema before migrations existed. That is how prod and dev adopted
migrations without being rebuilt. **No migration after the baseline should use those guards** — a
normal migration should fail loudly if the database is not in the state it expects.

## Commands (from repo root or `api/`)

| Command              | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `pnpm db:new <name>` | Create an empty timestamped migration file               |
| `pnpm db:migrate`    | Apply pending migrations (creates the DB if missing)     |
| `pnpm db:status`     | List applied/pending migrations                          |
| `pnpm db:rollback`   | Undo the most recent migration (runs its `migrate:down`) |

Connection comes from `DATABASE_URL` in `api/.env`, which points at the **dev** database. dbmate
reads that file itself; a `DATABASE_URL` set in the shell takes precedence over it.

## Making a schema change

1. `pnpm db:new add_currency_to_spend_transactions` — describe the change, not the ticket.
2. Write the `up` SQL and the matching `down` SQL in the generated file.
3. `pnpm db:migrate` against dev; check the app; `pnpm db:rollback` then `db:migrate` again to
   prove the down path works.
4. Update `api/spendWatcherV1.sql` to match (it bootstraps the e2e container — see
   `e2e/scripts/prepare-schema.mjs`) and run the e2e suite.
5. Commit the migration file together with the code that uses the new schema.

Rules that keep history trustworthy:

- **Never edit a migration that has been applied anywhere but your machine.** Applied means
  recorded in someone's `schema_migrations`; editing the file breaks the "same history everywhere"
  guarantee. Fix mistakes with a new migration.
- **One logical change per migration.** Small files are easy to review and easy to roll back.
- **Write the `down` even though prod will likely never run it.** It documents the inverse and
  makes local iteration (rollback → tweak → re-migrate) cheap.
- **Prefer additive changes.** The deployed app keeps running while a migration applies, so the old
  code must tolerate the new schema (add a nullable column, backfill, then tighten — rather than
  rename in place).

## Running against prod

Prod is opt-in and explicit — the prod URL is never stored in `.env`. Always dry-check first:

```sh
DATABASE_URL="mysql://admin:<password>@spend-watcher-db.cowia1uqsbs9.us-east-1.rds.amazonaws.com:3306/user_information" pnpm db:status
DATABASE_URL="mysql://admin:<password>@spend-watcher-db.cowia1uqsbs9.us-east-1.rds.amazonaws.com:3306/user_information" pnpm db:migrate
```

The first prod `db:migrate` will create `schema_migrations` and record the baseline; the guarded
baseline makes no schema changes to prod (verified against a copy before adoption). For anything
destructive (dropping/renaming columns or tables), take an RDS snapshot first.
