import { NextFunction, Request, Response } from 'express';
import HttpException from './HttpException';

const isDevMode = process.env.ENVIRONMENT === 'DEV';

// Express treats a middleware with FOUR arguments as an error handler. `_next`
// is unused but must stay in the signature to keep that arity (the leading
// underscore tells TypeScript the unused param is intentional). Keep this
// registered last, after all routes, in index.ts.
export default function HttpErrorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  // A known, intentional error (validation, auth, etc.) carries its own status.
  if (error instanceof HttpException) {
    response.status(error.errorCode).json({
      reason: isDevMode ? error.message : 'An error occurred',
    });
    return;
  }

  // Anything else is unexpected: log it server-side for debugging, but never
  // leak internal error details to the client in production.
  console.error('Unhandled error:', error);
  response.status(500).json({
    reason: isDevMode && error instanceof Error ? error.message : 'An unexpected error occurred',
  });
}
