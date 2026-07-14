import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Unconditional: unauthenticated visitors chain-bounce /dashboard → /auth via the _app guard,
    // matching the old imperative redirect's final URLs.
    throw redirect({ to: '/dashboard' });
  },
});
