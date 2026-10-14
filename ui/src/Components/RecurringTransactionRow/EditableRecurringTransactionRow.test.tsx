import { describe, expect, it } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import type { RecurringTransactionId } from '@spend-watcher/contract';
import EditableRecurringTransactionRow from './EditableRecurringTransactionRow';

const TRANSACTION_ID = 'Recurring-3' as RecurringTransactionId;

function renderRow() {
  const edits = captureRequests('/api/spending/recurring/transactions/edit');
  const utils = renderWithProviders(
    <EditableRecurringTransactionRow transactionId={TRANSACTION_ID} label="June 2026" amountSpent={60} />,
  );
  return { ...utils, edits };
}

describe('EditableRecurringTransactionRow confirm gating', () => {
  it('prefills the amount from props and hides the confirm button while unchanged', () => {
    renderRow();

    expect(screen.getByDisplayValue('$60.00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
  });

  it('hides the confirm button when the amount is cleared to zero/empty', async () => {
    const { user, edits } = renderRow();

    await user.clear(screen.getByDisplayValue('$60.00'));

    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
    expect(edits).toHaveLength(0);
  });

  it('shows the confirm button for a changed amount and sends the edit mutation', async () => {
    const { user, edits } = renderRow();

    const input = screen.getByDisplayValue('$60.00');
    await user.clear(input);
    await user.type(input, '75');

    await user.click(await screen.findByRole('button', { name: 'Confirm change' }));

    await waitFor(() => {
      expect(edits).toHaveLength(1);
      expect(edits[0].body).toMatchObject({ transactionId: TRANSACTION_ID, amountSpent: 75 });
    });
  });
});
