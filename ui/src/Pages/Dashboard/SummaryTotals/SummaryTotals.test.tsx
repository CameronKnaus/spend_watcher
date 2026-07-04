import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import SummaryTotals from './SummaryTotals';

describe('SummaryTotals (desktop)', () => {
  function renderTotals() {
    return renderWithProviders(<SummaryTotals />, { isMobile: false });
  }

  it('renders the three summary tiles with the computed seed totals', async () => {
    renderTotals();

    expect(screen.getByRole('heading', { name: 'Total spent' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Discretionary total' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recurring total' })).toBeInTheDocument();

    // $186 combined ($126 discretionary + $60 recurring), shown as losses.
    expect(await screen.findByText('-$186.00')).toBeInTheDocument();
    expect(screen.getByText('-$126.00')).toBeInTheDocument();
    expect(screen.getByText('-$60.00')).toBeInTheDocument();
  });
});
