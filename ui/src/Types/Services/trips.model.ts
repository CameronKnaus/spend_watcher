import { DbDate } from 'Types/dateTypes';
import zodValidateDbDateFormat from 'Util/zodCustomValidators/zodValidateDbDateFormat';
import { z as zod } from 'zod';

export type Trip = {
  tripId: string; // uuid
  tripName: string;
  startDate: DbDate;
  endDate: DbDate;
};

export type TripCostTotals = {
  totalSpent: number;
  totalDiscretionarySpent: number;
  totalAirfareSpent: number;
  totalLodgingSpent: number;
};

// Add trip — used for client-side form validation (zodResolver).
export const v1AddTripSchema = zod.object({
  tripName: zod.string().min(1).max(100),
  startDate: zodValidateDbDateFormat,
  endDate: zodValidateDbDateFormat,
});

export type AddTripRequestParams = zod.infer<typeof v1AddTripSchema>;
