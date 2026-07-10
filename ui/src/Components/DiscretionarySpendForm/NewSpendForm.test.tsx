import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  captureRequests,
  http,
  HttpResponse,
  renderWithProviders,
  screen,
  server,
  waitFor,
  within,
} from 'test/testUtils';
import type { TripsListResponse } from '@spend-watcher/contract';
import { createQueryClient } from 'queryClient';
import { clearAllToasts } from 'Util/Toast/toastStore';
import ToastContainer from 'Util/Toast/ToastContainer';
import NewSpendForm from './NewSpendForm';

function renderForm({ activeTrip = false } = {}) {
  if (activeTrip) {
    // The baseline trips list has no active trip; override it with one that does.
    server.use(
      http.get('*/api/trips/list', () =>
        HttpResponse.json({
          activeTrip: { tripId: '22222222-2222-4222-8222-222222222222', tripName: 'Test Trip' },
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
        } satisfies TripsListResponse),
      ),
    );
  }
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  const adds = captureRequests('/api/spending/discretionary/add');
  const utils = renderWithProviders(<NewSpendForm onCancel={onCancel} onSubmit={onSubmit} />);
  return { ...utils, onCancel, onSubmit, adds };
}

beforeEach(() => {
  // Fixed mid-month date so "today"/"tomorrow" day numbers are deterministic.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

describe('NewSpendForm defaults', () => {
  it('defaults category to Other and the expense date to today', () => {
    renderForm();

    expect(screen.getByPlaceholderText('$0.00')).toHaveValue('');
    expect(screen.getAllByRole('textbox').some((input) => (input as HTMLInputElement).value === 'Other')).toBe(true);
    // The (mobile-variant) MUI date field renders today's date.
    expect(screen.getByRole('textbox', { name: /Choose date/ })).toHaveValue('June 15th, 2026');
  });
});

describe('NewSpendForm cancel', () => {
  it('fires onCancel without sending any request', async () => {
    const { user, onCancel, adds } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(adds).toHaveLength(0);
  });
});

describe('NewSpendForm validation', () => {
  it('blocks submit while the amount is empty', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit when the note exceeds 60 characters', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('$0.00'), '10');
    await user.type(screen.getByPlaceholderText('About your expense'), 'N'.repeat(61));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks future dates in the expense date picker', async () => {
    const { user } = renderForm();

    // The mobile-variant picker opens a dialog on tap; days render as gridcells.
    await user.click(screen.getByRole('textbox', { name: /Choose date/ }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('gridcell', { name: '16' })).toBeDisabled(); // tomorrow
    expect(within(dialog).getByRole('gridcell', { name: '15' })).toBeEnabled(); // today
  });
});

describe('NewSpendForm submission', () => {
  it('POSTs the typed values and fires onSubmit on success', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('$0.00'), '50');
    await user.type(screen.getByPlaceholderText('About your expense'), 'Lunch out');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(adds).toHaveLength(1);
    expect(adds[0].body).toMatchObject({
      category: 'OTHER',
      amountSpent: 50,
      spentDate: '2026-06-15',
      note: 'Lunch out',
    });
  });
});

describe('NewSpendForm active trip', () => {
  it('shows the active-trip notice and pre-links the trip when one is active', async () => {
    renderForm({ activeTrip: true });

    expect(
      await screen.findByRole('heading', { name: /Your current trip, "Test Trip", has already been applied/ }),
    ).toBeInTheDocument();
    // The Linked Trip select displays the pre-selected trip's name.
    expect(screen.getByDisplayValue('Test Trip')).toBeInTheDocument();
  });

  it('shows no notice and leaves the trip unlinked when the only trip is in the past', async () => {
    const { queryClient } = renderForm({ activeTrip: false });

    // Wait for the trips fetch to settle so the "no notice" assertions run against loaded data.
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryByRole('heading', { name: /has already been applied/ })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Trip')).not.toBeInTheDocument();
  });
});

describe('NewSpendForm mutation failure', () => {
  afterEach(() => {
    // The toast store is module-scoped and outlives this test, so clear it explicitly.
    clearAllToasts();
  });

  it('shows the global error toast when the save request fails', async () => {
    server.use(
      http.post('*/api/spending/discretionary/add', () =>
        HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
      ),
    );
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    // The app's real QueryClient (mutationCache wired to the toast store), since this is
    // exercising the production error-handling path rather than a form-local concern.
    const { user } = renderWithProviders(
      <>
        <ToastContainer />
        <NewSpendForm onCancel={onCancel} onSubmit={onSubmit} />
      </>,
      { queryClient: createQueryClient() },
    );

    await user.type(screen.getByPlaceholderText('$0.00'), '50');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText("Couldn't save your changes")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
