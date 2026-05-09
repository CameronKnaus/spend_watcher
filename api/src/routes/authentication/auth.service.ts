import db from '@lib/db';
import HttpException from '@utils/ErrorHandling/HttpException';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { cookieOptions, generateAuthTokenByUsername, isEmailAvailable, isUsernameAvailable } from './auth.utils';

// First checks if there is an account with the given username (or email).
// Then checks given plain-text password against password stored in db decrypted.
// If successful, it generates a token cookie and attaches it to the response.
// TODO: Implement email-only based login
export function handleLogin(username: string, password: string, response: Response) {
    return new Promise((resolve, reject) => {
        const name = db.escape(username);
        // There's risk an email or username might be the same between two users, I should make this better
        const QUERY = `SELECT * FROM user_information.account_info WHERE user_email=${name} OR username=${name};`;

        db.query(QUERY, (error, result) => {
            if (error || !result.length) {
                // No user was found or something was invalid
                return reject(new HttpException(401, 'Username or password was incorrect'));
            }

            // Note that result[0] holds all of the user data so for clarity convert
            const user = result[0];
            bcrypt.compare(
                password, // Decoded password
                user.password, // Stored hashed password
                (bErr, bResult) => {
                    if (bErr) {
                        return reject(new HttpException(500, 'Unexpected error occurred'));
                    }

                    if (!bResult) {
                        return reject(new HttpException(401, 'Username or password was incorrect'));
                    }

                    // Generate an auth token and attach to response as a cookie
                    response.cookie('token', generateAuthTokenByUsername(user.username), cookieOptions);
                    resolve(void 0);
                },
            );
        });
    });
}

export function handleRegistration(username: string, email: string, password: string, response: Response) {
    return new Promise((resolve, reject) => {
        Promise.all([isEmailAvailable(email), isUsernameAvailable(username)]).then(() => {
            // The username and email are both available so proceed with registration steps.
            // Hash given password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return reject(err);
                }

                // Create the query for inserting the new user
                const INSERTION_QUERY = `INSERT INTO user_information.account_info (user_email, username, password) VALUES (${db.escape(email)}, ${db.escape(username)}, "${hashedPassword}");`;

                db.query(INSERTION_QUERY, (error) => {
                    if (error) {
                        return reject(new HttpException(500, error.message));
                    }
                });

                // Generate an auth token and attach to response as a cookie
                response.cookie('token', generateAuthTokenByUsername(username), cookieOptions);

                resolve(void 0);
            });
        });
    });
}
