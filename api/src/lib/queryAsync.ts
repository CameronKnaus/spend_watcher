import db from '@lib/db';
import { MysqlError, PoolConnection } from 'mysql';

// Light wrapper to provide type checking for sql queries, but needs future improvement from a library so it's not manual.
export function queryAsync<T>(sql: string, params: unknown[] = []): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    db.query(sql, params, (error, rows) => (error ? reject(error) : resolve(rows as T)));
  });
}

type BoundStatement = { sql: string; params: unknown[] };

function queryOnConnection(connection: PoolConnection, statement: BoundStatement): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.query(statement.sql, statement.params, (error) => (error ? reject(error) : resolve()));
  });
}

// Runs the statements on a single connection inside a transaction, so a mid-sequence failure
// rolls back the earlier writes instead of leaving orphan rows.
export function queryTransactionAsync(statements: BoundStatement[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.getConnection((connectionError, connection) => {
      if (connectionError) {
        return reject(connectionError);
      }

      // Roll back before releasing so the pooled connection isn't reused with an open transaction.
      const failAndRollback = (error: MysqlError) =>
        connection.rollback(() => {
          connection.release();
          reject(error);
        });

      connection.beginTransaction(async (transactionError) => {
        if (transactionError) {
          connection.release();
          return reject(transactionError);
        }

        try {
          for (const statement of statements) {
            await queryOnConnection(connection, statement);
          }
        } catch (queryError) {
          return failAndRollback(queryError as MysqlError);
        }

        connection.commit((commitError) => {
          if (commitError) {
            return failAndRollback(commitError);
          }

          connection.release();
          resolve();
        });
      });
    });
  });
}
