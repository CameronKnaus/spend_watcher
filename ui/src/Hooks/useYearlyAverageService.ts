import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { YearlyAverageV1Response } from 'Types/Services/spending.model';

export default function useYearlyAverageService() {
  const { isAuthenticated } = useSessionStatus();

  return useQuery<YearlyAverageV1Response>({
    enabled: isAuthenticated,
    queryKey: ['yearlyAverage'],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getYearlyAverage);
      return response.data;
    },
  });
}
