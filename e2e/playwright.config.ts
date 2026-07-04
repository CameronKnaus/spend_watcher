import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_TEST_ENV, API_URL, UI_PORT, UI_URL } from './src/config';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : 10,
  // On CI, the github reporter adds failure annotations inline on the PR diff alongside the report.
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  globalTeardown: './global-teardown.ts',
  use: {
    baseURL: UI_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  // Two servers, started fresh for the run. The api command also owns the test-DB lifecycle: it
  // generates the schema, brings up the Docker MySQL and waits for it to be healthy *before* the api
  // process boots. Doing it here (rather than in globalSetup) means the api can never race the
  // database, regardless of the order Playwright starts things in.
  webServer: [
    {
      command: 'node scripts/db-up.mjs && pnpm --filter @spend-watcher/api exec tsx src/index.ts',
      cwd: directory,
      url: `${API_URL}/api/auth/verify`,
      env: API_TEST_ENV,
      reuseExistingServer: true,
      // Generous: a cold first run may pull the MySQL image before the DB even starts initialising.
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `pnpm --filter @spend-watcher/ui exec vite --mode test --port ${UI_PORT} --strictPort`,
      cwd: directory,
      url: UI_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
