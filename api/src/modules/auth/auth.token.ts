import { env } from '@lib/env';
import jwt, { Algorithm, Secret, SignOptions } from 'jsonwebtoken';

// Signs the month-long JWT whose `sub` is the username. The auth middleware (`orpc/base.ts`) verifies
// it and reads the subject back out. Ported from the legacy `auth.utils`.
export function generateAuthTokenByUsername(username: string): string {
  const options: SignOptions = {
    algorithm: env.JWT_ALGORITHM as Algorithm,
    // The package's types are overly strict here; `expiresIn` accepts the string form (e.g. '30d').
    expiresIn: env.JWT_EXPIRY as unknown as number,
    issuer: env.JWT_ISSUER,
    subject: username,
  };

  return jwt.sign({ persistent: true }, env.SECRET_KEY as Secret, options);
}
