import { describe, it, expect } from 'vitest';
import { AccountCategory, type AccountsSummaryResponse } from '@spend-watcher/contract';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import TotalsByAccountType from './TotalsByAccountType';

type AccountEntry = AccountsSummaryResponse['accountsList'][number];
type CategoryTotals = AccountsSummaryResponse['accountTotalsByType'];

const BASE_ACCOUNT = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Test Checking',
  currentAccountValue: 5000,
  category: AccountCategory.CHECKING,
  isFixedRate: true,
  annualPercentageRate: 0,
  lastUpdated: '2026-06',
  requiresNewUpdate: false,
} satisfies AccountEntry;

const ZERO_TOTALS = {
  [AccountCategory.CHECKING]: 0,
  [AccountCategory.SAVINGS]: 0,
  [AccountCategory.INVESTING]: 0,
  [AccountCategory.BONDS]: 0,
} satisfies CategoryTotals;

describe('TotalsByAccountType', () => {
  function renderWithTotals(totals: Partial<CategoryTotals>) {
    server.use(
      http.get('*/api/accounts/summary', () =>
        HttpResponse.json({
          totalEquity: 5000,
          totalAccountsCount: 1,
          accountsCountByCategory: ZERO_TOTALS,
          accountTotalsByType: { ...ZERO_TOTALS, ...totals },
          accountsList: [BASE_ACCOUNT],
        } satisfies AccountsSummaryResponse),
      ),
    );
    return renderWithProviders(<TotalsByAccountType />);
  }

  it('renders one row per account type with the seeded total, formatted as a signed gain', async () => {
    renderWithTotals({ [AccountCategory.CHECKING]: 5000 });

    expect(screen.getByRole('heading', { name: 'Totals by account type' })).toBeInTheDocument();
    expect(await screen.findByText('Checking')).toBeInTheDocument();
    // isGainLoss formatting shows the sign on positive amounts.
    expect(screen.getByText('+$5,000.00')).toBeInTheDocument();
  });

  it('sorts the type rows by total descending and sums each type independently', async () => {
    renderWithTotals({
      [AccountCategory.CHECKING]: 5000,
      [AccountCategory.SAVINGS]: 8000,
      [AccountCategory.INVESTING]: 1200,
    });

    // Labels come from the content map (INVESTING -> "Investment").
    expect(await screen.findByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Investment')).toBeInTheDocument();

    const amounts = screen.getAllByText(/^\+\$[\d,]+\.\d{2}$/).map((node) => node.textContent);
    // Highest total first: Savings ($8,000) > Checking ($5,000) > Investing ($1,200).
    expect(amounts).toEqual(['+$8,000.00', '+$5,000.00', '+$1,200.00']);
  });
});
