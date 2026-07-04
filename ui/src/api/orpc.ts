import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { appContract } from '@spend-watcher/contract';

// OpenAPILink needs the contract at runtime so it knows each procedure's REST method + path.
// `VITE_DOMAIN` already ends in `/api`, which is also the server-side handler prefix, so the
// contract's relative paths (e.g. `/spending/details`) resolve to `…/api/spending/details`.
const link = new OpenAPILink(appContract, {
  url: import.meta.env.VITE_DOMAIN,
  // Send the auth cookie with every request (the api derives identity from the `token` cookie).
  fetch: (request, init) => globalThis.fetch(request, { ...init, credentials: 'include' }),
});

// The fully-typed client. Types flow from the shared contract — no hand-maintained response types.
const client: JsonifiedClient<ContractRouterClient<typeof appContract>> = createORPCClient(link);

// TanStack Query helpers: `orpc.<domain>.<procedure>.queryOptions(...)` etc. This is the single
// entry point the `queryOptions/*` files build on.
export const orpc = createTanstackQueryUtils(client);
