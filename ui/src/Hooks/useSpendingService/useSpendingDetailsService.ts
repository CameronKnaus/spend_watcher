import { useQuery } from '@tanstack/react-query';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { spendingDetailsQueryOptions } from 'queryOptions/spendingDetailsQueryOptions';

export default function useSpendingDetailsService() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate, endDate } = useSelectedTimeFrame();

  return useQuery({
    ...spendingDetailsQueryOptions({ startDate, endDate }),
    enabled: isAuthenticated,
  });
}
