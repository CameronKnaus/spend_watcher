import { queryAsync, queryTransactionAsync } from '@lib/queryAsync';
import { AppInputs, SpendingCategory } from '@spend-watcher/contract';
import { dbDateFormat } from '@type/dateTypes';
import { formatDiscretionaryTransactionId } from '@utils/transactionId';
import { format } from 'date-fns';
import { v4 as uuid4 } from 'uuid';

type TripAddInput = AppInputs['trips']['add'];
type TripEditInput = AppInputs['trips']['edit'];

type TripRow = {
  trip_id: string; // uuid
  trip_name: string;
  // 'YYYY-MM-DD' format
  start_date: string; // already 'yyyy-MM-dd' from the SQL DATE_FORMAT below
  // 'YYYY-MM-DD' format
  end_date: string;
};

type TripCostTotalsRow = {
  linked_trip_id: string; // uuid
  total: number;
  airfare_total: number;
  lodging_total: number;
  discretionary_total: number;
};

type TripLinkedExpenseRow = {
  transaction_id: number;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO, e.g. '2023-12-27T05:00:00.000Z'
  username: string;
  uncommon: number; // 1 | 0
  linked_trip_id: string; // uuid
};

type Trip = {
  tripId: string; // uuid
  tripName: string;
  // YYYY-MM-DD
  startDate: string;
  // YYYY-MM-DD
  endDate: string;
};

export async function findTrips(username: string): Promise<Trip[]> {
  const rows = await queryAsync<TripRow[]>(
    'SELECT trip_id, trip_name, DATE_FORMAT(start_date, "%Y-%m-%d") AS start_date, DATE_FORMAT(end_date, "%Y-%m-%d") AS end_date FROM trips WHERE username = ? ORDER BY start_date DESC;',
    [username],
  );

  return rows.map((row) => ({
    tripId: row.trip_id,
    tripName: row.trip_name,
    startDate: row.start_date,
    endDate: row.end_date,
  }));
}

type TripCostTotals = {
  // The trip these totals belong to. Used by the service to join totals onto the trip list.
  linkedTripId: string; // uuid
  totalSpent: number;
  totalDiscretionarySpent: number;
  totalAirfareSpent: number;
  totalLodgingSpent: number;
};

export async function findTripCostTotals(username: string): Promise<TripCostTotals[]> {
  const rows = await queryAsync<TripCostTotalsRow[]>(
    `
      SELECT
          linked_trip_id,
          SUM(amount) AS total,
          SUM(CASE WHEN category = 'AIRFARE' THEN amount ELSE 0 END) AS airfare_total,
          SUM(CASE WHEN category = 'LODGING' THEN amount ELSE 0 END) AS lodging_total,
          SUM(amount) - SUM(CASE WHEN category = 'AIRFARE' THEN amount ELSE 0 END) -
                      SUM(CASE WHEN category = 'LODGING' THEN amount ELSE 0 END) AS discretionary_total
      FROM spend_transactions
      WHERE username = ? AND linked_trip_id IS NOT NULL
      GROUP BY linked_trip_id;
    `,
    [username],
  );

  return rows.map((row) => ({
    linkedTripId: row.linked_trip_id,
    totalSpent: row.total,
    totalAirfareSpent: row.airfare_total,
    totalLodgingSpent: row.lodging_total,
    totalDiscretionarySpent: row.discretionary_total,
  }));
}

type TripLinkedExpense = {
  transactionId: `Discretionary-${number}`;
  amountSpent: number;
  category: SpendingCategory;
  note: string;
  // YYYY-MM-DD
  spentDate: string;
  isRecurring: false;
  linkedTripId: string; // uuid
};

export async function findTripLinkedExpenses(username: string, tripId: string): Promise<TripLinkedExpense[]> {
  const rows = await queryAsync<TripLinkedExpenseRow[]>(
    'SELECT * FROM spend_transactions WHERE username = ? AND linked_trip_id = ? ORDER BY date DESC;',
    [username, tripId],
  );

  return rows.map((row) => ({
    transactionId: formatDiscretionaryTransactionId(row.transaction_id),
    amountSpent: row.amount,
    category: row.category as SpendingCategory,
    note: row.note,
    spentDate: format(row.date, dbDateFormat),
    isRecurring: false,
    linkedTripId: row.linked_trip_id,
  }));
}

export async function insertTrip(username: string, input: TripAddInput): Promise<void> {
  await queryAsync('INSERT INTO trips (trip_id, username, trip_name, start_date, end_date) VALUES (?, ?, ?, ?, ?);', [
    uuid4(),
    username,
    input.tripName,
    input.startDate,
    input.endDate,
  ]);
}

export async function updateTrip(username: string, input: TripEditInput): Promise<void> {
  await queryAsync('UPDATE trips SET trip_name=?, start_date=?, end_date=? WHERE username=? AND trip_id=?;', [
    input.tripName,
    input.startDate,
    input.endDate,
    username,
    input.tripId,
  ]);
}

// Deletes the trip and unlinks it from any spend transactions, in one transaction so a failed
// unlink can't leave transactions pointing at a deleted trip.
export async function deleteTrip(username: string, tripId: string): Promise<void> {
  await queryTransactionAsync([
    { sql: 'DELETE FROM trips WHERE username=? AND trip_id=?', params: [username, tripId] },
    { sql: 'UPDATE spend_transactions SET linked_trip_id=NULL WHERE linked_trip_id=?', params: [tripId] },
  ]);
}
