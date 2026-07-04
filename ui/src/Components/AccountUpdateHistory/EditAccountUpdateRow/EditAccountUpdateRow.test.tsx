import { describe, expect, it } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import EditAccountUpdateRow from './EditAccountUpdateRow';

const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

function renderRow() {
  const edits = captureRequests('/api/accounts/update/edit');
  const utils = renderWithProviders(
    <EditAccountUpdateRow accountId={ACCOUNT_ID} updateId={7} dateLabel="June 2026" currentAmount={5000} />,
  );
  return { ...utils, edits };
}

describe('EditAccountUpdateRow confirm gating', () => {
  it('hides the confirm button while the amount is unchanged', () => {
    renderRow();

    expect(screen.getByDisplayValue('$5,000.00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
  });

  it('hides the confirm button when the amount is cleared to zero/empty', async () => {
    const { user, edits } = renderRow();

    await user.clear(screen.getByDisplayValue('$5,000.00'));

    expect(screen.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
    expect(edits).toHaveLength(0);
  });

  it('shows the confirm button for a changed amount and sends the edit mutation', async () => {
    const { user, edits } = renderRow();

    const input = screen.getByDisplayValue('$5,000.00');
    await user.clear(input);
    await user.type(input, '5500');

    await user.click(await screen.findByRole('button', { name: 'Confirm change' }));

    await waitFor(() => {
      expect(edits).toHaveLength(1);
      expect(edits[0].body).toMatchObject({ accountId: ACCOUNT_ID, updateId: 7, amount: 5500 });
    });
  });
});
