import { orpc } from 'api/orpc';

export const tripExpensesQueryOptions = (tripId?: string) =>
  orpc.trips.expenses.queryOptions({
    input: { tripId: tripId ?? '' },
    enabled: Boolean(tripId),
  });
