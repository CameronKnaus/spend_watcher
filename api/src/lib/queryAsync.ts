import db from '@lib/db';

// Light wrapper to provide type checking for sql queries, but needs future improvement from a library so it's not manual.
export function queryAsync<T>(sql: string, params: unknown[] = []): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    db.query(sql, params, (error, rows) => (error ? reject(error) : resolve(rows as T)));
  });
}
