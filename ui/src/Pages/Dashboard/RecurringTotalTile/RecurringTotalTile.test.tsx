import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import RecurringTotalTile from './RecurringTotalTile';

describe('RecurringTotalTile', () => {
  it('renders the recurring total from the seed data as a loss', async () => {
    renderWithProviders(<RecurringTotalTile />);

    expect(screen.getByRole('heading', { name: 'Recurring total' })).toBeInTheDocument();
    expect(await screen.findByText('-$60.00')).toBeInTheDocument();
  });
});
