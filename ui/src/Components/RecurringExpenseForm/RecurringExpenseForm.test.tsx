import { describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import { SpendingCategory } from '@spend-watcher/contract';
import type { RecurringSpendTransaction } from '@spend-watcher/contract';
import RecurringExpenseForm from './RecurringExpenseForm';

const INTERNET_EXPENSE: RecurringSpendTransaction = {
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

function renderForm(expenseToEdit?: RecurringSpendTransaction) {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  // Capture both mutations the form can fire so cancel/validation flows can assert nothing was sent.
  const adds = captureRequests('/api/spending/recurring/add');
  const edits = captureRequests('/api/spending/recurring/edit');
  const utils = renderWithProviders(
    <RecurringExpenseForm onCancel={onCancel} onSubmit={onSubmit} expenseToEdit={expenseToEdit} />,
  );
  return { ...utils, onCancel, onSubmit, adds, edits };
}

describe('RecurringExpenseForm add mode', () => {
  it('fires onCancel without sending any request', async () => {
    const { user, onCancel, adds, edits } = renderForm();

    await user.type(screen.getByPlaceholderText('Rent payment'), 'Netflix');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(adds).toHaveLength(0);
    expect(edits).toHaveLength(0);
  });

  it('blocks submit while the expense name is missing', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('$0.00'), '50');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit while the monthly amount is missing', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Rent payment'), 'Netflix');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit when the name exceeds 30 characters', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Rent payment'), 'N'.repeat(31));
    await user.type(screen.getByPlaceholderText('$0.00'), '50');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('POSTs a valid new recurring expense with the variable flag from the checkbox', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Rent payment'), 'Electric bill');
    await user.click(screen.getByRole('checkbox'));
    await user.type(screen.getByPlaceholderText('$0.00'), '80');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(adds).toHaveLength(1);
    expect(adds[0].body).toMatchObject({
      recurringSpendName: 'Electric bill',
      category: 'OTHER',
      expectedMonthlyAmount: 80,
      isVariableRecurring: true,
    });
  });
});

describe('RecurringExpenseForm edit mode', () => {
  it('prefills from the expense being edited and refuses to submit while unchanged', async () => {
    const { user, onSubmit, adds, edits } = renderForm(INTERNET_EXPENSE);

    expect(screen.getByPlaceholderText('Rent payment')).toHaveValue('Internet');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Not dirty => the submit is swallowed; nothing is sent.
    expect(adds).toHaveLength(0);
    expect(edits).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('POSTs the edit merged with the recurringSpendId once a field changes', async () => {
    const { user, onSubmit, edits } = renderForm(INTERNET_EXPENSE);

    const nameInput = screen.getByPlaceholderText('Rent payment');
    await user.clear(nameInput);
    await user.type(nameInput, 'Internet + TV');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(edits).toHaveLength(1);
    expect(edits[0].body).toMatchObject({
      recurringSpendName: 'Internet + TV',
      recurringSpendId: '33333333-3333-4333-8333-333333333333',
    });
  });
});
