import { useQuery } from '@tanstack/react-query';
import { orpc } from 'api/orpc';

export default function useSessionStatus() {
  const { isSuccess, isLoading } = useQuery({
    ...orpc.auth.verify.queryOptions({
      staleTime: 100 * 60 * 30,
      retry: 0,
    }),
  });

  return {
    isAuthenticating: isLoading,
    isAuthenticated: isSuccess,
  };
}
