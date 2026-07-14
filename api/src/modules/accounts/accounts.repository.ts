import { queryAsync, queryTransactionAsync } from '@lib/queryAsync';
import { AccountCategory, AppInputs } from '@spend-watcher/contract';
import { v4 as uuid4 } from 'uuid';
import { AccountUpdate, AccountValueDataPoint, AccountWithLatestUpdate } from './accounts.types';

type AccountAddInput = AppInputs['accounts']['add'];
type AccountEditInput = AppInputs['accounts']['edit'];
type AccountUpdateAddInput = AppInputs['accounts']['updateAdd'];
type AccountUpdateEditInput = AppInputs['accounts']['updateEdit'];

type AccountWithLatestUpdateRow = {
  account_id: string;
  username: string;
  account_name: string;
  is_fixed: 1 | 0;
  type: AccountCategory;
  growth_rate: number;
  // The mysql driver maps DATE columns to Date objects.
  date: Date;
  amount: number;
};

type AccountUpdateRow = {
  account_id: string;
  date: Date;
  amount: number;
  update_id: number;
};

type AccountGrowthRow = {
  account_id: string;
  account_name: string;
  date: Date;
  amount: number;
};

function toAccountWithLatestUpdate(row: AccountWithLatestUpdateRow): AccountWithLatestUpdate {
  return {
    accountId: row.account_id,
    accountName: row.account_name,
    username: row.username,
    category: row.type,
    isFixedRate: Boolean(row.is_fixed),
    annualPercentageRate: row.growth_rate,
    date: row.date,
    amount: row.amount,
  };
}

function toAccountValueDataPoint(row: AccountGrowthRow): AccountValueDataPoint {
  return {
    accountId: row.account_id,
    accountName: row.account_name,
    date: row.date,
    amount: row.amount,
  };
}

function toAccountUpdate(row: AccountUpdateRow): AccountUpdate {
  return {
    accountId: row.account_id,
    date: row.date,
    amount: row.amount,
    updateId: row.update_id,
  };
}

// Each account joined to its single most-recent update. Backs GET /summary.
export async function findAccountsWithLatestUpdate(username: string): Promise<AccountWithLatestUpdate[]> {
  const rows = await queryAsync<AccountWithLatestUpdateRow[]>(
    `SELECT a.account_id, a.username, a.account_name, a.is_fixed, a.type, a.growth_rate, u.date, u.amount
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
       WHERE a.username = ?;`,
    [username],
  );

  return rows.map(toAccountWithLatestUpdate);
}

// Every account update for the user, ordered for charting. Backs GET /growth-over-time.
export async function findAccountGrowthOverTime(username: string): Promise<AccountValueDataPoint[]> {
  const rows = await queryAsync<AccountGrowthRow[]>(
    `SELECT update_data.account_id, account.account_name, update_data.date, update_data.amount
       FROM money_account_updates AS update_data
       JOIN money_accounts AS account
         ON update_data.account_id = account.account_id
       WHERE account.username = ?
       ORDER BY update_data.date ASC, update_data.account_id ASC;`,
    [username],
  );

  return rows.map(toAccountValueDataPoint);
}

// Full update history for a single account, newest first. Backs GET /history. `money_account_updates`
// has no username column, so ownership is enforced by joining to the parent `money_accounts` — without
// it a caller could read another user's balance history by supplying their account id.
export async function findAccountUpdates(username: string, accountId: string): Promise<AccountUpdate[]> {
  const rows = await queryAsync<AccountUpdateRow[]>(
    `SELECT u.account_id, u.date, u.amount, u.update_id
       FROM user_information.money_account_updates AS u
       JOIN user_information.money_accounts AS a ON u.account_id = a.account_id
       WHERE u.account_id = ? AND a.username = ?
       ORDER BY u.date DESC`,
    [accountId, username],
  );

  return rows.map(toAccountUpdate);
}

// Creates the account plus its starting-balance update for the current month, in one transaction
// so a failed second insert can't leave an account with no updates.
export async function insertAccount(username: string, input: AccountAddInput): Promise<void> {
  const accountId = uuid4();
  await queryTransactionAsync([
    {
      sql: 'INSERT INTO user_information.money_accounts (account_id, username, account_name, is_fixed, type, growth_rate, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      params: [
        accountId,
        username,
        input.accountName,
        input.isFixedRate,
        input.accountCategory,
        input.annualPercentageRate ?? 0,
      ],
    },
    {
      sql: 'INSERT INTO user_information.money_account_updates (account_id, date, amount) VALUES (?, DATE_SUB(CURRENT_DATE(), INTERVAL DAYOFMONTH(NOW())-1 DAY), ?)',
      params: [accountId, input.startingAccountValue],
    },
  ]);
}

export async function updateAccount(username: string, input: AccountEditInput): Promise<void> {
  await queryAsync(
    'UPDATE money_accounts SET type = ?, is_fixed = ?, account_name = ?, growth_rate = ? WHERE username = ? AND account_id = ?',
    [
      input.accountCategory,
      input.isFixedRate,
      input.accountName,
      input.annualPercentageRate ?? 0,
      username,
      input.accountId,
    ],
  );
}

export async function updateAccountActiveStatus(username: string, accountId: string, isActive: boolean): Promise<void> {
  await queryAsync('UPDATE user_information.money_accounts SET is_active = ? WHERE username = ? AND account_id = ?', [
    isActive,
    username,
    accountId,
  ]);
}

export async function deleteAccount(username: string, accountId: string): Promise<void> {
  await queryAsync('DELETE FROM user_information.money_accounts WHERE username = ? AND account_id = ?', [
    username,
    accountId,
  ]);
}

// `input.date` is a `yyyy-MM` string; the DB stores the first of the month. The INSERT..SELECT only
// produces a row when the target account belongs to `username`, so a caller can't graft a balance
// update onto another user's account.
export async function insertAccountUpdate(username: string, input: AccountUpdateAddInput): Promise<void> {
  await queryAsync(
    `INSERT INTO user_information.money_account_updates (account_id, date, amount)
       SELECT ?, ?, ? FROM user_information.money_accounts WHERE account_id = ? AND username = ?`,
    [input.accountId, `${input.date}-01`, input.amount, input.accountId, username],
  );
}

// Scoped through the parent `money_accounts` so a caller can only edit updates on accounts they own —
// `update_id` is a guessable auto-increment int, so filtering on it alone would let anyone rewrite
// another user's balance history.
export async function updateAccountUpdate(username: string, input: AccountUpdateEditInput): Promise<void> {
  await queryAsync(
    `UPDATE user_information.money_account_updates AS u
       JOIN user_information.money_accounts AS a ON u.account_id = a.account_id
       SET u.amount = ?
       WHERE u.account_id = ? AND u.update_id = ? AND a.username = ?`,
    [input.amount, input.accountId, input.updateId, username],
  );
}
