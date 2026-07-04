import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import AccountUpdateHistory from './AccountUpdateHistory';

const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

function renderHistory(updateHistory: { date: string; amount: number; updateId: number }[]) {
  server.use(http.get('*/api/accounts/history', () => HttpResponse.json({ accountId: ACCOUNT_ID, updateHistory })));
  const onBack = vi.fn();
  const utils = renderWithProviders(<AccountUpdateHistory accountId={ACCOUNT_ID} onBack={onBack} />);
  return { ...utils, onBack };
}

describe('AccountUpdateHistory month rows', () => {
  it('renders one row per month back to the oldest update: editable for logged months, add-buttons for gaps', async () => {
    renderHistory([
      { date: '2026-06', amount: 5000, updateId: 2 },
      { date: '2026-03', amount: 4000, updateId: 1 },
    ]);

    // Logged months render editable amount rows with their values.
    expect(await screen.findByText('June 2026')).toBeInTheDocument();
    expect(screen.getByDisplayValue('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByDisplayValue('$4,000.00')).toBeInTheDocument();

    // Gap months between the updates render collapsed add-buttons.
    expect(screen.getByRole('button', { name: 'Add for May 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add for April 2026' })).toBeInTheDocument();

    // Plus one trailing add-button for the month before the oldest update.
    expect(screen.getByRole('button', { name: 'Add for February 2026' })).toBeInTheDocument();
    expect(screen.queryByText('January 2026')).not.toBeInTheDocument();
  });

  it('fires onBack from the Back button', async () => {
    const { user, onBack } = renderHistory([{ date: '2026-06', amount: 5000, updateId: 1 }]);

    await user.click(await screen.findByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
