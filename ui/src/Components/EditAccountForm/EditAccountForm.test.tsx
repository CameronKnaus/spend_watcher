import { describe, it, expect, vi } from 'vitest';
import { AccountCategory, type AccountsSummaryResponse } from '@spend-watcher/contract';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import EditAccountForm from './EditAccountForm';

type AccountEntry = AccountsSummaryResponse['accountsList'][number];

const account = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Test Checking',
  currentAccountValue: 5000,
  category: AccountCategory.CHECKING,
  isFixedRate: true,
  annualPercentageRate: 0,
  lastUpdated: '2026-06',
  requiresNewUpdate: false,
} satisfies AccountEntry;

describe('EditAccountForm submit gating', () => {
  function renderForm() {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const edits = captureRequests('/api/accounts/edit');
    const utils = renderWithProviders(
      <EditAccountForm accountToEdit={account} onSubmit={onSubmit} onCancel={onCancel} />,
    );
    return { ...utils, onSubmit, onCancel, edits };
  }

  it('keeps Submit disabled and does not submit while the form is unchanged', async () => {
    const { user, onSubmit } = renderForm();

    expect(screen.getByDisplayValue('Test Checking')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(submit.className).toContain('disabled');

    await user.click(submit);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('enables Submit once a valid change makes the form dirty, and re-disables it on invalid input', async () => {
    const { user } = renderForm();
    const submit = screen.getByRole('button', { name: 'Submit' });
    const nameInput = screen.getByDisplayValue('Test Checking');

    // Dirty + still valid (>= 3 chars) => enabled.
    await user.type(nameInput, ' Updated');
    await waitFor(() => expect(submit.className).not.toContain('disabled'));

    // Too short (< 3 chars) => invalid => disabled again.
    await user.clear(nameInput);
    await user.type(nameInput, 'ab');
    await waitFor(() => expect(submit.className).toContain('disabled'));
  });

  // Replaces e2e: accounts/edit-account-name-validation.spec.ts — the same 3-char rule as the add
  // form, proven behaviorally: a too-short rename never leaves the client.
  it('does not submit a too-short name even when Submit is clicked', async () => {
    const { user, onSubmit, edits } = renderForm();
    const nameInput = screen.getByDisplayValue('Test Checking');

    await user.clear(nameInput);
    await user.type(nameInput, 'ab');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(edits).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // The account_name DB column is varchar(50); the contract schema the form now resolves against
  // caps the name at the same bound.
  it('does not submit a name over the 50-character maximum', async () => {
    const { user, onSubmit, edits } = renderForm();
    const nameInput = screen.getByDisplayValue('Test Checking');

    await user.clear(nameInput);
    await user.type(nameInput, 'A'.repeat(51));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(edits).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('associates the name and fixed-rate labels with their inputs via htmlFor/id', () => {
    renderForm();

    expect(screen.getByLabelText('Account name')).toBe(screen.getByDisplayValue('Test Checking'));
    expect(screen.getByLabelText('This growth rate is fixed')).toBe(screen.getByRole('checkbox'));
  });
});
