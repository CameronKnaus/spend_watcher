import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // tanstackRouter must run before the react plugin so route files are transformed first
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: {
    tsconfigPaths: true,
  },
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
