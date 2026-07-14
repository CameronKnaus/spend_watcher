import { orpc } from 'apiClient/orpc';

export const tripExpensesQueryOptions = (tripId?: string) =>
  orpc.trips.expenses.queryOptions({
    input: { tripId: tripId ?? '' },
    enabled: Boolean(tripId),
  });
