import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, waitFor } from 'test/testUtils';
import AccountsList from './AccountsList';

describe('AccountsList', () => {
  it('renders the accounts module with the seeded account row and its derived fields', async () => {
    renderWithProviders(<AccountsList />);

    expect(screen.getByRole('heading', { name: 'Your accounts' })).toBeInTheDocument();
    expect(await screen.findByText('Test Checking')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
    // "As of <MMM yyyy>" derived from the account's yyyy-MM lastUpdated.
    expect(screen.getByText('As of Jun 2026')).toBeInTheDocument();
    // Both the list total (equity) and the single account's value render as $5,000.00.
    expect(screen.getAllByText('$5,000.00')).toHaveLength(2);
  });

  it('opens the manage panel with every action when the account row is clicked, then closes it', async () => {
    const { user } = renderWithProviders(<AccountsList />);

    await user.click(await screen.findByRole('button', { name: /Test Checking/ }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Title interpolates the account name; the account is current so the BASE tab (options) shows.
    expect(screen.getByRole('heading', { name: 'Manage Test Checking' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop tracking this account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
