import { MutationCache, QueryClient } from '@tanstack/react-query';
import createContentGetter from 'Content/createContentGetter';
import msMapper from 'Util/Time/TimeMapping';
import { showErrorToast } from 'Util/Toast/toastStore';

// Registering mutationMeta is what lets a mutation opt out of the global error toast below
// (`meta: { suppressGlobalError: true }`) with full type-checking on the meta shape.
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      suppressGlobalError?: boolean;
    };
  }
}

const getGeneralContent = createContentGetter('general');

// A factory (rather than a module-level singleton) so tests can build an isolated client wired
// with the same global error handling the app uses in production.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: msMapper.day,
      },
    },
    // Central fallback for the 15+ mutations across the app that had no error handling of their
    // own: a form-specific case (e.g. LoginForm's bad-credentials message) opts out via
    // `meta.suppressGlobalError` and handles it inline instead.
    mutationCache: new MutationCache({
      onError: (_error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressGlobalError) {
          return;
        }

        showErrorToast({
          title: getGeneralContent('mutationErrorTitle'),
          message: getGeneralContent('mutationErrorMessage'),
        });
      },
    }),
  });
}
