import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from 'queryOptions/sessionQueryOptions';

export default function useSessionStatus() {
  const { isSuccess, isLoading } = useQuery(sessionQueryOptions());

  return {
    isAuthenticating: isLoading,
    isAuthenticated: isSuccess,
  };
}
