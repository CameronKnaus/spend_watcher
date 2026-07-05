import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import { SpendingCategory } from '@spend-watcher/contract';
import type { DiscretionarySpendTransaction } from '@spend-watcher/contract';
import EditSpendForm from './EditSpendForm';

const LUNCH_TRANSACTION: DiscretionarySpendTransaction = {
  transactionId: 'Discretionary-17',
  isRecurring: false,
  category: SpendingCategory.RESTAURANTS,
  amountSpent: 25,
  spentDate: '2026-06-14',
  note: 'Lunch',
};

function renderForm(transactionToEdit: DiscretionarySpendTransaction = LUNCH_TRANSACTION) {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  // Capture both mutations the form can fire so cancel/validation flows can assert nothing was sent.
  const edits = captureRequests('/api/spending/discretionary/edit');
  const deletes = captureRequests('/api/spending/discretionary/delete');
  const utils = renderWithProviders(
    <EditSpendForm transactionToEdit={transactionToEdit} onCancel={onCancel} onSubmit={onSubmit} />,
  );
  return { ...utils, onCancel, onSubmit, edits, deletes };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

describe('EditSpendForm prefill', () => {
  it('populates every field from the transaction being edited', () => {
    renderForm();

    expect(screen.getByPlaceholderText('$0.00')).toHaveValue('$25.00');
    expect(screen.getByDisplayValue('Dining out')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('About your expense')).toHaveValue('Lunch');
    expect(screen.getByRole('textbox', { name: /Choose date/ })).toHaveValue('June 14th, 2026');
  });
});

describe('EditSpendForm cancel', () => {
  it('fires onCancel without sending any request', async () => {
    const { user, onCancel, edits, deletes } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(edits).toHaveLength(0);
    expect(deletes).toHaveLength(0);
  });
});

describe('EditSpendForm validation', () => {
  it('blocks submit after the amount is cleared', async () => {
    const { user, onSubmit, edits } = renderForm();

    await user.clear(screen.getByPlaceholderText('$0.00'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(edits).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('EditSpendForm submission', () => {
  it('POSTs the edited values merged with the original transactionId', async () => {
    const { user, onSubmit, edits } = renderForm();

    const amountInput = screen.getByPlaceholderText('$0.00');
    await user.clear(amountInput);
    await user.type(amountInput, '35');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(edits).toHaveLength(1);
    expect(edits[0].body).toMatchObject({
      transactionId: 'Discretionary-17',
      amountSpent: 35,
      category: 'RESTAURANTS',
      spentDate: '2026-06-14',
      note: 'Lunch',
    });
  });
});

describe('EditSpendForm delete', () => {
  it('sends the delete mutation for this transaction and closes via onCancel', async () => {
    const { user, onCancel, deletes } = renderForm();

    await user.click(screen.getByRole('button', { name: /Permanently delete this expense/ }));

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(deletes).toHaveLength(1);
    expect(deletes[0].body).toMatchObject({ transactionId: 'Discretionary-17' });
  });
});
