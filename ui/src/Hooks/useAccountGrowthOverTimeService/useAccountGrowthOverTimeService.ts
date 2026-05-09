import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { AccountGrowthOverTimeV1Response } from 'Types/Services/accounts.model';

export default function useAccountGrowthOverTimeService() {
  return useQuery<AccountGrowthOverTimeV1Response>({
    queryKey: ['accounts', 'growthOverTime'],
    queryFn: async () => (await axios.get(SERVICE_ROUTES.getAccountGrowthOverTime)).data,
  });
}
