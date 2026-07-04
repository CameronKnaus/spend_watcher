import { describe, it, expect, vi } from 'vitest';
import { SpendingCategory, type TripLinkedExpensesResponse, type TripsListResponse } from '@spend-watcher/contract';
import { http, HttpResponse, renderWithProviders, screen, server, within } from 'test/testUtils';
import TripDetailsPanel from './TripDetailsPanel';

describe('TripDetailsPanel', () => {
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
  const dateLabel = 'Jun 13th - Jun 17th, 2026';

  function renderPanel(expenses: TripLinkedExpensesResponse = { expenseList: [] }, onClose = vi.fn()) {
    server.use(http.get('*/api/trips/expenses', () => HttpResponse.json(expenses)));
    const utils = renderWithProviders(<TripDetailsPanel trip={trip} dateLabel={dateLabel} isOpen onClose={onClose} />);
    return { ...utils, onClose };
  }

  it('shows the date range, the empty linked-transactions state, and the footer actions', async () => {
    renderPanel();

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Test Trip' })).toBeInTheDocument();
    expect(within(dialog).getByText(dateLabel)).toBeInTheDocument();
    expect(within(dialog).getByText('Linked transactions')).toBeInTheDocument();
    expect(
      await within(dialog).findByRole('heading', { name: 'This trip has no linked transactions yet' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Add transactions to this trip to see them here.')).toBeInTheDocument();

    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Edit trip details' })).toBeInTheDocument();
  });

  it('renders the linked transactions when the trip has expenses', async () => {
    renderPanel({
      expenseList: [
        {
          transactionId: 'Discretionary-1',
          amountSpent: 25,
          category: SpendingCategory.RESTAURANTS,
          note: 'Lunch',
          spentDate: '2026-06-15',
          isRecurring: false,
          linkedTripId: trip.tripId,
        },
      ],
    } satisfies TripLinkedExpensesResponse);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('Dining out')).toBeInTheDocument();
    expect(within(dialog).queryByRole('heading', { name: 'This trip has no linked transactions yet' })).toBeNull();
    expect(within(dialog).getByText('Lunch')).toBeInTheDocument();
    expect(within(dialog).getByText('-$25.00')).toBeInTheDocument();
  });

  it('invokes onClose when the Close button is clicked', async () => {
    const { user, onClose } = renderPanel();

    await user.click(await screen.findByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
