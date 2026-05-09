import db from '@lib/db';
import { DbDate } from '@type/dateTypes';
import { queryTransaction } from '@utils/QueryUtils/query';
import {
    Account,
    AccountGrowthOverTimeV1Response,
    AddAccountUpdateV1RequestParams,
    DbMoneyAccountSchema,
    DbMoneyAccountUpdatesSchema,
    EditAccountDetailsRequestParams,
    EditAccountUpdateV1RequestParams,
} from './accounts.model';

export async function addAccount(username: string, newAccount: Account, startingBalance: number) {
    try {
        await db.beginTransaction();
        await db.query(
            'INSERT INTO user_information.money_accounts (account_id, username, account_name, is_fixed, type, growth_rate, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [
                newAccount.id,
                username,
                newAccount.name,
                newAccount.isFixedRate,
                newAccount.category,
                newAccount.annualPercentageRate,
            ],
        );

        await db.query(
            'INSERT INTO user_information.money_account_updates (account_id, date, amount) VALUES (?, DATE_SUB(CURRENT_DATE(), INTERVAL DAYOFMONTH(NOW())-1 DAY), ?)',
            [newAccount.id, startingBalance],
        );

        await db.commit();
    } catch (error) {
        await db.rollback();
        throw error;
    }
}

// Edits account details like account name, if it's fixed growth rate, or its category
export async function editAccount(
    username: string,
    { accountId, accountName, accountCategory, annualPercentageRate, isFixedRate }: EditAccountDetailsRequestParams,
) {
    const statement = `
        UPDATE money_accounts 
        SET type = ?, is_fixed = ?, account_name = ?, growth_rate = ? 
        WHERE username = ? AND account_id = ?
    `;

    return queryTransaction([
        async () =>
            db.query(statement, [
                accountCategory,
                isFixedRate,
                accountName,
                annualPercentageRate || 0,
                username,
                accountId,
            ]),
    ]);
}

export async function fetchAccounts(username: string): Promise<(DbMoneyAccountSchema & DbMoneyAccountUpdatesSchema)[]> {
    const QUERY = `SELECT a.account_id, a.username, a.account_name, a.is_fixed, a.type, a.growth_rate, u.date, u.amount
                    FROM user_information.money_accounts a
                    JOIN (
                        SELECT u1.*
                        FROM user_information.money_account_updates u1
                        JOIN (
                            SELECT account_id, MAX(update_id) AS max_update_id
                            FROM user_information.money_account_updates
                            GROUP BY account_id
                        ) u2
                        ON u1.account_id = u2.account_id
                        AND u1.update_id = u2.max_update_id
                    ) u
                    ON a.account_id = u.account_id
                    WHERE a.username = ?;`;
    return new Promise((resolve, reject) => {
        db.query(QUERY, [username], (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

export function setActiveAccount(username: string, accountId: string, isActive: boolean) {
    return db.query('UPDATE user_information.money_accounts SET is_active = ? WHERE username = ? AND account_id = ?', [
        isActive,
        username,
        accountId,
    ]);
}

export function permanentlyDeleteAccount(username: string, accountId: string) {
    return db.query('DELETE FROM user_information.money_accounts WHERE username = ? AND account_id = ?', [
        username,
        accountId,
    ]);
}

export type AccountUpdatesSQLRow = {
    account_id: string; //uuid string
    date: DbDate;
    amount: number;
    update_id: number;
};

// Provides all monthly updates for a given account ID
export function getAccountUpdates(accountId: string): Promise<AccountUpdatesSQLRow[]> {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM user_information.money_account_updates WHERE account_id = ? ORDER BY date DESC',
            [accountId],
            (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            },
        );
    });
}

export function addAccountUpdate(requestParams: AddAccountUpdateV1RequestParams) {
    const formattedDate = `${requestParams.date}-01`;
    return db.query('INSERT INTO user_information.money_account_updates (account_id, date, amount) VALUES (?, ?, ?)', [
        requestParams.accountId,
        formattedDate,
        requestParams.amount,
    ]);
}

export function editAccountUpdate(requestParams: EditAccountUpdateV1RequestParams) {
    return db.query(
        'UPDATE user_information.money_account_updates SET amount = ? WHERE account_id = ? AND update_id = ?',
        [requestParams.amount, requestParams.accountId, requestParams.updateId],
    );
}

export function fetchAccountGrowthOverTimeData(username: string): Promise<AccountGrowthOverTimeV1Response> {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT 
                update_data.date,
                update_data.account_id AS accountId,
                account.account_name AS accountName,
                update_data.amount
            FROM money_account_updates AS update_data
            JOIN money_accounts AS account 
                ON update_data.account_id = account.account_id
            WHERE account.username = ?
            ORDER BY update_data.date ASC, update_data.account_id ASC;`,
            [username],
            (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            },
        );
    });
}
