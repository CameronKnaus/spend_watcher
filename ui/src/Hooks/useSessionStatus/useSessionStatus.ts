import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ServiceRoutes from 'Constants/ServiceRoutes';

export default function useSessionStatus() {
  const { isSuccess, isLoading } = useQuery({
    queryKey: ['verify-auth'],
    queryFn: async () => {
      const { data } = await axios.get(ServiceRoutes.getCheckAuthentication);
      if (data?.authenticated !== true) {
        throw new Error('Not authenticated');
      }
      return data;
    },
    staleTime: 100 * 60 * 30, // Reverify authentication every 30 mins, this may not be necessary, will (probably not) revisit
    retry: 0,
  });

  return {
    isAuthenticating: isLoading,
    isAuthenticated: isSuccess,
  };
}
