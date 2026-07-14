import { createFileRoute, redirect } from '@tanstack/react-router';
import DesktopNavigation from 'Components/Navigation/DesktopNavigation/DesktopNavigation';
import MobileNavigation from 'Components/Navigation/MobileNavigation/MobileNavigation';
import { sessionQueryOptions } from 'queryOptions/sessionQueryOptions';
import { useIsMobile } from 'Util/IsMobileContext';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    // .then(onFulfilled, onRejected) rather than try/catch so a thrown redirect can never be
    // swallowed by the catch path.
    const isAuthenticated = await context.queryClient.ensureQueryData(sessionQueryOptions()).then(
      () => true,
      () => false,
    );

    if (!isAuthenticated) {
      throw redirect({ to: '/auth' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileNavigation /> : <DesktopNavigation />;
}
