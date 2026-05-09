import '@testing-library/jest-dom/vitest';
import { Globals } from '@react-spring/web';
import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // Turn off animated transitions for testing
  Globals.assign({
    skipAnimation: true,
  });
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  // Restore all fake clocks if used
  vi.useRealTimers();
});
