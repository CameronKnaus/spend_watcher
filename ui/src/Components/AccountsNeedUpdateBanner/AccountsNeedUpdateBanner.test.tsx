import { describe, it, expect } from 'vitest';
import { AccountCategory, type AccountsSummaryResponse } from '@spend-watcher/contract';
import { http, HttpResponse, renderWithProviders, screen, server, waitFor } from 'test/testUtils';
import AccountsNeedUpdateBanner from './AccountsNeedUpdateBanner';

type AccountEntry = AccountsSummaryResponse['accountsList'][number];

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

function makeAccount(overrides: Partial<AccountEntry> = {}) {
  return { ...BASE_ACCOUNT, ...overrides };
}

const BASE_SUMMARY = {
  totalEquity: 5000,
  yearStartNetWorth: null,
  totalAccountsCount: 1,
  accountsCountByCategory: {
    [AccountCategory.CHECKING]: 1,
    [AccountCategory.SAVINGS]: 0,
    [AccountCategory.INVESTING]: 0,
    [AccountCategory.BONDS]: 0,
  },
  accountTotalsByType: {
    [AccountCategory.CHECKING]: 5000,
    [AccountCategory.SAVINGS]: 0,
    [AccountCategory.INVESTING]: 0,
    [AccountCategory.BONDS]: 0,
  },
  accountsList: [BASE_ACCOUNT],
} satisfies AccountsSummaryResponse;

describe('AccountsNeedUpdateBanner', () => {
  function renderBanner(summary: AccountsSummaryResponse) {
    server.use(http.get('*/api/accounts/summary', () => HttpResponse.json(summary)));
    return renderWithProviders(<AccountsNeedUpdateBanner />);
  }

  it('renders nothing when no account requires an update', async () => {
    const { container, queryClient } = renderBanner(BASE_SUMMARY);

    // The banner is also empty while loading, so wait for the summary query to settle before
    // asserting the fetched data really produced no banner.
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(container).toBeEmptyDOMElement();
  });

  it('counts only the accounts that require an update and shows that count', async () => {
    renderBanner({
      ...BASE_SUMMARY,
      accountsList: [
        makeAccount({ id: 'a', name: 'Checking', requiresNewUpdate: false }),
        makeAccount({ id: 'b', name: 'Savings', category: AccountCategory.SAVINGS, requiresNewUpdate: true }),
        makeAccount({ id: 'c', name: 'Brokerage', category: AccountCategory.INVESTING, requiresNewUpdate: true }),
      ],
    });

    expect(await screen.findByText('2 account(s) require updates for this month')).toBeInTheDocument();
  });
});
