import { test as base, expect } from '@playwright/test';
import { API_URL } from './config';
import { registerUser, seedBaselineData, type TestUser } from './seed';

type Fixtures = {
  // The unique, seeded account this test runs as — exposed in case a test needs the credentials.
  testUser: TestUser;
};

// `test` exported here is pre-authenticated: every test gets its own freshly-registered user, a
// baseline set of seeded data, and a browser context that already carries the auth cookie. Use it for
// anything that should start "signed in". (For the sign-in / redirect flows, use the plain `test` from
// '@playwright/test' instead, so the context starts clean.)
export const test = base.extend<Fixtures>({
  testUser: [
    async ({ playwright, context }, use) => {
      // Drive the api directly to register + seed. This request context has its own cookie jar, so the
      // `token` cookie set by /auth/register is captured here.
      const api = await playwright.request.newContext({ baseURL: API_URL });
      const user = await registerUser(api);
      await seedBaselineData(api);

      // Copy the auth cookie into the browser context so page navigations are already signed in. It's
      // host-only for `localhost`, so it's sent to both the ui (:3001) and the api (:4001).
      const { cookies } = await api.storageState();
      await context.addCookies(cookies);

      await use(user);
      await api.dispose();
    },
    // auto so every test using this `test` is seeded + authenticated without having to ask for it.
    { auto: true },
  ],
});

export { expect };
