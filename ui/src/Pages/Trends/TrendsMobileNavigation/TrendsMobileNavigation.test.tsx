import { beforeEach, describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import TrendsMobileNavigation from './TrendsMobileNavigation';

describe('TrendsMobileNavigation timeframe toggle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
  });

  function renderNav() {
    return renderWithProviders(<TrendsMobileNavigation />);
  }

  it('defaults to monthly: shows current month + year, a Yearly toggle, and two stepper arrows', () => {
    const { container } = renderNav();

    expect(screen.getByRole('button', { name: 'Yearly' })).toBeInTheDocument();
    expect(screen.getByText('June')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="arrowButton"]')).toHaveLength(2);
  });

  it('switches to yearly: toggle flips to Monthly and the label drops the month name', async () => {
    const { user } = renderNav();

    await user.click(screen.getByRole('button', { name: 'Yearly' }));

    expect(screen.getByRole('button', { name: 'Monthly' })).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    // In yearly mode the standalone month label is no longer rendered.
    expect(screen.queryByText('June')).not.toBeInTheDocument();
  });

  it('switches back to monthly and restores the current month label', async () => {
    const { user } = renderNav();

    await user.click(screen.getByRole('button', { name: 'Yearly' }));
    await user.click(screen.getByRole('button', { name: 'Monthly' }));

    expect(screen.getByRole('button', { name: 'Yearly' })).toBeInTheDocument();
    expect(screen.getByText('June')).toBeInTheDocument();
  });
});
