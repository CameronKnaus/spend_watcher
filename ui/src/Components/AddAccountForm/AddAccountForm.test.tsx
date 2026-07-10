import { describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
import AddAccountForm from './AddAccountForm';

function renderForm() {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  const adds = captureRequests('/api/accounts/add');
  const utils = renderWithProviders(<AddAccountForm onCancel={onCancel} onSubmit={onSubmit} />);
  return { ...utils, onCancel, onSubmit, adds };
}

describe('AddAccountForm defaults', () => {
  it('starts with an empty name, Checking type, and the fixed-rate box checked', () => {
    renderForm();

    expect(screen.getByPlaceholderText('Account name')).toHaveValue('');
    expect(screen.getByDisplayValue('Checking')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('associates the name, category, and fixed-rate labels with their inputs via htmlFor/id', () => {
    renderForm();

    expect(screen.getByLabelText('Account name')).toBe(screen.getByPlaceholderText('Account name'));
    expect(screen.getByLabelText('Account type')).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText('This growth rate is fixed')).toBe(screen.getByRole('checkbox'));
  });
});

describe('AddAccountForm cancel', () => {
  it('fires onCancel without sending any request', async () => {
    const { user, onCancel, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Account name'), 'Temp Account');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(adds).toHaveLength(0);
  });
});

describe('AddAccountForm validation', () => {
  it('blocks submit while the name is empty', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('$0.00'), '2500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks a 2-character name (minimum is 3)', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Account name'), 'ab');
    await user.type(screen.getByPlaceholderText('$0.00'), '2500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // The account_name DB column is varchar(50); the contract schema the form now resolves against
  // caps the name at the same bound.
  it('blocks a 51-character name (maximum is 50)', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Account name'), 'A'.repeat(51));
    await user.type(screen.getByPlaceholderText('$0.00'), '2500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit while the account value is empty', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Account name'), 'My Checking');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(adds).toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AddAccountForm submission', () => {
  it('POSTs the account at the 3-character name boundary and fires onSubmit', async () => {
    const { user, onSubmit, adds } = renderForm();

    await user.type(screen.getByPlaceholderText('Account name'), 'abc');
    await user.type(screen.getByPlaceholderText('$0.00'), '2500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(adds).toHaveLength(1);
    expect(adds[0].body).toMatchObject({
      accountName: 'abc',
      accountCategory: 'CHECKING',
      startingAccountValue: 2500,
      isFixedRate: true,
    });
  });
});
