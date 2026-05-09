import db from '@lib/db';
import HttpException from '@utils/ErrorHandling/HttpException';
import { CookieOptions } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const isDevMode = process.env.ENVIRONMENT === 'DEV';
const monthInMilliseconds = 2592000000;
export const cookieOptions: CookieOptions = {
    sameSite: isDevMode ? 'lax' : 'none',
    httpOnly: true,
    maxAge: monthInMilliseconds,
    secure: !isDevMode,
};

export function generateAuthTokenByUsername(username: string): string {
    // JWT Token options
    const options = {
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_EXPIRY,
        issuer: process.env.JWT_ISSUER,
        subject: username,
    };

    return jwt.sign(
        {
            persistent: true,
        },
        process.env.SECRET_KEY as Secret,
        options as SignOptions,
    );
}

// Resolves if the given email is not already in use, throws an error otherwise
export function isEmailAvailable(email: string) {
    return new Promise<void>((resolve) => {
        db.query(
            `SELECT * FROM user_information.account_info WHERE user_email=${db.escape(email)};`,
            (error, result) => {
                if (error) {
                    throw new HttpException(500, 'Error occurred while querying user by email');
                }

                if (result.length) {
                    throw new HttpException(403, 'Email already taken');
                }

                // Email not taken
                resolve();
            },
        );
    });
}

// Resolves if the given username is not already in use, throws an error otherwise
export function isUsernameAvailable(username: string) {
    return new Promise<void>((resolve) => {
        db.query(
            `SELECT * FROM user_information.account_info WHERE username=${db.escape(username)};`,
            (error, result) => {
                if (error) {
                    throw new HttpException(500, 'Error occurred while querying user by username');
                }

                if (result.length) {
                    throw new HttpException(403, 'Username already taken');
                }

                // Username not taken
                resolve();
            },
        );
    });
}
