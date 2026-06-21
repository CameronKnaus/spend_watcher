# @spend-watcher/e2e

## Prerequisites

- A **container engine** — either **Podman** (`podman` + `podman-compose`; on macOS also
  `podman machine start`) or **Docker** (`docker` + `docker compose`). The harness auto-detects which
  is installed; force one with `E2E_COMPOSE="podman compose"`. The tests spin a disposable MySQL
  container per run.
- Browsers: `pnpm --filter @spend-watcher/e2e install:browsers` (one-time; downloads Chromium).

## Run

```bash
pnpm test:e2e          # from the repo root
# or, from this folder:
pnpm test              # headless
pnpm test:headed       # watch it in a browser
pnpm test:ui           # Playwright's interactive UI mode
pnpm report            # open the last HTML report
```

That single command brings the database up, starts the api + ui, runs the suite, and tears the
database back down.

## How it fits together

```
Playwright ─┬─ webServer[0]: scripts/db-up.mjs (schema → compose up → poll) → start API  (:4001 → DB :3307)
            ├─ webServer[1]: vite --mode test                                             (UI  :3001 → API :4001)
            └─ globalTeardown: scripts/db-down.mjs (compose down -v)
```

- **Ports** are offset from dev (UI `3001`/API `4001`/DB `3307`) so e2e and your normal
  `pnpm dev` (`3000`/`4000`/`3306`) can run side by side.
- **Database lifecycle** lives in the api `webServer` command, not `globalSetup`. `scripts/db-up.mjs`
  generates a sanitised schema (`scripts/prepare-schema.mjs`, from the canonical
  `api/spendWatcherV1.sql`), brings the container up, and polls until MySQL actually answers a query
  _before_ the api boots — so the api can never start before its database is ready, no matter how
  Playwright orders startup. (Note: `api/spendWatcherV1.sql` is the schema source — if you change the
  DB schema, regenerate it, or the test DB will drift from the code and seeding will fail.)
- **Isolation is per-user, not per-database.** Every test registers its own unique account and seeds
  its own data through the real endpoints (`src/seed.ts`); because the api scopes all data to the
  logged-in username, tests are independent and run fully in parallel against one shared DB. No
  truncation/reset step is needed — each test simply starts as a fresh user.
- **Auth.** `src/fixtures.ts` exposes a pre-authenticated `test`: it registers + seeds a user via the
  api, then copies the `token` cookie into the browser context. Tests that exercise the login/redirect
  flow use the plain `test` from `@playwright/test` instead, to start signed out.

## Config knobs

All ports/urls and the api boot env live in `src/config.ts`. The api env is injected by Playwright and
wins over `api/.env` (dotenv doesn't override real env vars), so the suite is self-contained and needs
no local `.env` — the only override that redirects the api to the test DB is `dbPort=3307`.

## CI notes (not wired up yet)

CI needs a container engine available and the Chromium browser installed (`install:browsers`). No
`.env` is required. `globalTeardown` cleans the container up; `db:down` does it manually if a run is
interrupted.
