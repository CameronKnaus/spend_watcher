import { env } from '@lib/env';
import { ensureRecurringTransactionsBackfilled } from '@modules/spending/recurring.service';
import { CookieOptions } from 'express';
import { authed, pub } from '../../orpc/base';
import { authenticate, register as registerAccount } from './auth.service';

const isDevMode = env.ENVIRONMENT === 'DEV';
const MONTH_IN_MS = 2_592_000_000;

const cookieOptions: CookieOptions = {
  sameSite: isDevMode ? 'lax' : 'none',
  httpOnly: true,
  maxAge: MONTH_IN_MS,
  secure: !isDevMode,
};

// POST /api/auth/login — verify credentials, attach the token cookie. Built from `pub` (no auth
// middleware) since you can't already be authenticated when logging in. The Express response is
// supplied on the oRPC context (see `index.ts`) so the handler can set the cookie.
export const login = pub.auth.login.handler(async ({ input, context }) => {
  const token = await authenticate(input);
  context.response.cookie('token', token, cookieOptions);

  return { message: 'Login successful' };
});

// POST /api/auth/register — create the account, attach the token cookie. Also public.
export const register = pub.auth.register.handler(async ({ input, context }) => {
  const token = await registerAccount(input);
  context.response.cookie('token', token, cookieOptions);

  return { message: 'Registration successful' };
});

// GET /api/auth/verify — built from `authed`, so reaching the handler means the token cookie passed
// verification. Replaces the legacy `verifyAuthToken`-guarded endpoint.
export const verify = authed.auth.verify.handler(async ({ context }) => {
  await ensureRecurringTransactionsBackfilled(context.username);

  return {
    authenticated: true,
    message: 'Token is valid',
  };
});
