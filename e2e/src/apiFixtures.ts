import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { API_URL } from './config';
import { registerUser, type TestUser } from './seed';

type ApiFixtures = {
  // The unique user this test runs as — exposed for specs that assert on identity.
  testUser: TestUser;
  // Request context authenticated as `testUser`: its cookie jar captured the `token` cookie that
  // /auth/register set, so every call through it runs as that user.
  api: APIRequestContext;
  // A second, independently-registered user's context, for tenant-isolation specs that attack one
  // user's data from another's session. Lazy: only tests that ask for it pay the registration.
  otherApi: APIRequestContext;
};

// Browser-less counterpart to fixtures.ts for the `api` Playwright project. No baseline data is
// seeded — api specs assert exact values, so each test creates precisely the data it reads back.
export const apiTest = base.extend<ApiFixtures>({
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: API_URL });
    await use(api);
    await api.dispose();
  },
  testUser: [
    async ({ api }, use) => {
      await use(await registerUser(api));
    },
    // auto so every test through this `apiTest` starts authenticated without asking for it.
    { auto: true },
  ],
  otherApi: async ({ playwright }, use) => {
    const otherApi = await playwright.request.newContext({ baseURL: API_URL });
    await registerUser(otherApi);
    await use(otherApi);
    await otherApi.dispose();
  },
});

export { expect };
