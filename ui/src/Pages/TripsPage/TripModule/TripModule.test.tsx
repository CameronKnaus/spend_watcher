import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, within } from 'test/testUtils';
import type { TripsListResponse } from '@spend-watcher/contract';
import TripModule from './TripModule';

describe('TripModule', () => {
  const tripEntry = {
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
  } satisfies TripsListResponse['tripsList'][number];
  const trip = tripEntry.trip;

  it('renders the trip name, formatted same-year date range, and four zeroed cost tiles', () => {
    renderWithProviders(
      <TripModule
        trip={trip}
        tripCostTotals={{ totalSpent: 0, totalDiscretionarySpent: 0, totalAirfareSpent: 0, totalLodgingSpent: 0 }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Test Trip' })).toBeInTheDocument();
    expect(screen.getByText('Jun 13th - Jun 17th, 2026')).toBeInTheDocument();

    for (const label of ['Airfare', 'Lodging', 'Discretionary', 'Total']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText('$0.00')).toHaveLength(4);
  });

  it('maps each cost total to its tile (as a loss) when the trip has spend', () => {
    renderWithProviders(
      <TripModule
        trip={trip}
        tripCostTotals={{
          totalAirfareSpent: 100,
          totalLodgingSpent: 200,
          totalDiscretionarySpent: 50,
          totalSpent: 350,
        }}
      />,
    );

    expect(screen.getByText('-$100.00')).toBeInTheDocument(); // airfare
    expect(screen.getByText('-$200.00')).toBeInTheDocument(); // lodging
    expect(screen.getByText('-$50.00')).toBeInTheDocument(); // discretionary
    expect(screen.getByText('-$350.00')).toBeInTheDocument(); // total
  });

  it('opens the trip details panel when Details is clicked', async () => {
    // The details panel's expenses come from the baseline /api/trips/expenses handler (empty list).
    const { user } = renderWithProviders(
      <TripModule
        trip={trip}
        tripCostTotals={{ totalSpent: 0, totalDiscretionarySpent: 0, totalAirfareSpent: 0, totalLodgingSpent: 0 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Details/ }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Test Trip' })).toBeInTheDocument();
  });
});
