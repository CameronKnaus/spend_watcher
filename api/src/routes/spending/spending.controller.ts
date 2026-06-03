import { formatDbDate } from '@utils/DateUtils/dateUtils';
import getUsernameFromToken from '@utils/TokenUtils/getUsernameFromToken';
import { isBefore } from 'date-fns';
import { NextFunction, Request, Response, Router } from 'express';
import {
  AddRecurringSpendRequestParams,
  AddRecurringTransactionRequestParams,
  DeleteRecurringSpendRequestParams,
  DiscretionaryAddRequestParams,
  DiscretionaryDeleteRequestParams,
  DiscretionaryEditRequestParams,
  EditRecurringSpendRequestParams,
  EditRecurringTransactionRequestParams,
  RecurringTransactionsListRequestParams,
  RecurringTransactionsListV1Response,
  SetActiveRecurringSpendRequestParams,
  SpendingDetailsRequestParams,
  SpendingHistoryStartV1Response,
  TransactionsRequestParams,
  YearlyAverageV1Response,
  v1AddRecurringSpendSchema,
  v1AddRecurringTransactionSchema,
  v1DeleteRecurringSpendSchema,
  v1DetailsSchema,
  v1DiscretionaryAddSchema,
  v1DiscretionaryDeleteSchema,
  v1DiscretionaryEditSchema,
  v1EditRecurringSpendSchema,
  v1EditRecurringTransactionSchema,
  v1RecurringTransactionsListSchema,
  v1SetActiveRecurringSpendSchema,
  v1TransactionsSchema,
} from './spending.model';
import {
  addRecurringSpend,
  addRecurringTransaction,
  deleteDiscretionaryTransaction,
  deleteRecurringTransaction,
  editDiscretionaryTransaction,
  editRecurringSpend,
  editRecurringTransaction,
  fetchDiscretionarySpending,
  fetchRecurringSpendTransactionsList,
  fetchRecurringTransactionHistory,
  fetchRecurringTransactionsSummary,
  fetchYearlyMonthlyTotals,
  getEarliestDiscretionaryTransactionDate,
  getEarliestRecurringTransactionDate,
  logDiscretionaryTransaction,
  updateFixedRecurringMonthlySpendData,
  updateRecurringSpendActiveStatus,
} from './spending.service';
import recurringSummaryTransform from './transforms/recurringSummaryTransform/recurringSummaryTransform';
import recurringTransactionsListTransform from './transforms/recurringTransactionsListTransform/recurringTransactionsListTransform';
import spendingDetailsTransform from './transforms/spendingDetailsTransform/spendingDetailsTransform';
import transactionsTransform from './transforms/transactionsTransform/transactionsTransform';

const api = Router();

// Provides in-depth spending details for the given time period including both discretionary and recurring spending.
api.get(
  '/v1/details',
  async (
    request: Request<unknown, unknown, unknown, SpendingDetailsRequestParams>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedRequest = v1DetailsSchema.parse(request.query);
      const username = getUsernameFromToken(request.cookies.token);

      await updateFixedRecurringMonthlySpendData(username);

      const { startDate, endDate } = parsedRequest;
      const discretionaryTransactions = await fetchDiscretionarySpending(username, startDate, endDate);
      const recurringTransactions = await fetchRecurringTransactionHistory(username, startDate, endDate);

      const transformedResponse = spendingDetailsTransform(discretionaryTransactions, recurringTransactions);
      response.status(200).json(transformedResponse);
    } catch (error) {
      next(error);
    }
  },
);

// Just the data points (for use with d3).  Investigate replacing /details with this as it currently doubles the fetch calls
api.get(
  '/v1/transactions',
  async (
    request: Request<unknown, unknown, unknown, TransactionsRequestParams>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);

      const { startDate, endDate } = v1TransactionsSchema.parse(request.query);

      const [discretionaryTransactions, recurringTransactions] = await Promise.all([
        fetchDiscretionarySpending(username, startDate, endDate),
        fetchRecurringTransactionHistory(username, startDate, endDate),
      ]);

      const transformedResponse = transactionsTransform(discretionaryTransactions, recurringTransactions);

      response.status(200).json(transformedResponse);
    } catch (error) {
      next(error);
    }
  },
);

// Allows logging a new discretionary transaction
api.post(
  '/v1/discretionary/add',
  async (request: Request<DiscretionaryAddRequestParams>, response: Response, next: NextFunction) => {
    try {
      const parsedRequest = v1DiscretionaryAddSchema.parse(request.body);
      const username = getUsernameFromToken(request.cookies.token);

      await logDiscretionaryTransaction(username, parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Allows editing an existing discretionary transaction
api.post(
  '/v1/discretionary/edit',
  async (request: Request<DiscretionaryEditRequestParams>, response: Response, next: NextFunction) => {
    try {
      const parsedRequest = v1DiscretionaryEditSchema.parse(request.body);
      const username = getUsernameFromToken(request.cookies.token);

      await editDiscretionaryTransaction(username, parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Allows deleting an existing discretionary transaction
api.post(
  '/v1/discretionary/delete',
  async (request: Request<DiscretionaryDeleteRequestParams>, response: Response, next: NextFunction) => {
    try {
      const parsedRequest = v1DiscretionaryDeleteSchema.parse(request.body);
      const username = getUsernameFromToken(request.cookies.token);

      await deleteDiscretionaryTransaction(username, parsedRequest.transactionId);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Provides a summary of recurring transactions for the given time period.
api.get('/v1/recurring/summary', async (request: Request<undefined>, response: Response, next: NextFunction) => {
  try {
    const username = getUsernameFromToken(request.cookies.token);

    await updateFixedRecurringMonthlySpendData(username);

    const recurringTransactions = await fetchRecurringTransactionsSummary(username);

    const transformedResponse = recurringSummaryTransform(recurringTransactions);
    response.status(200).json(transformedResponse);
  } catch (error) {
    next(error);
  }
});

// Allows creation of a new recurring spend
api.post(
  '/v1/recurring/add',
  async (request: Request<AddRecurringSpendRequestParams>, response: Response, next: NextFunction) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);
      const parsedRequest = v1AddRecurringSpendSchema.parse(request.body);

      await addRecurringSpend(username, parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Allows editing an existing recurring spend
api.post(
  '/v1/recurring/edit',
  async (request: Request<EditRecurringSpendRequestParams>, response: Response, next: NextFunction) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);
      const parsedRequest = v1EditRecurringSpendSchema.parse(request.body);

      await editRecurringSpend(username, parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Permanently deletes a recurring spend and all associated transactions.  This action cannot be undone.
api.post(
  '/v1/recurring/delete',
  async (request: Request<DeleteRecurringSpendRequestParams>, response: Response, next: NextFunction) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);
      const parsedRequest = v1DeleteRecurringSpendSchema.parse(request.body);

      await deleteRecurringTransaction(username, parsedRequest.recurringSpendId);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

/**
 *  Allows for setting the recurring spending as "active" or "inactive". Inactive recurring spends will
 *  no longer be automatically logged each month if fixed, nor prompt the user to log them if variable.
 */
api.post(
  '/v1/recurring/set-active',
  async (request: Request<SetActiveRecurringSpendRequestParams>, response: Response, next: NextFunction) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);
      const parsedRequest = v1SetActiveRecurringSpendSchema.parse(request.body);

      await updateRecurringSpendActiveStatus(username, parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Fetches all transactions tied to a given recurring spend.
api.get(
  '/v1/recurring/transactions',
  async (
    request: Request<unknown, unknown, unknown, RecurringTransactionsListRequestParams>,
    response: Response<RecurringTransactionsListV1Response>,
    next: NextFunction,
  ) => {
    try {
      const parsedRequest = v1RecurringTransactionsListSchema.parse(request.query);

      const transactions = await fetchRecurringSpendTransactionsList(parsedRequest.recurringSpendId);
      const formattedTransactions = recurringTransactionsListTransform(transactions);

      response.status(200).json(formattedTransactions);
    } catch (error) {
      next(error);
    }
  },
);

// Edits a given transaction tied to a recurring monthly spend.
api.post(
  '/v1/recurring/transactions/edit',
  async (request: Request<EditRecurringTransactionRequestParams>, response: Response, next: NextFunction) => {
    try {
      const parsedRequest = v1EditRecurringTransactionSchema.parse(request.body);

      await editRecurringTransaction(parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Adds a transaction for a given month tied to a recurring monthly spend.
api.post(
  '/v1/recurring/transactions/add',
  async (request: Request<AddRecurringTransactionRequestParams>, response: Response, next: NextFunction) => {
    try {
      const parsedRequest = v1AddRecurringTransactionSchema.parse(request.body);

      await addRecurringTransaction(parsedRequest);
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  },
);

// Provides the earliest date the user has transactions data for
api.get(
  '/v1/history-start',
  async (request: Request, response: Response<SpendingHistoryStartV1Response>, next: NextFunction) => {
    const username = getUsernameFromToken(request.cookies.token);

    try {
      const [{ earliest_discretionary_transaction_date }, { earliest_recurring_transaction_date }] = await Promise.all([
        getEarliestDiscretionaryTransactionDate(username),
        getEarliestRecurringTransactionDate(username),
      ]);

      const earliestDiscretionary = new Date(earliest_discretionary_transaction_date);
      const earliestRecurring = new Date(earliest_recurring_transaction_date);

      const earliestDate = isBefore(earliestDiscretionary, earliestRecurring)
        ? earliestDiscretionary
        : earliestRecurring;

      response.status(200).json({
        earliestTransactionDate: formatDbDate(earliestDate),
        earliestRecurringTransactionDate: formatDbDate(earliestRecurring),
        earliestDiscretionaryTransactionDate: formatDbDate(earliestDiscretionary),
      });
    } catch (error) {
      next(error);
    }
  },
);

// Provides the monthly average spend for the current year (completed months only)
// and a YoY comparison against the prior calendar year's monthly average.
api.get(
  '/v1/yearly-average',
  async (request: Request, response: Response<YearlyAverageV1Response>, next: NextFunction) => {
    try {
      const username = getUsernameFromToken(request.cookies.token);

      await updateFixedRecurringMonthlySpendData(username);

      const now = new Date();
      const currentYear = now.getFullYear();
      const previousYear = currentYear - 1;

      const rows = await fetchYearlyMonthlyTotals(username, currentYear, previousYear);

      const currentRow = rows.find((r) => Number(r.year) === currentYear);
      const previousRow = rows.find((r) => Number(r.year) === previousYear);

      const currentYtdAvg =
        currentRow && Number(currentRow.months_with_data) > 0
          ? Number(currentRow.total_amount) / Number(currentRow.months_with_data)
          : null;

      const previousYearAvg = previousRow ? Number(previousRow.total_amount) / 12 : null;
      const previousHasEnoughData = Number(previousRow?.months_with_data ?? 0) >= 6;

      const monthlyAverage = currentYtdAvg ?? previousYearAvg ?? 0;

      const comparison =
        currentYtdAvg != null && previousYearAvg != null && previousHasEnoughData && previousYearAvg > 0
          ? {
              year: previousYear,
              monthlyAverage: previousYearAvg,
              percentChange: (currentYtdAvg - previousYearAvg) / previousYearAvg,
            }
          : null;

      response.status(200).json({ monthlyAverage, comparison });
    } catch (error) {
      next(error);
    }
  },
);

export default api;
