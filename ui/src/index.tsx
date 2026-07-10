import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, Link, RouterProvider } from '@tanstack/react-router';
import RouteErrorFallback from 'Components/RouteErrorFallback/RouteErrorFallback';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IsMobileContextProvider } from 'Util/IsMobileContext';
import { createQueryClient } from './queryClient';
import { routeTree } from './routeTree.gen';
import './index.css';

const queryClient = createQueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: () => (
    <div>
      <p>Page not found</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </div>
  ),
  defaultErrorComponent: RouteErrorFallback,
});

// Registering the router's type is what makes Link/useNavigate/useLocation across the app
// typecheck their targets against the generated route tree.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <QueryClientProvider client={queryClient}>
        <IsMobileContextProvider>
          <RouterProvider router={router} />
        </IsMobileContextProvider>
      </QueryClientProvider>
    </LocalizationProvider>
  </StrictMode>,
);
