export const API_PORT = 4001;
export const UI_PORT = 3001;
export const API_URL = `http://localhost:${API_PORT}`;
export const UI_URL = `http://localhost:${UI_PORT}`;

// Port for e2e test DB
export const DB_HOST_PORT = 3307;

// Everything the api needs at boot. `dotenv` does not override variables already present in the
// environment, so these win over api/.env — the test api therefore talks to the Docker DB on 3307
// and signs JWTs with its own throwaway secret, with no reliance on a local .env (so CI works too).
export const API_TEST_ENV: Record<string, string> = {
  PORT: String(API_PORT),
  DOMAIN: UI_URL,
  ENVIRONMENT: 'DEV',
  dbHost: '127.0.0.1',
  dbPort: String(DB_HOST_PORT),
  dbUser: 'root',
  dbPass: 'password1',
  dbName: 'user_information',
  SECRET_KEY: 'e2e-test-secret-key-not-for-production',
  JWT_ALGORITHM: 'HS256',
  JWT_EXPIRY: '30d',
  JWT_ISSUER: 'spendwatcher-e2e',
};
