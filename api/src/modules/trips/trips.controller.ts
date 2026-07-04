import { authed } from '../../orpc/base';
import { addTrip, editTrip, getTripLinkedExpenses, getTripsList, removeTrip } from './trips.service';

// GET /api/trips/list — all of the user's trips (past and planned) with cost totals and active-trip detection.
export const list = authed.trips.list.handler(({ context }) => getTripsList(context.username));

// GET /api/trips/expenses — transactions linked to a given trip.
export const expenses = authed.trips.expenses.handler(({ context, input }) =>
  getTripLinkedExpenses(context.username, input.tripId),
);

// POST /api/trips/add — create a new trip.
export const add = authed.trips.add.handler(({ context, input }) => addTrip(context.username, input));

// POST /api/trips/edit — edit an existing trip.
export const edit = authed.trips.edit.handler(({ context, input }) => editTrip(context.username, input));

// POST /api/trips/delete — delete a trip and unlink its expenses.
export const remove = authed.trips.delete.handler(({ context, input }) => removeTrip(context.username, input.tripId));
