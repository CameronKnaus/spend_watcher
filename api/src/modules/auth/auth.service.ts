import { ORPCError } from '@orpc/server';
import { AppInputs } from '@spend-watcher/contract';
import bcrypt from 'bcryptjs';
import { findAccountByIdentifier, insertAccount, isEmailTaken, isUsernameTaken } from './auth.repository';
import { generateAuthTokenByUsername } from './auth.token';

type LoginInput = AppInputs['auth']['login'];
type RegisterInput = AppInputs['auth']['register'];

// Verifies the supplied credentials and, on success, returns a freshly-signed JWT for the account.
// Failures throw UNAUTHORIZED with a deliberately vague message so we don't leak which half was wrong.
export async function authenticate(input: LoginInput): Promise<string> {
  // The form sends a single identifier (the legacy handler matched it against both columns).
  const identifier = input.username || input.email || '';
  const account = await findAccountByIdentifier(identifier);

  if (!account) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Username or password was incorrect' });
  }

  const passwordMatches = await bcrypt.compare(input.password, account.password);
  if (!passwordMatches) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Username or password was incorrect' });
  }

  return generateAuthTokenByUsername(account.username);
}

// Creates a new account after confirming the email + username are free, then returns a signed JWT.
export async function register(input: RegisterInput): Promise<string> {
  const [emailTaken, usernameTaken] = await Promise.all([isEmailTaken(input.email), isUsernameTaken(input.username)]);

  if (emailTaken) {
    throw new ORPCError('CONFLICT', { message: 'Email already taken' });
  }

  if (usernameTaken) {
    throw new ORPCError('CONFLICT', { message: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  await insertAccount(input.email, input.username, hashedPassword);

  return generateAuthTokenByUsername(input.username);
}
