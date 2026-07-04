import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import NetWorthTile from './NetWorthTile';

// NumberFlow is an animated web component that doesn't render its formatted value as plain text in
// jsdom. Stub it to expose the raw numeric `value` so we can assert the computed net worth.
vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="net-worth-value">{value}</span>,
}));
describe('NetWorthTile', () => {
  it('renders the summed latest net worth and the line chart from the seeded dataset', async () => {
    const { container } = renderWithProviders(<NetWorthTile />);

    expect(screen.getByRole('heading', { name: 'Net worth' })).toBeInTheDocument();

    // Latest date in the baseline growth-over-time data is 2024-03-15 with two accounts
    // ($5,000 + $3,000) => $8,000 summed. Await the MSW round trip.
    expect(await screen.findByTestId('net-worth-value')).toHaveTextContent('8000');
    expect(screen.getByText('March 2024')).toBeInTheDocument();

    // The line path proves the dataset was plotted (not a loading skeleton).
    expect(container.querySelector('svg path')).toBeTruthy();
  });

  it('shows the skeleton loader (heading absent) until the dataset is available', () => {
    // Assert synchronously, before the MSW round trip resolves: the query is still pending, so the
    // tile renders its skeleton branch.
    const { container } = renderWithProviders(<NetWorthTile />);

    expect(screen.queryByText('March 2024')).not.toBeInTheDocument();
    expect(container.querySelector('svg path')).toBeNull();
  });
});
