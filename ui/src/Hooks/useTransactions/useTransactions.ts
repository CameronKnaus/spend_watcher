import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { TransactionsV1Response } from 'Types/Services/spending.model';

// TODO: Replace useSpendingDetailsService with this?
export default function useTransactions() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate, endDate } = useSelectedTimeFrame();

  return useQuery<TransactionsV1Response>({
    enabled: isAuthenticated,
    queryKey: ['spending', 'transactions', startDate, endDate],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getTransactions, {
        params: {
          startDate,
          endDate,
        },
      });

      return response.data;
    },
  });
}
