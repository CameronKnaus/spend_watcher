# Spend Watcher

A personal spending and savings tracker. Monorepo containing the React frontend and Node/Express backend, with shared TypeScript, Prettier, and ESLint config at the root.

## Structure

```
spend_watcher/
├── api/                # Node + Express + TypeScript backend
├── ui/                 # React + Vite + TypeScript frontend
```

## Initial setup

```sh
nvm use         # or install Node 22 manually
pnpm install    # installs both workspace packages from the root
```

Then create `api/.env` with database credentials and JWT settings — see [`api/ReadMe.md`](./api/ReadMe.md) for the required keys.

## Running locally

From the repo root:

```sh
pnpm dev        # starts api on :4000 and ui on :3000 in parallel
```

Or per-package:

```sh
pnpm --filter @spend-watcher/api dev   # backend only
pnpm --filter @spend-watcher/ui dev    # frontend only
```

The frontend dev server runs on port `3000` because the backend's CORS allowlist expects that origin in development.

## Common scripts

From the root, these fan out across both packages via pnpm workspaces:

| Command       | What it does                                |
| ------------- | ------------------------------------------- |
| `pnpm dev`    | Run `api` and `ui` in parallel              |
| `pnpm test`   | Run Vitest against the UI                   |
| `pnpm lint`   | Lint both packages with their ESLint config |
| `pnpm format` | Run Prettier across both packages           |

UI-specific:

```sh
pnpm --filter @spend-watcher/ui build     # production bundle into ui/dist/
pnpm --filter @spend-watcher/ui preview   # serve the built bundle locally
pnpm --filter @spend-watcher/ui test:run  # run vitest once (no watch)
```
