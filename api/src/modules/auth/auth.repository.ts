import { queryAsync } from '@lib/queryAsync';
import { AccountRow } from './auth.types';

// Looks up the account matching either the username or email column (login accepts either identifier).
export async function findAccountByIdentifier(identifier: string): Promise<AccountRow | undefined> {
  const rows = await queryAsync<AccountRow[]>(
    'SELECT username, user_email, password FROM user_information.account_info WHERE user_email = ? OR username = ?',
    [identifier, identifier],
  );

  return rows[0];
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const rows = await queryAsync<Pick<AccountRow, 'username'>[]>(
    'SELECT username FROM user_information.account_info WHERE user_email = ?',
    [email],
  );

  return rows.length > 0;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const rows = await queryAsync<Pick<AccountRow, 'username'>[]>(
    'SELECT username FROM user_information.account_info WHERE username = ?',
    [username],
  );

  return rows.length > 0;
}

export async function insertAccount(email: string, username: string, hashedPassword: string): Promise<void> {
  await queryAsync('INSERT INTO user_information.account_info (user_email, username, password) VALUES (?, ?, ?)', [
    email,
    username,
    hashedPassword,
  ]);
}
