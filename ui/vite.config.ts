import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // tanstackRouter must run before the react plugin so route files are transformed first
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    passWithNoTests: true,
  },
});
