import db from '@lib/db';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import HttpException from './HttpException';
const isDevMode = process.env.ENVIRONMENT === 'DEV';

export default function HttpErrorHandler(
  error: ErrorRequestHandler,
  // @ts-expect-error - No need to be used
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (error instanceof HttpException) {
    response.status(error.errorCode).json({
      reason: isDevMode ? error.message : 'An error occurred',
    });
  } else {
    if (!isDevMode) {
      response.status(500).json({
        reason: 'An error occurred',
      });
    }

    console.log('Error:', JSON.stringify(error, null, 2));
    response.status(500).json({
      reason: (error as unknown as Error).message ?? 'An unexpected error was encountered',
    });
  }

  db.end();
  next();
}
