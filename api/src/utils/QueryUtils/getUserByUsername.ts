import db from '@lib/db';
import HttpException from '@utils/ErrorHandling/HttpException';

// Helper for querying the database and getting user profile information
export default function getUserByUsername(username: string) {
  return new Promise((resolve) => {
    db.query(`SELECT * FROM user_information.account_info WHERE username="${username}";`, (error, result) => {
      if (error || !result.length) {
        throw new HttpException(401, 'User not found');
      }

      resolve(result[0]);
    });
  });
}
