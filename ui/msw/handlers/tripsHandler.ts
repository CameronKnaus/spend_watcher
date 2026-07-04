import { http, HttpResponse } from 'msw';
import { tripExpensesResponse } from '../mocks/trips/tripExpensesResponse';
import { tripsListResponse } from '../mocks/trips/tripsListResponse';

export const tripsHandlers = [
  http.get('*/api/trips/list', () => HttpResponse.json(tripsListResponse)),
  http.get('*/api/trips/expenses', () => HttpResponse.json(tripExpensesResponse)),
];
