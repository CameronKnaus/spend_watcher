import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { RecurringSpendTransaction, RecurringTransactionsListV1Response } from 'Types/Services/spending.model';

export default function useRecurringTransactionsList(recurringSpendId: RecurringSpendTransaction['recurringSpendId']) {
  const { data, isLoading } = useQuery<RecurringTransactionsListV1Response>({
    queryKey: ['recurring', recurringSpendId],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getRecurringTransactionsList, {
        params: {
          recurringSpendId,
        },
      });

      return response.data;
    },
  });

  return {
    isLoading: isLoading,
    recurringTransactionsList: data?.transactions,
  };
}
