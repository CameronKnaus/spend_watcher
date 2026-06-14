import { z } from 'zod';

/**
 * Validates `process.env` once, at boot, and crashes the process immediately if
 * anything required is missing or malformed.
 */
const envSchema = z.object({
  // 'DEV' turns on verbose logging + the route-list printout.
  ENVIRONMENT: z.string().optional(),

  // Frontend origin allowed through CORS, e.g. https://app.example.com
  DOMAIN: z.string().min(1, 'is required (the allowed CORS origin)'),

  // Port the HTTP server listens on. Env values are strings, so coerce to a
  // number; fall back to 4000 when unset.
  PORT: z.coerce.number().int().positive().default(4000),

  // JWT signing + verification config (see middleware/verifyAuthToken.ts).
  SECRET_KEY: z.string().min(1),
  JWT_ALGORITHM: z.string().min(1),
  JWT_EXPIRY: z.string().min(1),
  JWT_ISSUER: z.string().min(1),

  // MySQL connection (see lib/db.ts). Password is optional because some local
  // setups run without one.
  dbHost: z.string().min(1),
  dbUser: z.string().min(1),
  dbName: z.string().min(1),
  dbPass: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.') || '(root)'} ${issue.message}`)
    .join('\n');
  console.error(`\x1b[31m✖ Invalid environment configuration:\x1b[0m\n${details}`);
  process.exit(1);
}

export const env = parsed.data;
