import { oc } from '@orpc/contract';
import { z } from 'zod';
import { zDiscretionaryTransactionId, zSpendingCategory } from './shared';

const tripSchema = z.object({
  tripId: z.string(),
  tripName: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});
export type Trip = z.infer<typeof tripSchema>;

// Per-trip cost totals as returned in the list (the internal `linkedTripId` is omitted).
const tripCostTotalsSchema = z.object({
  totalSpent: z.number(),
  totalDiscretionarySpent: z.number(),
  totalAirfareSpent: z.number(),
  totalLodgingSpent: z.number(),
});
export type TripCostTotals = z.infer<typeof tripCostTotalsSchema>;

// GET /trips/list
export const tripsListContract = oc.route({ method: 'GET', path: '/trips/list' }).output(
  z.object({
    activeTrip: z
      .object({
        tripId: z.string(),
        tripName: z.string(),
      })
      .optional(),
    tripsList: z.array(
      z.object({
        trip: tripSchema,
        costTotals: tripCostTotalsSchema,
      }),
    ),
  }),
);

const tripLinkedExpenseSchema = z.object({
  transactionId: zDiscretionaryTransactionId,
  amountSpent: z.number(),
  category: zSpendingCategory,
  note: z.string(),
  spentDate: z.iso.date(),
  isRecurring: z.literal(false),
  linkedTripId: z.string(),
});

// GET /trips/expenses
export const tripExpensesContract = oc
  .route({ method: 'GET', path: '/trips/expenses' })
  .input(z.object({ tripId: z.uuid() }))
  .output(
    z.object({
      expenseList: z.array(tripLinkedExpenseSchema),
    }),
  );

// POST /trips/add
export const tripInputSchema = z.object({
  // The `trip_name` DB column is varchar(30).
  tripName: z.string().min(1).max(30),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

export const tripAddContract = oc.route({ method: 'POST', path: '/trips/add' }).input(tripInputSchema);

// POST /trips/edit
export const tripEditContract = oc
  .route({ method: 'POST', path: '/trips/edit' })
  .input(tripInputSchema.extend({ tripId: z.uuid() }));

// POST /trips/delete
export const tripDeleteContract = oc
  .route({ method: 'POST', path: '/trips/delete' })
  .input(z.object({ tripId: z.uuid() }));

export const tripsContract = {
  list: tripsListContract,
  expenses: tripExpensesContract,
  add: tripAddContract,
  edit: tripEditContract,
  delete: tripDeleteContract,
};
