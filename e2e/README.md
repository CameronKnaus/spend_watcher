# @spend-watcher/e2e

## Prerequisites

- A **container engine** — either **Podman** (`podman` + `podman-compose`; on macOS also
  `podman machine start`) or **Docker** (`docker` + `docker compose`). The harness auto-detects which
  is installed; force one with `E2E_COMPOSE="podman compose"`. The tests spin a disposable MySQL
  container per run.
- Browsers: `pnpm --filter @spend-watcher/e2e install:browsers` (one-time; downloads Chromium).

## Run

```bash
pnpm test:e2e          # from the repo root — everything (browser + api)
pnpm test:api          # from the repo root — the browser-less api project only
# or, from this folder:
pnpm test              # headless
pnpm test:api          # api project only (fast; no browser)
pnpm test:headed       # watch it in a browser
pnpm test:ui           # Playwright's interactive UI mode
pnpm report            # open the last HTML report
```

That single command brings the database up, starts the api + ui, runs the suite, and tears the
database back down.

## Two kinds of tests

This package runs **two** flavors under one Playwright config, split by project:

- **Browser tests** (`tests/**`, excluding `tests/api/`) — the `chromium` + `mobile-chrome`
  projects drive the real UI. One journey per spec.
- **API integration tests** (`tests/api/**`) — the `api` project, which has **no browser**. They
  hit the api directly with Playwright's `APIRequestContext`, asserting status codes, response
  bodies, and DB side-effects. This is where backend-only concerns live that the UI structurally
  can't cover: unauthenticated-access (401) sweeps, cross-tenant isolation (one user can't touch
  another's data), input-validation 400s, and read-endpoint aggregation math.

The `api` project is browser-less, so it doesn't triple-run per device; the two browser projects
`testIgnore` `tests/api/**` so those specs run exactly once.

### Writing an api test

- Import `apiTest` from `src/apiFixtures.ts` (aliased `as test`). It registers a fresh user and
  gives you an **authenticated** `api` request context (its cookie jar carries the `token` cookie
  from `/auth/register`). No baseline data is seeded — api specs assert exact numbers, so each test
  creates precisely the data it reads back. For tenant-isolation tests, the `otherApi` fixture is a
  second independently-registered user.
- Type payloads and responses with the contract (`@spend-watcher/contract`, a workspace devDep):
  `AppInputs['spending']['discretionaryAdd']`, `SpendingDetailsResponse`, etc. Category fields use
  the `SpendingCategory` / `AccountCategory` enums, not raw strings.
- `src/apiHelpers.ts` has `getJson<T>()` (throws with the server body on non-2xx) and
  `currentMonthRange()`; `src/seed.ts` has `post()` (also throws on non-2xx) and `ymd()`.
- Auth endpoints (`register`/`login`/`verify`) are the one place to use a raw context instead of the
  fixture — see `tests/api/auth.spec.ts` — so each test controls its own signed-in/out state.

> Note on cross-tenant writes: the api scopes mutations by username, so a non-owner's write is a
> silent no-op (200), not an error. Isolation tests therefore assert on the **effect** (the owner's
> data is untouched), not on a status code.

## How it fits together

```
Playwright ─┬─ webServer[0]: scripts/db-up.mjs (schema → compose up → poll) → start API  (:4001 → DB :3307)
            ├─ webServer[1]: vite --mode test                                             (UI  :3001 → API :4001)
            ├─ project 'api':           tests/api/**      (APIRequestContext → API :4001, no browser)
            ├─ project 'chromium':      tests/** \ api    (Desktop Chrome    → UI :3001)
            ├─ project 'mobile-chrome': tests/** \ api    (Pixel 5           → UI :3001)
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
