import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { RecurringSummaryV1Response } from 'Types/Services/spending.model';

export default function useRecurringSummaryService() {
  return useQuery<RecurringSummaryV1Response>({
    queryKey: ['recurring', 'summary'],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getRecurringSummary);
      return response.data;
    },
  });
}
