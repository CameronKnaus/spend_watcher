/**
 * Root-level Playwright configuration for the MCP Playwright test server.
 *
 * When playwright runs from the repo root (as the MCP server does), it picks up this file.
 * It points at the real e2e test suite in e2e/tests/ and pulls its settings from the same
 * module the canonical config uses (e2e/src/config.ts), so the two cannot drift.
 *
 * The canonical e2e test runner (pnpm test:e2e) runs from e2e/ and uses
 * e2e/playwright.config.ts directly — this file is only for MCP/tooling use.
 */

import { defineConfig, devices } from '@playwright/test';
import { API_TEST_ENV, API_URL, UI_PORT, UI_URL } from './e2e/src/config';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: UI_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: [
    {
      command: 'node e2e/scripts/db-up.mjs && pnpm --filter @spend-watcher/api exec tsx src/index.ts',
      cwd: process.cwd(),
      url: `${API_URL}/api/auth/verify`,
      env: API_TEST_ENV,
      reuseExistingServer: true,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `pnpm --filter @spend-watcher/ui exec vite --mode test --port ${UI_PORT} --strictPort`,
      cwd: process.cwd(),
      url: UI_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
