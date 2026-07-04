import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import TripsPage from './TripsPage';

describe('TripsPage', () => {
  it('renders the trips list with the page heading, add button, and the seeded trip card', async () => {
    renderWithProviders(<TripsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'My trips' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Add trip' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Trip' })).toBeInTheDocument();
  });
});
