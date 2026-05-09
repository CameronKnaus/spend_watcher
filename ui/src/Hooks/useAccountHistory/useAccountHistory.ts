import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { Account, AccountHistoryV1Response } from 'Types/Services/accounts.model';

export default function useAccountHistory(accountId: Account['id']) {
  return useQuery<AccountHistoryV1Response>({
    queryKey: ['accounts', accountId],
    queryFn: async () =>
      (
        await axios.get(SERVICE_ROUTES.getAccountValueHistory, {
          params: {
            accountId,
          },
        })
      ).data,
  });
}
