import { describe, it, expect } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { accountsSummaryResponse } from '@msw/mocks/accounts/accountsSummaryResponse';
import { AccountCategory } from '@spend-watcher/contract';
import NetWorthSummaryTile from './NetWorthSummaryTile';

// The design-doc example: 45% / 38% / 10% / 7% with +$7,702 YTD growth.
const multiTypeSummary = {
  ...accountsSummaryResponse,
  totalEquity: 48902,
  yearStartNetWorth: 41200,
  accountTotalsByType: {
    [AccountCategory.CHECKING]: 4823,
    [AccountCategory.SAVINGS]: 18450,
    [AccountCategory.INVESTING]: 22120,
    [AccountCategory.BONDS]: 3509,
  },
};

describe('NetWorthSummaryTile', () => {
  it('renders the total with an allocation bar and legend sorted by amount', async () => {
    server.use(http.get('*/api/accounts/summary', () => HttpResponse.json(multiTypeSummary)));
    renderWithProviders(<NetWorthSummaryTile />);

    expect(screen.getByRole('heading', { name: 'Net worth' })).toBeInTheDocument();
    expect(await screen.findByText('$48,902.00')).toBeInTheDocument();

    const segments = screen.getAllByTestId('allocation-segment');
    expect(segments).toHaveLength(4);
    expect(segments[0].getAttribute('style')).toContain('INVESTING');
    expect(segments[0].getAttribute('style')).toContain('width: 45.2');
    expect(segments[3].getAttribute('style')).toContain('BONDS');

    const legendTexts = screen.getAllByTestId('allocation-legend-item').map((item) => item.textContent);
    expect(legendTexts).toEqual([
      'Investment $22,120.00 · 45%',
      'Savings $18,450.00 · 38%',
      'Checking $4,823.00 · 10%',
      'Bonds $3,509.00 · 7%',
    ]);
  });

  it('shows YTD growth against the year-start net worth', async () => {
    server.use(http.get('*/api/accounts/summary', () => HttpResponse.json(multiTypeSummary)));
    renderWithProviders(<NetWorthSummaryTile />);

    expect(await screen.findByText('+$7,702.00')).toBeInTheDocument();
    expect(screen.getByText('YTD growth')).toBeInTheDocument();
  });

  it('shows a YTD decline as a loss', async () => {
    server.use(
      http.get('*/api/accounts/summary', () => HttpResponse.json({ ...multiTypeSummary, yearStartNetWorth: 50000 })),
    );
    renderWithProviders(<NetWorthSummaryTile />);

    expect(await screen.findByText('-$1,098.00')).toBeInTheDocument();
    expect(screen.getByText('YTD growth')).toBeInTheDocument();
  });

  it('hides the YTD badge when there is no pre-year history', async () => {
    server.use(
      http.get('*/api/accounts/summary', () => HttpResponse.json({ ...multiTypeSummary, yearStartNetWorth: null })),
    );
    renderWithProviders(<NetWorthSummaryTile />);

    expect(await screen.findByText('$48,902.00')).toBeInTheDocument();
    expect(screen.queryByText('YTD growth')).toBeNull();
  });

  it('skips account types with no balance', async () => {
    renderWithProviders(<NetWorthSummaryTile />);

    // Baseline mock holds a single $5,000 checking account — the total and the sole legend entry
    // show the same amount.
    expect(await screen.findAllByText('$5,000.00')).toHaveLength(2);
    const segments = screen.getAllByTestId('allocation-segment');
    expect(segments).toHaveLength(1);
    expect(segments[0].getAttribute('style')).toContain('width: 100%');
    expect(screen.getAllByTestId('allocation-legend-item').map((item) => item.textContent)).toEqual([
      'Checking $5,000.00 · 100%',
    ]);
  });

  it('shows the empty state instead of a bar when there is no equity', async () => {
    server.use(
      http.get('*/api/accounts/summary', () =>
        HttpResponse.json({
          ...accountsSummaryResponse,
          totalEquity: 0,
          accountTotalsByType: {
            [AccountCategory.CHECKING]: 0,
            [AccountCategory.SAVINGS]: 0,
            [AccountCategory.INVESTING]: 0,
            [AccountCategory.BONDS]: 0,
          },
        }),
      ),
    );
    renderWithProviders(<NetWorthSummaryTile />);

    expect(await screen.findByText('Add an account with a balance to see your allocation.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('allocation-segment')).toHaveLength(0);
  });
});
