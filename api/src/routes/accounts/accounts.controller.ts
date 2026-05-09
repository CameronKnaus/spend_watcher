import { MonthYearDbDate, monthYearDbDateFormat } from '@type/dateTypes';
import getUsernameFromToken from '@utils/TokenUtils/getUsernameFromToken';
import { format, isBefore } from 'date-fns';
import { NextFunction, Request, Response, Router } from 'express';
import { v4 as uuid4 } from 'uuid';
import {
    Account,
    AccountCategory,
    AccountGrowthOverTimeV1Response,
    AccountHistoryV1Response,
    accountsHistoryRequestParamSchema,
    AccountsSummaryV1Response,
    AddAccountRequestParams,
    addAccountRequestParamSchema,
    addAccountUpdateRequestParamSchema,
    AddAccountUpdateV1RequestParams,
    DeleteAccountRequestParams,
    deleteAccountRequestParamSchema,
    EditAccountDetailsRequestParams,
    editAccountDetailsRequestParamsSchema,
    editAccountUpdateRequestParamSchema,
    EditAccountUpdateV1RequestParams,
    SetActiveAccountRequestParams,
    setActiveAccountRequestParamSchema,
} from './accounts.model';
import {
    addAccount,
    addAccountUpdate,
    editAccount,
    editAccountUpdate,
    fetchAccountGrowthOverTimeData,
    fetchAccounts,
    getAccountUpdates,
    permanentlyDeleteAccount,
    setActiveAccount,
} from './accounts.service';

const api = Router();

/**
 * @route GET /v1/add
 *  Allows for adding a new account to track
 */
api.post('/v1/add', async (request: Request<AddAccountRequestParams>, response: Response, next: NextFunction) => {
    try {
        const parsedRequest = addAccountRequestParamSchema.parse(request.body);

        const username = getUsernameFromToken(request.cookies.token);

        const newAccount: Account = {
            id: uuid4(),
            name: parsedRequest.accountName,
            currentAccountValue: parsedRequest.startingAccountValue,
            category: parsedRequest.accountCategory,
            isFixedRate: parsedRequest.isFixedRate,
            annualPercentageRate: parsedRequest.annualPercentageRate ?? 0,
        };

        await addAccount(username, newAccount, parsedRequest.startingAccountValue);
        response.status(200).send();
    } catch (error) {
        next(error);
    }
});

api.post(
    '/v1/edit',
    async (request: Request<EditAccountDetailsRequestParams>, response: Response, next: NextFunction) => {
        try {
            const parsedRequest = editAccountDetailsRequestParamsSchema.parse(request.body);

            const username = getUsernameFromToken(request.cookies.token);
            await editAccount(username, parsedRequest);
            response.status(200).send();
        } catch (error) {
            next(error);
        }
    },
);

// Gets a list of all the user's accounts and summary details about them
api.get('/v1/summary', async (request: Request<undefined>, response: Response, next: NextFunction) => {
    try {
        const username = getUsernameFromToken(request.cookies.token);
        const fetchedAccounts = await fetchAccounts(username);

        let totalEquity = 0;
        let totalAccountsCount = 0;
        const accountsCountByCategory: Record<AccountCategory, number> = {
            [AccountCategory.CHECKING]: 0,
            [AccountCategory.SAVINGS]: 0,
            [AccountCategory.INVESTING]: 0,
            [AccountCategory.BONDS]: 0,
        };
        const accountTotalsByType: Record<AccountCategory, number> = {
            [AccountCategory.CHECKING]: 0,
            [AccountCategory.SAVINGS]: 0,
            [AccountCategory.INVESTING]: 0,
            [AccountCategory.BONDS]: 0,
        };

        const accountsList = fetchedAccounts.map((accountInfo) => {
            const lastUpdatedDate = format(accountInfo.date, monthYearDbDateFormat) as MonthYearDbDate;
            const currentMonthYearDate = format(new Date(), monthYearDbDateFormat);

            // Add account value to total
            totalEquity += accountInfo.amount;
            accountTotalsByType[accountInfo.type] += accountInfo.amount;

            // Add account category total
            totalAccountsCount += 1;
            accountsCountByCategory[accountInfo.type] += 1;

            // Format this account
            return {
                id: accountInfo.account_id,
                name: accountInfo.account_name,
                currentAccountValue: accountInfo.amount,
                category: accountInfo.type,
                isFixedRate: Boolean(accountInfo.is_fixed),
                annualPercentageRate: accountInfo.growth_rate,
                lastUpdated: lastUpdatedDate,
                requiresNewUpdate: isBefore(lastUpdatedDate, currentMonthYearDate),
            } as AccountsSummaryV1Response['accountsList'][number];
        });

        const payload: AccountsSummaryV1Response = {
            totalEquity,
            totalAccountsCount,
            accountTotalsByType,
            accountsCountByCategory,
            accountsList: accountsList.sort((a, b) => (a.currentAccountValue < b.currentAccountValue ? 1 : -1)),
        };

        response.status(200).json(payload);
    } catch (error) {
        next(error);
    }
});

api.post(
    '/v1/set-active',
    async (request: Request<SetActiveAccountRequestParams>, response: Response, next: NextFunction) => {
        try {
            const username = getUsernameFromToken(request.cookies.token);
            const parsedRequest = setActiveAccountRequestParamSchema.parse(request.body);

            await setActiveAccount(username, parsedRequest.accountId, parsedRequest.isActive);
            response.status(200).send();
        } catch (error) {
            next(error);
        }
    },
);

api.post('/v1/delete', async (request: Request<DeleteAccountRequestParams>, response: Response, next: NextFunction) => {
    try {
        const username = getUsernameFromToken(request.cookies.token);
        const parsedRequest = deleteAccountRequestParamSchema.parse(request.body);
        await permanentlyDeleteAccount(username, parsedRequest.accountId);
        response.status(200).send();
    } catch (error) {
        next(error);
    }
});

api.get(
    '/v1/history',
    async (
        request: Request<unknown, unknown, unknown, AccountHistoryV1Response>,
        response: Response,
        next: NextFunction,
    ) => {
        try {
            const parsedRequest = accountsHistoryRequestParamSchema.parse(request.query);
            const dbRows = await getAccountUpdates(parsedRequest.accountId);

            const formattedAccountHistory: AccountHistoryV1Response = {
                accountId: dbRows[0].account_id,
                updateHistory: dbRows.map((row) => ({
                    date: format(new Date(row.date), 'yyyy-MM') as MonthYearDbDate,
                    amount: row.amount,
                    updateId: row.update_id,
                })),
            };

            response.status(200).json(formattedAccountHistory);
        } catch (error) {
            next(error);
        }
    },
);

api.post(
    '/v1/update/add',
    async (request: Request<AddAccountUpdateV1RequestParams>, response: Response, next: NextFunction) => {
        try {
            const parsedRequest = addAccountUpdateRequestParamSchema.parse(request.body);

            await addAccountUpdate(parsedRequest);
            response.status(200).send();
        } catch (error) {
            next(error);
        }
    },
);

api.post(
    '/v1/update/edit',
    async (request: Request<EditAccountUpdateV1RequestParams>, response: Response, next: NextFunction) => {
        try {
            const parsedRequest = editAccountUpdateRequestParamSchema.parse(request.body);

            await editAccountUpdate(parsedRequest);
            response.status(200).send();
        } catch (error) {
            next(error);
        }
    },
);

// For d3 charts, account totals per date as a data point over time
api.get(
    '/v1/growth-over-time',
    async (
        request: Request<unknown, unknown, unknown, AccountGrowthOverTimeV1Response>,
        response: Response,
        next: NextFunction,
    ) => {
        try {
            const username = getUsernameFromToken(request.cookies.token);

            const sqlRows = await fetchAccountGrowthOverTimeData(username);
            const formattedData = sqlRows.map((dataPoint) => ({
                ...dataPoint,
                date: format(new Date(dataPoint.date), 'yyyy-MM-dd'),
            }));

            response.status(200).json(formattedData);
        } catch (error) {
            next(error);
        }
    },
);

export default api;
