import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, Link, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IsMobileContextProvider } from 'Util/IsMobileContext';
import msMapper from 'Util/Time/TimeMapping';
import { routeTree } from './routeTree.gen';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: msMapper.day,
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: () => (
    <div>
      <p>Page not found</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </div>
  ),
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
