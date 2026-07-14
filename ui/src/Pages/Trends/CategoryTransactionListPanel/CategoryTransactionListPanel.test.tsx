import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import { SpendingCategory } from '@spend-watcher/contract';
import type { DiscretionarySpendTransaction, RecurringSpendTransaction } from '@spend-watcher/contract';
import CategoryTransactionListPanel from './CategoryTransactionListPanel';

const DICTIONARY: Record<string, DiscretionarySpendTransaction | RecurringSpendTransaction> = {
  'Discretionary-1': {
    transactionId: 'Discretionary-1',
    isRecurring: false,
    category: SpendingCategory.GROCERIES,
    amountSpent: 86,
    spentDate: '2026-06-14',
    note: 'Weekly groceries',
  },
  'Discretionary-2': {
    transactionId: 'Discretionary-2',
    isRecurring: false,
    category: SpendingCategory.RESTAURANTS,
    amountSpent: 25,
    spentDate: '2026-06-15',
    note: 'Lunch',
  },
  'Recurring-1': {
    transactionId: 'Recurring-1',
    isRecurring: true,
    category: SpendingCategory.GROCERIES,
    amountSpent: 40,
    spentDate: '2026-06-01',
    expectedMonthlyAmount: 40,
    recurringSpendName: 'Meal kit',
    recurringSpendId: '44444444-4444-4444-8444-444444444444',
    isVariableRecurring: false,
    isActive: true,
    requiresMonthlyUpdate: false,
  },
};

function renderPanel(category: SpendingCategory = SpendingCategory.GROCERIES) {
  const onPanelClose = vi.fn();
  const utils = renderWithProviders(
    <CategoryTransactionListPanel category={category} transactionDictionary={DICTIONARY} onPanelClose={onPanelClose} />,
  );
  return { ...utils, onPanelClose };
}

describe('CategoryTransactionListPanel', () => {
  it('shows only the selected category: interactive rows for discretionary, placeholders for recurring', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Groceries', level: 2 })).toBeInTheDocument();
    // The discretionary Groceries transaction is an interactive (editable) row.
    expect(screen.getByRole('button', { name: /Groceries.*\$86\.00.*Weekly groceries/ })).toBeInTheDocument();
    // The recurring Groceries transaction renders as a non-interactive placeholder.
    expect(screen.getByText(/Recurring placeholder/)).toBeInTheDocument();
    expect(screen.getByText('Meal kit')).toBeInTheDocument();
    // The Dining out transaction belongs to another category and is filtered out.
    expect(screen.queryByRole('button', { name: /Lunch/ })).not.toBeInTheDocument();
  });

  it('maps the RESTAURANTS enum to its "Dining out" display label', () => {
    renderPanel(SpendingCategory.RESTAURANTS);

    expect(screen.getByRole('heading', { name: 'Dining out', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dining out.*\$25\.00.*Lunch/ })).toBeInTheDocument();
  });

  it('requests close from the Close button', async () => {
    const { user, onPanelClose } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onPanelClose).toHaveBeenCalledTimes(1);
  });
});
