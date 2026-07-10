import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import Savings from './Savings';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="net-worth-value">{value}</span>,
}));
describe('Savings page', () => {
  it('renders the three savings tiles populated from the baseline account data', async () => {
    renderWithProviders(<Savings />);

    expect(screen.getByRole('heading', { level: 1, name: 'Savings' })).toBeInTheDocument();
    // Two while loading: the summary tile always carries the heading, the growth-chart tile only
    // in its skeleton state.
    expect(screen.getAllByRole('heading', { name: 'Net worth' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Totals by account type' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your accounts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();

    // Data actually flowed into the tiles (await the MSW round trip):
    expect(await screen.findByText('Test Checking')).toBeInTheDocument(); // accounts list row
    expect(await screen.findByText('+$5,000.00')).toBeInTheDocument(); // totals-by-type (gain formatting)
    expect(await screen.findByTestId('net-worth-value')).toHaveTextContent('8000'); // net-worth chart
  });
});
