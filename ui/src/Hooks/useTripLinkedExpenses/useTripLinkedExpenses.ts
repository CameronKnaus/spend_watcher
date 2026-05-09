import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { TripLinkedExpensesV1Response } from 'Types/Services/trips.model';

export default function useTripLinkedExpenses(tripId?: string) {
  const { isLoading, isFetching, data, isError } = useQuery<TripLinkedExpensesV1Response>({
    enabled: Boolean(tripId),
    // TODO: Smart query invalidation if an expense with the respective tripId is added/edited/deleted
    queryKey: ['trips', 'linkedExpenses', tripId],
    queryFn: async () => {
      const response = await axios.get(SERVICE_ROUTES.getTripLinkedExpenses, { params: { tripId } });

      return response.data;
    },
  });

  return {
    isLoading: isLoading || isFetching,
    isError,
    expenseList: data?.expenseList ?? [],
  };
}
