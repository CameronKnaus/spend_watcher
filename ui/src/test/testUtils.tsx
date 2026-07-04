/**
 * Shared harness for the component tests. Network requests are answered by MSW: the baseline
 * handlers in `ui/msw/handlers` serve mock data mirroring the e2e seed, so most tests render with
 * zero setup and simply `await screen.findBy…` their first data-bearing element. Per-test
 * variations go through `mockGet` / `captureRequests` below (or `server.use(...)` directly).
 */
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, type JsonBodyType } from 'msw';
import { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { server } from '@msw/server';
import {
  DateRangeType,
  SelectedTimeFrameContext,
  type SelectedTimeFrameContextAPI,
} from 'Contexts/SelectedTimeFrame.context';
import SelectedTimeFrameProvider from 'Contexts/SelectedTimeFrame.context';
import { IsMobileContext } from 'Util/IsMobileContext';

/**
 * A QueryClient tuned for tests: never retries (so a failing request fails the query fast instead
 * of looping) and treats fetched data as fresh forever (one MSW round trip per query per test).
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

type RenderWithProvidersOptions = {
  queryClient?: QueryClient;
  /** Initial route for the in-memory router. */
  route?: string;
  isMobile?: boolean;
  /**
   * Provide a controlled SelectedTimeFrame context value (for asserting period-stepper logic against
   * known props). When omitted, the real `SelectedTimeFrameProvider` is used.
   */
  timeFrame?: SelectedTimeFrameContextAPI;
} & Omit<RenderOptions, 'wrapper'>;

export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  const theme = createTheme();
  const { queryClient = createTestQueryClient(), route = '/', isMobile = false, timeFrame, ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    const timeFrameLayer = timeFrame ? (
      <SelectedTimeFrameContext.Provider value={timeFrame}>{children}</SelectedTimeFrameContext.Provider>
    ) : (
      <SelectedTimeFrameProvider>{children}</SelectedTimeFrameProvider>
    );

    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            <IsMobileContext.Provider value={isMobile}>
              <MemoryRouter initialEntries={[route]}>{timeFrameLayer}</MemoryRouter>
            </IsMobileContext.Provider>
          </QueryClientProvider>
        </LocalizationProvider>
      </ThemeProvider>
    );
  }

  return {
    queryClient,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Build a controlled SelectedTimeFrame context value. All steppers default to `vi.fn()` so tests can
 * assert whether a click actually triggered navigation, and the date/label/flag fields can be
 * overridden to drive the period-stepper's disabled logic.
 */
export function makeTimeFrame(overrides: Partial<SelectedTimeFrameContextAPI> = {}): SelectedTimeFrameContextAPI {
  return {
    startDate: '2026-06-01',
    endDate: '2026-06-27',
    dateRangeType: DateRangeType.MONTH,
    currentMonthLabel: 'June',
    currentYearLabel: '2026',
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    forwardOneMonth: vi.fn(),
    backOneMonth: vi.fn(),
    forwardOneYear: vi.fn(),
    backOneYear: vi.fn(),
    isPresentYear: true,
    isPresentMonth: true,
    updateDateRangeType: vi.fn(),
    setToCurrentMonth: vi.fn(),
    ...overrides,
  };
}

export type RecordedRequest = { url: string; method: string; body: unknown };

/**
 * Record the requests a mutation sends. Prepends a handler for `path` that captures each call's
 * URL/method/JSON body and responds with `responseBody` (default `{}`, matching the contract's
 * empty mutation responses). Assert on the returned array:
 *
 *   const adds = captureRequests('/api/spending/discretionary/add');
 *   await user.click(screen.getByRole('button', { name: 'Submit' }));
 *   await waitFor(() => expect(adds).toHaveLength(1));
 *   expect(adds[0].body).toMatchObject({ amountSpent: 50 });
 *
 * A cancel-flow test asserts the inverse: `expect(adds).toHaveLength(0)`.
 */
export function captureRequests(
  path: string,
  { responseBody = {}, status = 200 }: { responseBody?: JsonBodyType; status?: number } = {},
): RecordedRequest[] {
  const requests: RecordedRequest[] = [];
  server.use(
    http.all(`*${path}`, async ({ request }) => {
      const body = await request
        .clone()
        .json()
        .catch(() => undefined);
      requests.push({ url: request.url, method: request.method, body });
      return HttpResponse.json(responseBody, { status });
    }),
  );
  return requests;
}

// Re-export the MSW surface for tests that need raw handler overrides.
export { server, http, HttpResponse };

// Re-export the RTL surface so test files import from one place.
export * from '@testing-library/react';
export { userEvent };
