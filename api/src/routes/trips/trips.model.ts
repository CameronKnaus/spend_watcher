import { DiscretionarySpendTransaction } from '@routes/spending/spending.model';
import { DbDate } from '@type/dateTypes';
import zodValidateDbDateFormat from '@utils/zodCustomValidators/zodValidateDbDateFormat';
import { z as zod } from 'zod';

export type Trip = {
  tripId: string; // uuid
  tripName: string;
  startDate: DbDate;
  endDate: DbDate;
};

// TRIPS LIST API --- /api/trips/v1/list

export type TripCostTotals = {
  totalSpent: number;
  totalDiscretionarySpent: number;
  totalAirfareSpent: number;
  totalLodgingSpent: number;
};

export type TripsListV1Response = {
  activeTrip?: {
    tripId: Trip['tripId'];
    tripName: Trip['tripName'];
  };
  tripsList: {
    trip: Trip;
    costTotals: TripCostTotals;
  }[];
};

// END TRIPS LIST API

// TRIP EXPENSES API --- /api/trips/v1/expenses
export const v1TripExpensesSchema = zod.object({
  tripId: zod.string().uuid(),
});

export type TripExpensesRequestParams = zod.infer<typeof v1TripExpensesSchema>;

export type TripLinkedExpensesV1Response = {
  expenseList: DiscretionarySpendTransaction[];
};

// END TRIP EXPENSES API

// ADD TRIPS API --- /api/trips/v1/add
export const v1AddTripSchema = zod.object({
  tripName: zod.string().min(1).max(100),
  startDate: zodValidateDbDateFormat,
  endDate: zodValidateDbDateFormat,
});

export type AddTripRequestParams = zod.infer<typeof v1AddTripSchema>;

// END ADD TRIPS API

// EDIT TRIPS API --- /api/trips/v1/edit

export const v1EditTripSchema = v1AddTripSchema.extend({
  tripId: zod.string().uuid(),
});

export type EditTripRequestParams = zod.infer<typeof v1EditTripSchema>;

// END EDIT TRIPS API

// DELETE TRIPS API --- /api/trips/v1/delete
export const v1DeleteTripSchema = zod.object({
  tripId: zod.string().uuid(),
});

export type DeleteTripRequestParams = zod.infer<typeof v1DeleteTripSchema>;
// END DELETE TRIPS API
