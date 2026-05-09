import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { SpendingHistoryStartV1Response } from 'Types/Services/spending.model';

// TODO: Currently Unused
export default function useTransactionHistoryStart() {
  return useQuery<SpendingHistoryStartV1Response>({
    queryKey: ['spending', 'recurring', 'history-start'],
    queryFn: async () => (await axios.get(SERVICE_ROUTES.getSpendingHistoryStart)).data,
  });
}
