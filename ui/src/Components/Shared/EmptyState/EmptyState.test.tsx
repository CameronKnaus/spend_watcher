import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders the given message', () => {
    renderWithProviders(<EmptyState message="Nothing here yet." />);

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('spreads extra div props through, merging a caller className with its own', () => {
    renderWithProviders(<EmptyState message="Nothing here yet." className="custom" data-testid="empty-state" />);

    expect(screen.getByTestId('empty-state')).toHaveClass('custom');
  });
});
