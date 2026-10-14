import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { act, renderWithProviders, screen, within } from 'test/testUtils';
import DatePickerController from './DatePickerController';

// This picker renders as the Mobile variant in jsdom (no fine-pointer media query match), which
// requires an explicit "OK" tap to accept a day and close the dialog — unlike the Desktop variant,
// which closes on day click. The dialog's exit transition runs on a real setTimeout, so advancing
// fake timers (inside act, since it drives a React state update) is required before it unmounts.
async function acceptAndCloseDialog(user: ReturnType<typeof renderWithProviders>['user'], dialog: HTMLElement) {
  await user.click(within(dialog).getByRole('button', { name: 'OK' }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
}

type DateForm = { date?: string };

// Mirrors NewSpendForm/TripForm's usage: day-view picker with a human-readable display format.
function DateField({
  isRequired,
  disableFuture,
  onSubmit,
}: {
  isRequired?: boolean;
  disableFuture?: boolean;
  onSubmit?: (values: DateForm) => void;
}) {
  const form = useForm<DateForm>();
  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
      <DatePickerController
        isRequired={isRequired}
        control={form.control}
        name="date"
        views={['year', 'month', 'day']}
        format="MMMM do, yyyy"
        disableFuture={disableFuture}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

beforeEach(() => {
  // Fixed mid-month date so day numbers and future/past assertions are deterministic.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

describe('DatePickerController display', () => {
  it('defaults the field to today, with no value/name props required from the consumer', () => {
    renderWithProviders(<DateField />);

    expect(screen.getByRole('textbox', { name: /Choose date/ })).toHaveValue('June 15th, 2026');
  });
});

describe('DatePickerController day selection', () => {
  it('opens the calendar, picks a visible day, and updates the display', async () => {
    const { user } = renderWithProviders(<DateField />);

    await user.click(screen.getByRole('textbox', { name: /Choose date/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('gridcell', { name: '20' }));
    await acceptAndCloseDialog(user, dialog);

    expect(screen.getByRole('textbox', { name: /Choose date/ })).toHaveValue('June 20th, 2026');
  });

  it('submits the picked day as a yyyy-MM-dd string', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<DateField onSubmit={onSubmit} />);

    await user.click(screen.getByRole('textbox', { name: /Choose date/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('gridcell', { name: '20' }));
    await acceptAndCloseDialog(user, dialog);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ date: '2026-06-20' });
  });
});

describe('DatePickerController disableFuture', () => {
  it('disables tomorrow but keeps today enabled when disableFuture is set', async () => {
    const { user } = renderWithProviders(<DateField disableFuture />);

    await user.click(screen.getByRole('textbox', { name: /Choose date/ }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('gridcell', { name: '16' })).toBeDisabled(); // tomorrow
    expect(within(dialog).getByRole('gridcell', { name: '15' })).toBeEnabled(); // today
  });

  it('leaves tomorrow enabled when disableFuture is not set', async () => {
    const { user } = renderWithProviders(<DateField />);

    await user.click(screen.getByRole('textbox', { name: /Choose date/ }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('gridcell', { name: '16' })).toBeEnabled();
  });
});

describe('DatePickerController validation', () => {
  // Documenting actual behavior, not asserting a spec: the Controller's `defaultValue` always
  // resolves to today's date (see DatePickerController.tsx), so the field is never empty and
  // `isRequired`'s `rules={{ required: isRequired }}` can never actually fail validation.
  it('never blocks submit even when isRequired is set, because the field always defaults to a value', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<DateField isRequired onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ date: '2026-06-15' });
  });
});
