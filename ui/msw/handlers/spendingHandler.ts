import { http, HttpResponse } from 'msw';
import { currentMonth } from '../utils';
import { format } from 'date-fns';
import { recurringSummaryResponse } from '../mocks/spending/recurringSummaryResponse';
import { spendingDetailsResponse } from '../mocks/spending/spendingDetailsResponse';
import { spendingHistoryStartResponse } from '../mocks/spending/spendingHistoryStartResponse';
import { buildSpendingPaceResponse } from '../mocks/spending/spendingPaceResponse';
import { spendingYearlyAverageResponse } from '../mocks/spending/spendingYearlyAverageResponse';

export const spendingHandlers = [
  http.get('*/api/spending/details', () => HttpResponse.json(spendingDetailsResponse)),
  http.get('*/api/spending/pace', ({ request }) => {
    const targetDate = new URL(request.url).searchParams.get('targetDate') ?? format(new Date(), 'yyyy-MM-dd');
    return HttpResponse.json(buildSpendingPaceResponse(targetDate));
  }),
  http.get('*/api/spending/history-start', () => HttpResponse.json(spendingHistoryStartResponse)),
  http.get('*/api/spending/yearly-average', () => HttpResponse.json(spendingYearlyAverageResponse)),
  http.get('*/api/spending/recurring/summary', () => HttpResponse.json(recurringSummaryResponse)),
  http.get('*/api/spending/recurring/transactions', () =>
    HttpResponse.json({
      transactions: [{ transactionId: 'Recurring-3', date: currentMonth(), amountSpent: 60 }],
    }),
  ),
];
