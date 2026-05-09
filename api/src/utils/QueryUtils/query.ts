import db from '@lib/db';
import HttpException from '@utils/ErrorHandling/HttpException';

type UnformattedQuery = string | string[];

function addMissingSemiColon(givenString: string) {
    if (givenString.charAt(givenString.length - 1) === ';') {
        return givenString;
    }

    return `${givenString};`;
}

// This allows passing query strings as an array of strings or just a string itself
function formatQueryString(givenQuery: UnformattedQuery): string {
    if (typeof givenQuery === 'string') {
        // Return given string as is, adding semi colon if missing
        return addMissingSemiColon(givenQuery);
    }

    // Add any missing semi-colons, combine to a string and return
    return givenQuery
        .map((query) => {
            return addMissingSemiColon(query);
        })
        .join(' ');
}

// TODO: Improve error handling
// Wrapper for db.query that handles errors
export function query<T>(givenQuery: UnformattedQuery): Promise<T> {
    const queryString = formatQueryString(givenQuery);

    return new Promise<T>((resolve) => {
        db.query(queryString, (error, results) => {
            if (error) {
                throw new HttpException(500, error.message);
            }

            return resolve(results);
        });
    });
}

// Wrapper around mysql connection.query that handles beginning, committing, and rolling back transactions
export async function queryTransaction(queryList: (() => Promise<unknown>)[]): Promise<void> {
    await db.beginTransaction();
    try {
        queryList.forEach(async (query) => await query());
        await db.commit();
        return;
    } catch (error) {
        await db.rollback();
        throw error;
    }
}
