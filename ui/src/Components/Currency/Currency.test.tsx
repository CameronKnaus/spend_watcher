import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import Currency from './Currency';

describe('Currency', () => {
  it('formats a plain amount without gain/loss treatment', () => {
    renderWithProviders(<Currency amount={-25} />);

    const value = screen.getByText('-$25.00');
    expect(value.style.color).toBe('inherit');
  });

  it('shows an explicit + sign and gain color for positive gain/loss amounts', () => {
    renderWithProviders(<Currency amount={23} isGainLoss />);

    const value = screen.getByText('+$23.00');
    expect(value.style.color).toContain('gain');
  });

  it('shows the loss color for negative gain/loss amounts', () => {
    renderWithProviders(<Currency amount={-40} isGainLoss />);

    const value = screen.getByText('-$40.00');
    expect(value.style.color).toContain('loss');
  });

  it('renders zero as neutral: no sign, standard text color', () => {
    renderWithProviders(<Currency amount={0} isGainLoss />);

    const value = screen.getByText('$0.00');
    expect(value.style.color).toContain('text-standard');
  });

  it('uses compact notation when requested', () => {
    renderWithProviders(<Currency amount={5250} compact />);

    expect(screen.getByText('$5.3K')).toBeInTheDocument();
  });

  it('renders the defaultValue when no amount is provided', () => {
    renderWithProviders(<Currency defaultValue="--" />);

    expect(screen.getByText('--')).toBeInTheDocument();
  });
});
