import { useQuery } from '@tanstack/react-query';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { spendingTransactionsQueryOptions } from 'queryOptions/spendingTransactionsQueryOptions';

export default function useTransactions() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate, endDate } = useSelectedTimeFrame();

  return useQuery({
    ...spendingTransactionsQueryOptions({ startDate, endDate }),
    enabled: isAuthenticated,
  });
}
