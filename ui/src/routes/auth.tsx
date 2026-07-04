import { createFileRoute, redirect } from '@tanstack/react-router';
import AuthScreen from 'Pages/AuthScreen/AuthScreen';
import { sessionQueryOptions } from 'queryOptions/sessionQueryOptions';

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context }) => {
    // .then(onFulfilled, onRejected) rather than try/catch so a thrown redirect can never be
    // swallowed by the catch path.
    const isAuthenticated = await context.queryClient.ensureQueryData(sessionQueryOptions()).then(
      () => true,
      () => false,
    );

    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthScreen,
});
