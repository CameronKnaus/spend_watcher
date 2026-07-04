import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { routeTree } from '../routeTree.gen';
import { createTestQueryClient, http, HttpResponse, screen, server, waitFor } from 'test/testUtils';

/**
 * Renders the real generated route tree (beforeLoad guards included) at an initial URL.
 * IsMobileContext falls back to its module default (desktop — the matchMedia mock reports
 * matches: false) and SelectedTimeFrameProvider lives inside __root, so only the outer
 * providers are recreated here.
 */
function renderApp({ authenticated, route }: { authenticated: boolean; route: string }) {
  if (!authenticated) {
    server.use(http.get('*/api/auth/verify', () => HttpResponse.json({}, { status: 401 })));
  }

  const queryClient = createTestQueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [route] }),
    context: { queryClient },
  });

  render(
    <ThemeProvider theme={createTheme()}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>,
  );

  return { router };
}

describe('router auth gate', () => {
  it('redirects an unauthenticated visitor from a protected route to the auth screen', async () => {
    const { router } = renderApp({ authenticated: false, route: '/savings' });

    expect(await screen.findByText('Welcome to SpendWatcher')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/auth');
  });

  it('bounces an authenticated visitor from /auth to the dashboard', async () => {
    const { router } = renderApp({ authenticated: true, route: '/auth' });

    // The dashboard shell renders (its data reads are answered by the default handlers).
    expect(await screen.findByRole('link', { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.queryByText('Welcome to SpendWatcher')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('keeps an authenticated visitor on the protected route they asked for', async () => {
    const { router } = renderApp({ authenticated: true, route: '/savings' });

    expect(await screen.findByRole('link', { name: /Savings/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Welcome to SpendWatcher')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe('/savings');
  });
});
