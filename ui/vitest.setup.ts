import '@testing-library/jest-dom/vitest';
import { Globals } from '@react-spring/web';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw/server';

beforeAll(() => {
  // Turn off animated transitions for testing
  Globals.assign({
    skipAnimation: true,
  });
});

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// jsdom has no ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

// jsdom implements no scrolling APIs; PageRoutes scrolls the document to the top on navigation.
Element.prototype.scrollTo = Element.prototype.scrollTo ?? (() => {});

// React Testing Library auto-cleanup between tests (globals/afterEach are configured by vitest).
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia. The deprecated addListener/removeListener pair matters: MUI's
// useMediaQuery still calls it in this environment, so components containing MUI date pickers
// crash on mount without it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  // Restore all fake clocks if used
  vi.useRealTimers();
});
