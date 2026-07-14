// Exercises: the `authed` middleware in api/src/orpc/base.ts guarding every non-auth endpoint.
//
// Every procedure except register/login is built from `authed`, so an unauthenticated caller must
// get 401 — never data, and never a 400 that would imply the request was even looked at. This is
// coverage the UI suite structurally can't provide (the browser is always signed in). The sweep is
// table-driven: a new endpoint gets its guard checked by adding one row.

import { test, expect, type APIRequestContext, type PlaywrightWorkerArgs } from '@playwright/test';
import { API_URL } from '../../src/config';

type Endpoint = { method: 'GET' | 'POST'; path: string };

// Mirrors api/src/orpc/router.ts, minus the two public auth routes (register, login).
const AUTHED_ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/api/auth/verify' },
  { method: 'GET', path: '/api/spending/details' },
  { method: 'GET', path: '/api/spending/recurring/summary' },
  { method: 'GET', path: '/api/spending/recurring/transactions' },
  { method: 'GET', path: '/api/spending/history-start' },
  { method: 'GET', path: '/api/spending/yearly-average' },
  { method: 'POST', path: '/api/spending/discretionary/add' },
  { method: 'POST', path: '/api/spending/discretionary/edit' },
  { method: 'POST', path: '/api/spending/discretionary/delete' },
  { method: 'POST', path: '/api/spending/recurring/add' },
  { method: 'POST', path: '/api/spending/recurring/edit' },
  { method: 'POST', path: '/api/spending/recurring/delete' },
  { method: 'POST', path: '/api/spending/recurring/set-active' },
  { method: 'POST', path: '/api/spending/recurring/transactions/add' },
  { method: 'POST', path: '/api/spending/recurring/transactions/edit' },
  { method: 'GET', path: '/api/accounts/summary' },
  { method: 'GET', path: '/api/accounts/growth-over-time' },
  { method: 'GET', path: '/api/accounts/history' },
  { method: 'POST', path: '/api/accounts/add' },
  { method: 'POST', path: '/api/accounts/edit' },
  { method: 'POST', path: '/api/accounts/set-active' },
  { method: 'POST', path: '/api/accounts/delete' },
  { method: 'POST', path: '/api/accounts/update/add' },
  { method: 'POST', path: '/api/accounts/update/edit' },
  { method: 'GET', path: '/api/trips/list' },
  { method: 'GET', path: '/api/trips/expenses' },
  { method: 'POST', path: '/api/trips/add' },
  { method: 'POST', path: '/api/trips/edit' },
  { method: 'POST', path: '/api/trips/delete' },
];

function freshContext(playwright: PlaywrightWorkerArgs['playwright']): Promise<APIRequestContext> {
  return playwright.request.newContext({ baseURL: API_URL });
}

test.describe('Authorization — unauthenticated access is blocked', () => {
  for (const { method, path } of AUTHED_ENDPOINTS) {
    test(`${method} ${path} → 401 without a token`, async ({ playwright }) => {
      const api = await freshContext(playwright);

      // Empty body / no params on purpose: auth runs BEFORE input validation, so even a malformed
      // request must be turned away as 401, not 400. A 400 here would mean the guard let it through.
      const response = method === 'GET' ? await api.get(path) : await api.post(path, { data: {} });

      expect(response.status()).toBe(401);
      expect(await response.json()).toMatchObject({ code: 'UNAUTHORIZED' });

      await api.dispose();
    });
  }
});
