import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor, within } from 'test/testUtils';
import type { Trip } from '@spend-watcher/contract';
import TripForm from './TripForm';

const TEST_TRIP: Trip = {
  tripId: '22222222-2222-4222-8222-222222222222',
  tripName: 'Test Trip',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15));
});

function renderAddForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const adds = captureRequests('/api/trips/add');
  const utils = renderWithProviders(<TripForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...utils, onSubmit, onCancel, adds };
}

function renderEditForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const onDelete = vi.fn();
  const edits = captureRequests('/api/trips/edit');
  const deletes = captureRequests('/api/trips/delete');
  const utils = renderWithProviders(
    <TripForm tripToEdit={TEST_TRIP} onSubmit={onSubmit} onCancel={onCancel} onDelete={onDelete} />,
  );
  return { ...utils, onSubmit, onCancel, onDelete, edits, deletes };
}

describe('TripForm add mode', () => {
  it('fires onCancel without sending any request', async () => {
    const { user, onCancel, adds } = renderAddForm();

    await user.type(screen.getByPlaceholderText('Europe summer trip'), 'Cancelled Trip');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(adds).toHaveLength(0);
  });

  it('blocks submit while the trip name is empty', async () => {
    const { user, onSubmit, adds } = renderAddForm();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // The trip_name DB column is varchar(30); the contract schema the form now resolves against
  // caps the name at the same bound.
  it('blocks submit when the trip name exceeds 30 characters', async () => {
    const { user, onSubmit, adds } = renderAddForm();

    await user.type(screen.getByPlaceholderText('Europe summer trip'), 'T'.repeat(31));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('POSTs a trip named via the form with both dates defaulting to today', async () => {
    const { user, onSubmit, adds } = renderAddForm();

    await user.type(screen.getByPlaceholderText('Europe summer trip'), 'Day Trip');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(adds).toHaveLength(1));
    expect(adds[0].body).toMatchObject({
      tripName: 'Day Trip',
      startDate: '2026-06-15',
      endDate: '2026-06-15',
    });
  });

  it('keeps the form open when the add-trip request fails', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const adds = captureRequests('/api/trips/add', { status: 500 });
    const { user } = renderWithProviders(<TripForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.type(screen.getByPlaceholderText('Europe summer trip'), 'Doomed Trip');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(adds).toHaveLength(1));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('end-date picker disables days before the selected start date', async () => {
    const { user } = renderAddForm();

    // Both pickers default to today (June 15). Open the END picker: days before the start date
    // are blocked by minDate = startDate.
    const dateInputs = screen.getAllByRole('textbox', { name: /Choose date/ });
    await user.click(dateInputs[1]);
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('gridcell', { name: '14' })).toBeDisabled(); // before start
    expect(within(dialog).getByRole('gridcell', { name: '20' })).toBeEnabled(); // after start
  });
});

describe('TripForm edit mode', () => {
  it('prefills from the trip being edited and POSTs the edit with its tripId', async () => {
    const { user, onSubmit, edits } = renderEditForm();

    const nameInput = screen.getByPlaceholderText('Europe summer trip');
    expect(nameInput).toHaveValue('Test Trip');

    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed Trip');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(edits).toHaveLength(1));
    expect(edits[0].body).toMatchObject({
      tripId: TEST_TRIP.tripId,
      tripName: 'Renamed Trip',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
    });
  });

  it('shows the delete action only in edit mode and hands off to onDelete without a request', async () => {
    const { user, onDelete, edits, deletes } = renderEditForm();

    await user.click(screen.getByRole('button', { name: /Permanently delete this trip/ }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    // Deletion is confirmed by the parent's speed bump — the form itself must not fire anything.
    expect(edits).toHaveLength(0);
    expect(deletes).toHaveLength(0);
  });

  it('does not render the delete action in add mode', () => {
    renderAddForm();

    expect(screen.queryByRole('button', { name: /Permanently delete this trip/ })).not.toBeInTheDocument();
  });
});
