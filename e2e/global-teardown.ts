import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));

// Brings the throwaway MySQL container (and its volume) down after the run, so the next run starts
// from a freshly-initialized schema. The api webServer command is what brings it *up* — see the
// `webServer` block in playwright.config.ts.
export default function globalTeardown(): void {
  try {
    execSync('node scripts/db-down.mjs', { cwd: directory, stdio: 'inherit' });
  } catch (error) {
    console.warn('[e2e] DB teardown failed (is the container engine running?):', error);
  }
}
