import { AppInputs, TripLinkedExpensesResponse, TripsListResponse } from '@spend-watcher/contract';
import { dbDateFormat } from '@type/dateTypes';
import { isWithinInterval, parse } from 'date-fns';
import {
  deleteTrip,
  findTripCostTotals,
  findTripLinkedExpenses,
  findTrips,
  insertTrip,
  updateTrip,
} from './trips.repository';

// Orchestrates the trip list: fetches trips and their cost totals in parallel, joins the totals
// onto each trip, and detects the active trip (one whose date range contains today).
export async function getTripsList(username: string): Promise<TripsListResponse> {
  const [trips, costTotals] = await Promise.all([findTrips(username), findTripCostTotals(username)]);

  const today = new Date();
  let activeTrip: TripsListResponse['activeTrip'];

  const tripsList = trips.map((trip) => {
    const totals = costTotals.find((element) => element.linkedTripId === trip.tripId);

    const startDate = parse(trip.startDate, dbDateFormat, new Date());
    const endDate = parse(trip.endDate, dbDateFormat, new Date());

    if (isWithinInterval(today, { start: startDate, end: endDate })) {
      // TODO: This only works if one trip is considered active; there are currently no
      // limitations preventing multiple active trips.
      activeTrip = {
        tripId: trip.tripId,
        tripName: trip.tripName,
      };
    }

    return {
      trip,
      costTotals: {
        totalSpent: totals?.totalSpent ?? 0,
        totalDiscretionarySpent: totals?.totalDiscretionarySpent ?? 0,
        totalAirfareSpent: totals?.totalAirfareSpent ?? 0,
        totalLodgingSpent: totals?.totalLodgingSpent ?? 0,
      },
    };
  });

  const payload: TripsListResponse = { tripsList };

  if (activeTrip) {
    payload.activeTrip = activeTrip;
  }

  return payload;
}

export async function getTripLinkedExpenses(username: string, tripId: string): Promise<TripLinkedExpensesResponse> {
  const expenseList = await findTripLinkedExpenses(username, tripId);

  return { expenseList };
}

export function addTrip(username: string, input: AppInputs['trips']['add']): Promise<void> {
  return insertTrip(username, input);
}

export function editTrip(username: string, input: AppInputs['trips']['edit']): Promise<void> {
  return updateTrip(username, input);
}

export function removeTrip(username: string, tripId: string): Promise<void> {
  return deleteTrip(username, tripId);
}
