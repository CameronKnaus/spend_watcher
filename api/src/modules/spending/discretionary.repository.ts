import { queryAsync } from '@lib/queryAsync';
import { SpendingCategory } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';

// The writable columns of a discretionary `spend_transactions` row. Internal to this repository.
export type DiscretionaryWrite = {
  category: SpendingCategory;
  amountSpent: number;
  spentDate: DbDate;
  note: string;
  linkedTripId?: string;
};

export async function insertDiscretionary(username: string, details: DiscretionaryWrite): Promise<void> {
  await queryAsync(
    'INSERT INTO spend_transactions (username, category, amount, date, note, linked_trip_id) VALUES (?, ?, ?, ?, ?, ?)',
    [username, details.category, details.amountSpent, details.spentDate, details.note, details.linkedTripId ?? null],
  );
}

export async function updateDiscretionary(
  username: string,
  transactionId: number,
  details: DiscretionaryWrite,
): Promise<void> {
  await queryAsync(
    'UPDATE spend_transactions SET category=?, amount=?, date=?, note=?, linked_trip_id=? WHERE username=? AND transaction_id=?',
    [
      details.category,
      details.amountSpent,
      details.spentDate,
      details.note,
      details.linkedTripId ?? null,
      username,
      transactionId,
    ],
  );
}

export async function deleteDiscretionary(username: string, transactionId: number): Promise<void> {
  await queryAsync('DELETE FROM spend_transactions WHERE username=? AND transaction_id=?', [username, transactionId]);
}
