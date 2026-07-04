import { oc } from '@orpc/contract';
import { z } from 'zod';

const MIN_USERNAME_LENGTH = 8;
const MIN_PASSWORD_LENGTH = 8;

// Login accepts either an email or a username (plus a password). Ported from the legacy
// `loginRequestParamsSchema`; the refine enforces that at least one identifier is supplied.
export const loginInputSchema = z
  .object({
    email: z.email().or(z.literal('')).optional(),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
      .or(z.literal(''))
      .optional(),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  })
  .refine(({ email, username }) => Boolean(email || username), {
    message: 'Either email or username must be provided',
  });

// Registration requires all three fields. Ported from the legacy `registerRequestParamSchema`.
export const registerInputSchema = z.object({
  email: z.email(),
  username: z.string().min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

// POST /auth/login — verify credentials and attach the `token` cookie on success.
export const loginContract = oc
  .route({ method: 'POST', path: '/auth/login' })
  .input(loginInputSchema)
  .output(z.object({ message: z.string() }));

// POST /auth/register — create the account and attach the `token` cookie on success.
export const registerContract = oc
  .route({ method: 'POST', path: '/auth/register' })
  .input(registerInputSchema)
  .output(z.object({ message: z.string() }));

// GET /auth/verify — guarded by auth; reaching it confirms the caller's `token` cookie is valid.
export const verifyContract = oc
  .route({ method: 'GET', path: '/auth/verify' })
  .output(z.object({ authenticated: z.boolean(), message: z.string() }));

export const authContract = {
  login: loginContract,
  register: registerContract,
  verify: verifyContract,
};
