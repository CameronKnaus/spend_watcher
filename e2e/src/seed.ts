import type { APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

export type TestUser = {
  username: string;
  email: string;
  password: string;
};

// --- date helpers (kept dependency-free; the contract wants `yyyy-MM-dd`) ----------------------

function ymd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAgo(amount: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - amount);
  return date;
}

// POSTs through the real api and throws with the server's body on any non-2xx, so a broken fixture
// fails loudly instead of silently leaving a page empty.
async function post(api: APIRequestContext, path: string, data: unknown): Promise<void> {
  const response = await api.post(path, { data });
  if (!response.ok()) {
    throw new Error(`POST ${path} failed (${response.status()}): ${await response.text()}`);
  }
}

// Registers a brand-new, unique account. Each call returns a different user, which is how tests stay
// isolated: every test gets its own tenant, and the api scopes all reads/writes to the logged-in
// username. /auth/register also sets the `token` cookie on this `api` context's cookie jar.
export async function registerUser(api: APIRequestContext): Promise<TestUser> {
  const id = randomUUID().slice(0, 8);
  const user: TestUser = {
    username: `e2euser_${id}`, // >= 8 chars, per the contract
    email: `e2e_${id}@example.com`,
    password: `e2ePass_${id}`, // >= 8 chars
  };

  await post(api, '/api/auth/register', user);
  return user;
}

// Creates a small, representative slice of data through the real endpoints so each page has something
// to render. Intentionally only uses endpoints that don't need a server-generated id handed back.
export async function seedBaselineData(api: APIRequestContext): Promise<void> {
  await post(api, '/api/accounts/add', {
    accountName: 'Test Checking',
    startingAccountValue: 5000,
    accountCategory: 'CHECKING',
    isFixedRate: true,
    annualPercentageRate: 0,
  });

  // Amounts are whole numbers on purpose: the contract types discretionary `amountSpent` (and
  // recurring `expectedMonthlyAmount`) as a safe integer, so a float like 24.5 fails validation.
  const discretionary = [
    { category: 'RESTAURANTS', amountSpent: 25, spentDate: ymd(daysAgo(0)), note: 'Lunch' },
    { category: 'GROCERIES', amountSpent: 86, spentDate: ymd(daysAgo(3)), note: 'Weekly groceries' },
    { category: 'ENTERTAINMENT', amountSpent: 15, spentDate: ymd(daysAgo(6)), note: 'Streaming' },
  ];
  for (const transaction of discretionary) {
    await post(api, '/api/spending/discretionary/add', transaction);
  }

  await post(api, '/api/spending/recurring/add', {
    category: 'UTILITIES',
    recurringSpendName: 'Internet',
    expectedMonthlyAmount: 60,
    isVariableRecurring: false,
  });

  await post(api, '/api/trips/add', {
    tripName: 'Test Trip',
    startDate: ymd(daysAgo(14)),
    endDate: ymd(daysAgo(10)),
  });
}
