import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { SpendingDetailsV1Response } from 'Types/Services/spending.model';

export default function useSpendingDetailsService() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate, endDate } = useSelectedTimeFrame();

  return useQuery<SpendingDetailsV1Response>({
    enabled: isAuthenticated,
    queryKey: ['spending', startDate, endDate],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getSpendingDetails, {
        params: {
          startDate,
          endDate,
        },
      });

      return response.data;
    },
  });
}
