import type { APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { format, startOfMonth, subDays } from 'date-fns';

export type TestUser = {
  username: string;
  email: string;
  password: string;
};

// --- date helpers -------------------------------------------------------------------------------

/** The contract wants `yyyy-MM-dd`. */
export function ymd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * `days` ago, but never earlier than the 1st of the current month.
 *
 * Specs assert against the CURRENT month view (dashboard "July overview", trends month totals), so
 * every seeded transaction must land inside it. A plain `daysAgo(6)` straddles the previous month
 * whenever a run happens on the 1st–6th — that exact bug broke 36 tests on 2026-07-01. Clamping
 * keeps the whole baseline in-month on every day of every month; early in a month several seeded
 * transactions simply share the 1st, which specs must tolerate (derive date expectations from
 * SEEDED_DISCRETIONARY rather than re-doing date math).
 */
export function daysAgoInCurrentMonth(days: number): Date {
  const candidate = subDays(new Date(), days);
  const monthStart = startOfMonth(new Date());
  return candidate < monthStart ? monthStart : candidate;
}

// --- baseline data ------------------------------------------------------------------------------

export type SeededDiscretionary = {
  category: string;
  /** How the category renders in the UI (differs from the enum for RESTAURANTS). */
  categoryLabel: string;
  amountSpent: number;
  spentDate: Date;
  note: string;
};

/**
 * The discretionary transactions `seedBaselineData` creates, exposed so specs can derive
 * expectations (dates, date-group headers, totals) from the same source instead of duplicating the
 * seed's date math. Recomputed per call because the dates depend on "now".
 *
 * Stable facts specs may hardcode: amounts 25 + 86 + 15 = $126 discretionary in the current month.
 */
export function seededDiscretionary(): SeededDiscretionary[] {
  return [
    {
      category: 'RESTAURANTS',
      categoryLabel: 'Dining out',
      amountSpent: 25,
      spentDate: daysAgoInCurrentMonth(0),
      note: 'Lunch',
    },
    {
      category: 'GROCERIES',
      categoryLabel: 'Groceries',
      amountSpent: 86,
      spentDate: daysAgoInCurrentMonth(3),
      note: 'Weekly groceries',
    },
    {
      category: 'ENTERTAINMENT',
      categoryLabel: 'Entertainment',
      amountSpent: 15,
      spentDate: daysAgoInCurrentMonth(6),
      note: 'Streaming',
    },
  ];
}

/**
 * Baseline amounts the seed guarantees for the current month. The recurring $60 relies on the api
 * auto-backfilling a fixed-rate recurring spend's current month at creation — several specs'
 * totals (e.g. -$186.00) are load-bearing on that behavior, so if the seed's recurring shape ever
 * changes, re-verify those.
 */
export const SEED_TOTALS = {
  discretionary: 126,
  recurring: 60,
  total: 186,
} as const;

export const SEEDED_ACCOUNT = {
  accountName: 'Test Checking',
  startingAccountValue: 5000,
  accountCategory: 'CHECKING',
} as const;

export const SEEDED_RECURRING = {
  recurringSpendName: 'Internet',
  expectedMonthlyAmount: 60,
  category: 'UTILITIES',
} as const;

export const SEEDED_TRIP = {
  tripName: 'Test Trip',
} as const;

// POSTs through the real api and throws with the server's body on any non-2xx, so a broken fixture
// fails loudly instead of silently leaving a page empty.
export async function post(api: APIRequestContext, path: string, data: unknown): Promise<void> {
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
    ...SEEDED_ACCOUNT,
    isFixedRate: true,
    annualPercentageRate: 0,
  });

  // Amounts are whole numbers on purpose: the contract types discretionary `amountSpent` (and
  // recurring `expectedMonthlyAmount`) as a safe integer, so a float like 24.5 fails validation.
  for (const transaction of seededDiscretionary()) {
    await post(api, '/api/spending/discretionary/add', {
      category: transaction.category,
      amountSpent: transaction.amountSpent,
      spentDate: ymd(transaction.spentDate),
      note: transaction.note,
    });
  }

  await post(api, '/api/spending/recurring/add', {
    ...SEEDED_RECURRING,
    isVariableRecurring: false,
  });

  await post(api, '/api/trips/add', {
    ...SEEDED_TRIP,
    startDate: ymd(subDays(new Date(), 14)),
    endDate: ymd(subDays(new Date(), 10)),
  });
}
