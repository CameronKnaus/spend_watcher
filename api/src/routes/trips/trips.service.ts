import db from '@lib/db';
import { DbDate } from '@type/dateTypes';
import { v4 as uuid4 } from 'uuid';
import { AddTripRequestParams, EditTripRequestParams } from './trips.model';

export type TripTableSQLRow = {
    trip_id: string; // uuid
    trip_name: string;
    start_date: DbDate;
    end_date: DbDate;
};

export function fetchTrips(username: string): Promise<TripTableSQLRow[]> {
    return new Promise((resolve, reject) => {
        const queryString =
            'SELECT trip_id, trip_name, DATE_FORMAT(start_date, "%Y-%m-%d") AS start_date, DATE_FORMAT(end_date, "%Y-%m-%d") AS end_date FROM trips WHERE username = ? ORDER BY start_date DESC;';
        db.query(queryString, [username], (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

export type TripCostTotalsSQLRow = {
    total: number;
    airfare_total: number;
    lodging_total: number;
    discretionary_total: number;
    linked_trip_id: string; // uuid
};

export function fetchTripCostTotals(username: string): Promise<TripCostTotalsSQLRow[]> {
    return new Promise((resolve, reject) => {
        const queryString = `
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
        `;
        db.query(queryString, [username], (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

export type TripLinkedExpensesSQLRow = {
    transaction_id: number;
    amount: number;
    category: string;
    note: string;
    date: string; // ex: 2023-12-27T05:00:00.000Z
    username: string;
    uncommon: number; // 1 | 0 (boolean)
    linked_trip_id: string; // uuid
};

export function fetchTripLinkedExpenses(username: string, tripId: string): Promise<TripLinkedExpensesSQLRow[]> {
    return new Promise((resolve, reject) => {
        const queryString =
            'SELECT * FROM spend_transactions WHERE username=? AND linked_trip_id=? ORDER BY date DESC;';
        db.query(queryString, [username, tripId], (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

export function addTrip(username: string, tripDetails: AddTripRequestParams): Promise<void> {
    return new Promise((resolve, reject) => {
        const uniqueId = uuid4();
        const queryString =
            'INSERT INTO trips (trip_id, username, trip_name, start_date, end_date) VALUES (?, ?, ?, ?, ?);';
        db.query(
            queryString,
            [uniqueId, username, tripDetails.tripName, tripDetails.startDate, tripDetails.endDate],
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            },
        );
    });
}

export function editTrip(username: string, tripDetails: EditTripRequestParams): Promise<void> {
    return new Promise((resolve, reject) => {
        const queryString = 'UPDATE trips SET trip_name=?, start_date=?, end_date=? WHERE username=? AND trip_id=?;';
        db.query(
            queryString,
            [tripDetails.tripName, tripDetails.startDate, tripDetails.endDate, username, tripDetails.tripId],
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            },
        );
    });
}

export async function deleteTrip(username: string, tripId: string): Promise<void> {
    await db.beginTransaction();
    try {
        const queryString = [
            'DELETE FROM trips WHERE username=? AND trip_id=?;',
            'UPDATE spend_transactions SET linked_trip_id=NULL WHERE linked_trip_id=?;',
        ].join('');
        await db.query(queryString, [username, tripId, tripId]);

        await db.commit();
    } catch (error) {
        await db.rollback();
        throw error;
    }
}
