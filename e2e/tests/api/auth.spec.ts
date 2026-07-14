// Exercises: contract/src/auth.contract.ts (POST /auth/register, /auth/login, GET /auth/verify)
//
// These are the legacy auth endpoints. Uses raw request contexts (not the apiFixtures `api`, which
// auto-registers) so each test controls its own signed-in/out state.

import { test, expect, type APIRequestContext, type PlaywrightWorkerArgs } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { API_URL } from '../../src/config';

function credentials() {
  const id = randomUUID().slice(0, 8);
  return { email: `auth_${id}@example.com`, username: `authuser_${id}`, password: `authPass_${id}` };
}

// A signed-out request context: its own cookie jar, no token. Callers dispose it.
function freshContext(playwright: PlaywrightWorkerArgs['playwright']): Promise<APIRequestContext> {
  return playwright.request.newContext({ baseURL: API_URL });
}

test.describe('Auth — register', () => {
  test('registers a new account and sets an auth cookie that /verify accepts', async ({ playwright }) => {
    const api = await freshContext(playwright);
    const user = credentials();

    const register = await api.post('/api/auth/register', { data: user });
    expect(register.status()).toBe(200);
    expect(await register.json()).toEqual({ message: 'Registration successful' });

    // The register response set the `token` cookie on this context's jar, so /verify is authorized
    // with no further work — this is exactly how the app keeps you signed in after signup.
    const verify = await api.get('/api/auth/verify');
    expect(verify.status()).toBe(200);
    expect(await verify.json()).toEqual({ authenticated: true, message: 'Token is valid' });

    await api.dispose();
  });

  test('rejects a duplicate username with 409', async ({ playwright }) => {
    const api = await freshContext(playwright);
    const user = credentials();
    expect((await api.post('/api/auth/register', { data: user })).status()).toBe(200);

    const dup = await api.post('/api/auth/register', {
      data: { ...user, email: `other_${randomUUID().slice(0, 8)}@example.com` },
    });
    expect(dup.status()).toBe(409);
    expect(await dup.json()).toMatchObject({ code: 'CONFLICT', message: 'Username already taken' });

    await api.dispose();
  });

  test('rejects a duplicate email with 409', async ({ playwright }) => {
    const api = await freshContext(playwright);
    const user = credentials();
    expect((await api.post('/api/auth/register', { data: user })).status()).toBe(200);

    const dup = await api.post('/api/auth/register', {
      data: { ...user, username: `authuser_${randomUUID().slice(0, 8)}` },
    });
    expect(dup.status()).toBe(409);
    expect(await dup.json()).toMatchObject({ code: 'CONFLICT', message: 'Email already taken' });

    await api.dispose();
  });

  test('rejects a too-short username with a 400 validation error', async ({ playwright }) => {
    const api = await freshContext(playwright);

    const res = await api.post('/api/auth/register', {
      data: { ...credentials(), username: 'short' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.data.issues[0].path).toEqual(['username']);

    await api.dispose();
  });
});

test.describe('Auth — login', () => {
  test('logs in with a username and the correct password', async ({ playwright }) => {
    const registrar = await freshContext(playwright);
    const user = credentials();
    expect((await registrar.post('/api/auth/register', { data: user })).status()).toBe(200);
    await registrar.dispose();

    // A separate, cookie-less context proves login itself (not a leftover register cookie) authorizes.
    const api = await freshContext(playwright);
    const login = await api.post('/api/auth/login', {
      data: { username: user.username, password: user.password },
    });
    expect(login.status()).toBe(200);
    expect(await login.json()).toEqual({ message: 'Login successful' });
    expect((await api.get('/api/auth/verify')).status()).toBe(200);

    await api.dispose();
  });

  test('logs in with an email as the identifier', async ({ playwright }) => {
    const registrar = await freshContext(playwright);
    const user = credentials();
    expect((await registrar.post('/api/auth/register', { data: user })).status()).toBe(200);
    await registrar.dispose();

    const api = await freshContext(playwright);
    const login = await api.post('/api/auth/login', {
      data: { email: user.email, password: user.password },
    });
    expect(login.status()).toBe(200);

    await api.dispose();
  });

  test('rejects a wrong password with 401 and a vague message', async ({ playwright }) => {
    const api = await freshContext(playwright);
    const user = credentials();
    expect((await api.post('/api/auth/register', { data: user })).status()).toBe(200);

    const login = await api.post('/api/auth/login', {
      data: { username: user.username, password: 'wrongPassword1' },
    });
    expect(login.status()).toBe(401);
    // Deliberately doesn't say which half was wrong.
    expect(await login.json()).toMatchObject({ message: 'Username or password was incorrect' });

    await api.dispose();
  });

  test('rejects login with neither email nor username (400)', async ({ playwright }) => {
    const api = await freshContext(playwright);

    const login = await api.post('/api/auth/login', { data: { password: 'somePassword1' } });
    expect(login.status()).toBe(400);
    expect(await login.json()).toMatchObject({ code: 'BAD_REQUEST' });

    await api.dispose();
  });
});
