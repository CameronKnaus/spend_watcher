import { env } from '@lib/env';
import { implement, ORPCError } from '@orpc/server';
import { appContract } from '@spend-watcher/contract';
import { Response } from 'express';
import jwt, { Algorithm, JwtPayload, Secret } from 'jsonwebtoken';

export type ORPCContext = {
  cookies: Record<string, string | undefined>;
  response: Response;
};

export const pub = implement(appContract).$context<ORPCContext>();

/** Use for routes that require authentication.  Auth backed middleware. */
export const authed = pub.use(({ context, next }) => {
  const token = context.cookies?.token;

  if (!token) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Not authorized to access this endpoint' });
  }

  let payload: JwtPayload | string;
  try {
    payload = jwt.verify(token, env.SECRET_KEY as Secret, { algorithms: [env.JWT_ALGORITHM as Algorithm] });
  } catch {
    throw new ORPCError('UNAUTHORIZED', { message: 'Please login again' });
  }

  const username = typeof payload === 'string' ? undefined : payload.sub;
  if (!username) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Please login again' });
  }

  return next({ context: { username } });
});
