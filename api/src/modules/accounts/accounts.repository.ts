import { queryAsync } from '@lib/queryAsync';
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
  date: string;
  amount: number;
};

type AccountUpdateRow = {
  account_id: string;
  date: string;
  amount: number;
  update_id: number;
};

type AccountGrowthRow = {
  account_id: string;
  account_name: string;
  date: string;
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

// Full update history for a single account, newest first. Backs GET /history.
export async function findAccountUpdates(accountId: string): Promise<AccountUpdate[]> {
  const rows = await queryAsync<AccountUpdateRow[]>(
    'SELECT * FROM user_information.money_account_updates WHERE account_id = ? ORDER BY date DESC',
    [accountId],
  );

  return rows.map(toAccountUpdate);
}

// Creates the account plus its starting-balance update for the current month. Two statements run as
// one multi-statement query (the connection enables `multipleStatements`), mirroring legacy `addAccount`.
export async function insertAccount(username: string, input: AccountAddInput): Promise<void> {
  const accountId = uuid4();
  await queryAsync(
    `INSERT INTO user_information.money_accounts (account_id, username, account_name, is_fixed, type, growth_rate, is_active) VALUES (?, ?, ?, ?, ?, ?, 1);
     INSERT INTO user_information.money_account_updates (account_id, date, amount) VALUES (?, DATE_SUB(CURRENT_DATE(), INTERVAL DAYOFMONTH(NOW())-1 DAY), ?);`,
    [
      accountId,
      username,
      input.accountName,
      input.isFixedRate,
      input.accountCategory,
      input.annualPercentageRate ?? 0,
      accountId,
      input.startingAccountValue,
    ],
  );
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

// `input.date` is a `yyyy-MM` string; the DB stores the first of the month.
export async function insertAccountUpdate(input: AccountUpdateAddInput): Promise<void> {
  await queryAsync('INSERT INTO user_information.money_account_updates (account_id, date, amount) VALUES (?, ?, ?)', [
    input.accountId,
    `${input.date}-01`,
    input.amount,
  ]);
}

export async function updateAccountUpdate(input: AccountUpdateEditInput): Promise<void> {
  await queryAsync(
    'UPDATE user_information.money_account_updates SET amount = ? WHERE account_id = ? AND update_id = ?',
    [input.amount, input.accountId, input.updateId],
  );
}
