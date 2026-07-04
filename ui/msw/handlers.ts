/**
 * Default happy-path MSW handlers for the component tests, aggregated from the per-domain files in
 * ./handlers/. Every GET the ui can issue is answered with static baseline JSON (mirroring the e2e
 * seed — see ./mocks/), so a component under test renders real data with zero per-test setup.
 * Mutations are accepted with an empty-body 200 by the catch-all POST at the bottom.
 *
 * Tests that need anything OTHER than the happy path prepend an override for that one endpoint
 * with `server.use(...)` (re-exported from `src/test/testUtils.tsx` along with `http` and
 * `HttpResponse`; overrides reset automatically between tests). For recording a mutation's
 * payload, use `captureRequests` from testUtils.
 */
import { http, HttpResponse } from 'msw';
import { accountsHandlers } from './handlers/accountsHandler';
import { authHandlers } from './handlers/authHandler';
import { spendingHandlers } from './handlers/spendingHandler';
import { tripsHandlers } from './handlers/tripsHandler';

export const handlers = [
  ...authHandlers,
  ...accountsHandlers,
  ...spendingHandlers,
  ...tripsHandlers,

  // All write endpoints respond with an empty body (matching the contract). Tests that assert on
  // a mutation's payload prepend a recording override via `captureRequests`.
  http.post('*/api/*', () => HttpResponse.json({})),
];
