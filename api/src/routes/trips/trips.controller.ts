import formatDiscretionaryTransactionId from '@routes/spending/helpers/formatDiscretionaryTransactionId';
import { SpendingCategory } from '@type/categoryTypes';
import { dbDateFormat } from '@type/dateTypes';
import getUsernameFromToken from '@utils/TokenUtils/getUsernameFromToken';
import { format, isWithinInterval, parse } from 'date-fns';
import { NextFunction, Request, Response, Router } from 'express';
import {
    AddTripRequestParams,
    DeleteTripRequestParams,
    EditTripRequestParams,
    TripLinkedExpensesV1Response,
    TripsListV1Response,
    v1AddTripSchema,
    v1DeleteTripSchema,
    v1EditTripSchema,
    v1TripExpensesSchema,
} from './trips.model';
import {
    addTrip,
    deleteTrip,
    editTrip,
    fetchTripCostTotals,
    fetchTripLinkedExpenses,
    fetchTrips,
    TripTableSQLRow,
} from './trips.service';

const api = Router();

// Provides all of the user's trip data, both past and planned.
api.get('/v1/list', async (request, response, next) => {
    try {
        const username = getUsernameFromToken(request.cookies.token);

        const [tripDetails, tripTotals] = await Promise.all([fetchTrips(username), fetchTripCostTotals(username)]);

        const today = new Date();
        let activeTrip: TripTableSQLRow | undefined;

        const payload: TripsListV1Response = {
            tripsList: tripDetails.map((trip) => {
                const tripDetails = tripTotals.find((element) => element.linked_trip_id === trip.trip_id);
                const startDate = parse(trip.start_date, dbDateFormat, new Date());
                const endDate = parse(trip.end_date, dbDateFormat, new Date());

                if (isWithinInterval(today, { start: startDate, end: endDate })) {
                    // TODO: This only works if one trip is considered active and there are currently no limitations on multiple active trips
                    activeTrip = trip;
                }

                return {
                    trip: {
                        tripId: trip.trip_id,
                        tripName: trip.trip_name,
                        startDate: format(trip.start_date, dbDateFormat),
                        endDate: format(trip.end_date, dbDateFormat),
                    },
                    costTotals: {
                        totalSpent: tripDetails?.total ?? 0,
                        totalDiscretionarySpent: tripDetails?.discretionary_total ?? 0,
                        totalAirfareSpent: tripDetails?.airfare_total ?? 0,
                        totalLodgingSpent: tripDetails?.lodging_total ?? 0,
                    },
                };
            }),
        };

        if (activeTrip) {
            payload.activeTrip = {
                tripId: activeTrip.trip_id,
                tripName: activeTrip.trip_name,
            };
        }

        response.json(payload);
    } catch (error) {
        next(error);
    }
});

// Provides the list of transactions linked to this trip.
api.get('/v1/expenses', async (request, response, next) => {
    try {
        const parsedRequest = v1TripExpensesSchema.parse(request.query);
        const username = getUsernameFromToken(request.cookies.token);

        const results = await fetchTripLinkedExpenses(username, parsedRequest.tripId);

        const payload: TripLinkedExpensesV1Response = {
            expenseList: results.map((result) => ({
                transactionId: formatDiscretionaryTransactionId(result.transaction_id),
                amountSpent: result.amount,
                category: result.category as SpendingCategory,
                note: result.note,
                spentDate: format(result.date, dbDateFormat),
                isRecurring: false,
                linkedTripId: result.linked_trip_id,
            })),
        };

        response.json(payload);
    } catch (error) {
        next(error);
    }
});

// Allows adding a new trip for tracking spending against the trip
api.post('/v1/add', async (request: Request<AddTripRequestParams>, response: Response, next: NextFunction) => {
    try {
        const parsedRequest = v1AddTripSchema.parse(request.body);
        const username = getUsernameFromToken(request.cookies.token);

        await addTrip(username, parsedRequest);
        response.status(200).send();
    } catch (error) {
        next(error);
    }
});

// Allows for editing the details of an existing trip
api.post('/v1/edit', async (request: Request<EditTripRequestParams>, response: Response, next: NextFunction) => {
    try {
        const parsedRequest = v1EditTripSchema.parse(request.body);
        const username = getUsernameFromToken(request.cookies.token);

        await editTrip(username, parsedRequest);
        response.status(200).send();
    } catch (error) {
        next(error);
    }
});

api.post('/v1/delete', async (request: Request<DeleteTripRequestParams>, response: Response, next: NextFunction) => {
    try {
        const parsedRequest = v1DeleteTripSchema.parse(request.body);
        const username = getUsernameFromToken(request.cookies.token);

        await deleteTrip(username, parsedRequest.tripId);
        response.status(200).send();
    } catch (error) {
        next(error);
    }
});

export default api;
