import { describe, expect, it } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server, waitFor } from 'test/testUtils';
import PageRoutes from './PageRoutes';

function renderRoutes({ authenticated, route }: { authenticated: boolean; route: string }) {
  if (!authenticated) {
    server.use(http.get('*/api/auth/verify', () => HttpResponse.json({}, { status: 401 })));
  }
  return renderWithProviders(<PageRoutes />, { route });
}

describe('PageRoutes auth gate', () => {
  it('redirects an unauthenticated visitor from a protected route to the auth screen', async () => {
    renderRoutes({ authenticated: false, route: '/savings' });

    expect(await screen.findByText('Welcome to SpendWatcher')).toBeInTheDocument();
  });

  it('bounces an authenticated visitor from /auth to the dashboard', async () => {
    renderRoutes({ authenticated: true, route: '/auth' });

    await waitFor(() => expect(screen.queryByText('Welcome to SpendWatcher')).not.toBeInTheDocument());
    // The dashboard shell renders (its data reads are answered by the default handlers).
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument();
  });

  it('keeps an authenticated visitor on the protected route they asked for', async () => {
    renderRoutes({ authenticated: true, route: '/savings' });

    await waitFor(() => expect(screen.queryByText('Welcome to SpendWatcher')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Savings/ })).toBeInTheDocument();
  });
});
