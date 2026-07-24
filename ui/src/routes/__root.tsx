import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import SelectedTimeFrameProvider from 'Contexts/SelectedTimeFrame.context';
import { lazy, Suspense } from 'react';

// The e2e server runs `vite --mode test`, so the mode check keeps the
// floating devtools button out of Playwright runs as well as vitest.
const TanStackRouterDevtools =
  import.meta.env.DEV && import.meta.env.MODE !== 'test'
    ? lazy(() =>
        import('@tanstack/react-router-devtools').then((module) => ({ default: module.TanStackRouterDevtools })),
      )
    : () => null;

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <SelectedTimeFrameProvider>
      <Outlet />
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </SelectedTimeFrameProvider>
  );
}
