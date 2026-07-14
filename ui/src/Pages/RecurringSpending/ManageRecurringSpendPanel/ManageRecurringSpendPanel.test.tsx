import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen } from 'test/testUtils';
import { SpendingCategory } from '@spend-watcher/contract';
import type { RecurringSpendTransaction } from '@spend-watcher/contract';
import ManageRecurringSpendPanel from './ManageRecurringSpendPanel';

const INTERNET: RecurringSpendTransaction = {
  transactionId: 'Recurring-3',
  isRecurring: true,
  category: SpendingCategory.UTILITIES,
  amountSpent: 60,
  spentDate: '2026-06-01',
  expectedMonthlyAmount: 60,
  recurringSpendName: 'Internet',
  recurringSpendId: '33333333-3333-4333-8333-333333333333',
  isVariableRecurring: false,
  isActive: true,
  requiresMonthlyUpdate: false,
};

beforeEach(() => {
  // The history tab walks months backwards from "now" — pin the clock.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

function renderPanel(overrides: Partial<RecurringSpendTransaction> = {}) {
  const spend = { ...INTERNET, ...overrides };
  const deletes = captureRequests('/api/spending/recurring/delete');
  const setActives = captureRequests('/api/spending/recurring/set-active');
  const edits = captureRequests('/api/spending/recurring/edit');
  const closePanel = vi.fn();
  const utils = renderWithProviders(
    <ManageRecurringSpendPanel recurringSpendTransaction={spend} closePanel={closePanel} />,
  );
  return { ...utils, closePanel, deletes, setActives, edits };
}

describe('ManageRecurringSpendPanel base view', () => {
  it('offers edit, history, mark-inactive, and delete for an active spend', () => {
    renderPanel();

    expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as inactive' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Permanently delete' })).toBeInTheDocument();
  });

  it('offers reactivation instead of deactivation for an inactive spend', () => {
    renderPanel({ isActive: false });

    expect(screen.getByRole('button', { name: 'Reactive this expense' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as inactive' })).not.toBeInTheDocument();
  });
});

describe('ManageRecurringSpendPanel speed bumps', () => {
  it('delete: warns with the spend name and cancel backs out without a request', async () => {
    const { user, deletes } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Permanently delete' }));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText(/spend data for "Internet" will be permanently deleted/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
    expect(deletes).toHaveLength(0);
  });

  it('mark inactive: cancel returns to the options without a request', async () => {
    const { user, setActives } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Mark as inactive' }));
    expect(screen.getByText('Deactivate this recurring spend')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
    expect(setActives).toHaveLength(0);
  });
});

describe('ManageRecurringSpendPanel edit tab', () => {
  it('cancel in the edit form returns to the base options without a request', async () => {
    const { user, edits } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByPlaceholderText('Rent payment')).toHaveValue('Internet');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
    expect(edits).toHaveLength(0);
  });
});

describe('ManageRecurringSpendPanel update-required auto-open', () => {
  it('opens straight to the history list when the month needs an update', async () => {
    renderPanel({ requiresMonthlyUpdate: true });

    // The history view renders the current-month row (from the default handler) instead of the
    // base options. findBy: the row appears after the MSW round trip.
    expect(screen.queryByText('What would you like to do?')).not.toBeInTheDocument();
    expect(await screen.findByText('June 2026')).toBeInTheDocument();
  });
});
