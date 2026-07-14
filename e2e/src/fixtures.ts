import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { API_URL, UI_URL } from './config';
import { registerUser, seedBaselineData, type TestUser } from './seed';

type Fixtures = {
  // The unique, seeded account this test runs as — exposed in case a test needs the credentials.
  testUser: TestUser;
  // Authenticated request context for this test's user. Use it (with `post` from seed.ts) to seed
  // data beyond the baseline — e.g. a prior-month transaction — instead of clicking through the UI.
  api: APIRequestContext;
};

function buildAuthedTest(seedBaseline: boolean) {
  return base.extend<Fixtures>({
    // Override the built-in baseURL fixture so that page.goto('/path') works even when the playwright
    // config's use.baseURL is not applied (e.g. the MCP Playwright test server runs from the repo root
    // and does not load the e2e/playwright.config.ts use-section settings). When the playwright config
    // DOES set use.baseURL (normal `pnpm test:e2e` run), that value overrides this default.
    // @ts-ignore — baseURL is a PlaywrightTestOption that can be shadowed as a test-scoped fixture
    baseURL: [UI_URL, { option: true }],
    api: async ({ playwright }, use) => {
      // This request context has its own cookie jar, so the `token` cookie set by /auth/register is
      // captured here and every later call through it is authenticated as this test's user.
      const api = await playwright.request.newContext({ baseURL: API_URL });
      await use(api);
      await api.dispose();
    },
    testUser: [
      async ({ api, context }, use) => {
        // Drive the api directly to register + seed.
        const user = await registerUser(api);
        if (seedBaseline) {
          await seedBaselineData(api);
        }

        // Copy the auth cookie into the browser context so page navigations are already signed in. It's
        // host-only for `localhost`, so it's sent to both the ui (:3001) and the api (:4001).
        const { cookies } = await api.storageState();
        await context.addCookies(cookies);

        await use(user);
      },
      // auto so every test using this `test` is seeded + authenticated without having to ask for it.
      { auto: true },
    ],
  });
}

// `test` exported here is pre-authenticated: every test gets its own freshly-registered user, a
// baseline set of seeded data, and a browser context that already carries the auth cookie. Use it for
// anything that should start "signed in". (For the sign-in / redirect flows, use the plain `test` from
// '@playwright/test' instead, so the context starts clean.)
export const test = buildAuthedTest(true);

// Same authenticated setup but with NO baseline data — for journeys where the absence of data is the
// point (empty months, single-kind months). Seed exactly what the scenario needs via `api` + `post`.
export const unseededTest = buildAuthedTest(false);

export { expect };
