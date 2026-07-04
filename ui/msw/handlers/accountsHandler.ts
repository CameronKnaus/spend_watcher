import { http, HttpResponse } from 'msw';
import { currentMonth } from '../utils';
import { accountsGrowthOverTimeResponse } from '../mocks/accounts/accountsGrowthOverTimeResponse';
import { accountsSummaryResponse } from '../mocks/accounts/accountsSummaryResponse';

export const accountsHandlers = [
  http.get('*/api/accounts/summary', () => HttpResponse.json(accountsSummaryResponse)),
  http.get('*/api/accounts/growth-over-time', () => HttpResponse.json(accountsGrowthOverTimeResponse)),
  // Dynamic pieces: the accountId echoes the query param, and the date is computed at request time
  // so the "current month already logged" baseline holds under any test's vi.setSystemTime.
  http.get('*/api/accounts/history', ({ request }) => {
    const accountId = new URL(request.url).searchParams.get('accountId') ?? '';
    return HttpResponse.json({
      accountId,
      updateHistory: [{ date: currentMonth(), amount: 5000, updateId: 1 }],
    });
  }),
];
