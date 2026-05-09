import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { AccountsSummaryV1Response } from 'Types/Services/accounts.model';

export default function useAccountSummaryService() {
  return useQuery<AccountsSummaryV1Response>({
    queryKey: ['accounts', 'details'],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getAccountsSummary);
      return response.data;
    },
  });
}
