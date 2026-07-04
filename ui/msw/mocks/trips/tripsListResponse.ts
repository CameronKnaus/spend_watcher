import type { TripsListResponse } from '@spend-watcher/contract';

// No `activeTrip` — the seeded trip is in the past, so nothing is currently active.
export const tripsListResponse = {
  tripsList: [
    {
      trip: {
        tripId: '22222222-2222-4222-8222-222222222222',
        tripName: 'Test Trip',
        startDate: '2026-06-13',
        endDate: '2026-06-17',
      },
      costTotals: {
        totalSpent: 0,
        totalDiscretionarySpent: 0,
        totalAirfareSpent: 0,
        totalLodgingSpent: 0,
      },
    },
  ],
} satisfies TripsListResponse;
