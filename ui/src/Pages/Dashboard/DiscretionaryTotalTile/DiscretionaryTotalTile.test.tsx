import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import DiscretionaryTotalTile from './DiscretionaryTotalTile';

describe('DiscretionaryTotalTile', () => {
  it('renders the discretionary total from the seed data as a loss', async () => {
    renderWithProviders(<DiscretionaryTotalTile />);

    expect(screen.getByRole('heading', { name: 'Discretionary total' })).toBeInTheDocument();
    expect(await screen.findByText('-$126.00')).toBeInTheDocument();
  });
});
