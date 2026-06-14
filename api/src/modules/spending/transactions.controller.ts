import getUsernameFromToken from '@utils/TokenUtils/getUsernameFromToken';
import zodValidateDbDateFormat from '@utils/zodCustomValidators/zodValidateDbDateFormat';
import { NextFunction, Request, Response, Router } from 'express';
import { z as zod } from 'zod';
import { getTransactions } from './transactions.service';

const api = Router();

// Request validation lives in the HTTP layer — it's the boundary where untrusted input arrives.
const transactionsSchema = zod.object({
  startDate: zodValidateDbDateFormat,
  endDate: zodValidateDbDateFormat,
});

type TransactionsRequestQuery = zod.infer<typeof transactionsSchema>;

// GET /api/spending/transactions — discretionary transactions from the `spend_transactions` table.
api.get(
  '/transactions',
  async (
    request: Request<unknown, unknown, unknown, TransactionsRequestQuery>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { startDate, endDate } = transactionsSchema.parse(request.query);
      const username = getUsernameFromToken(request.cookies.token);

      const transactions = await getTransactions(username, startDate, endDate);

      response.status(200).json(transactions);
    } catch (error) {
      // Hand off to the global HttpErrorHandler (registered last in index.ts).
      next(error);
    }
  },
);

export default api;
