// Exercises: contract/src/trips.contract.ts
// (POST /trips/{add,edit,delete}; GET /trips/list, /trips/expenses).

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post, ymd } from '../../src/seed';
import { currentMonthRange, getJson } from '../../src/apiHelpers';
import { subDays } from 'date-fns';
import type { AppInputs, TripsListResponse, TripLinkedExpensesResponse } from '@spend-watcher/contract';

type TripAdd = AppInputs['trips']['add'];

// A past trip window (so it never registers as the "active" trip).
const tripDates = { startDate: ymd(subDays(new Date(), 14)), endDate: ymd(subDays(new Date(), 10)) };

function readList(api: Parameters<typeof getJson>[0]): Promise<TripsListResponse> {
  return getJson<TripsListResponse>(api, '/api/trips/list');
}

async function addAndFindId(api: Parameters<typeof getJson>[0], input: TripAdd): Promise<string> {
  await post(api, '/api/trips/add', input);
  const { tripsList } = await readList(api);
  const entry = tripsList.find((t) => t.trip.tripName === input.tripName);
  if (!entry) throw new Error(`trip '${input.tripName}' not found after add`);
  return entry.trip.tripId;
}

test.describe('Trips — CRUD round-trip', () => {
  test('add → list → edit → delete', async ({ api }) => {
    const tripId = await addAndFindId(api, { tripName: 'Test Trip', ...tripDates });

    let { tripsList } = await readList(api);
    expect(tripsList).toHaveLength(1);
    expect(tripsList[0].trip).toMatchObject({ tripName: 'Test Trip', ...tripDates });
    expect(tripsList[0].costTotals).toEqual({
      totalSpent: 0,
      totalDiscretionarySpent: 0,
      totalAirfareSpent: 0,
      totalLodgingSpent: 0,
    });

    await post(api, '/api/trips/edit', { tripId, tripName: 'Renamed Trip', ...tripDates });
    ({ tripsList } = await readList(api));
    expect(tripsList[0].trip.tripName).toBe('Renamed Trip');

    await post(api, '/api/trips/delete', { tripId });
    ({ tripsList } = await readList(api));
    expect(tripsList).toHaveLength(0);
  });

  test("a linked discretionary expense shows in the trip's expenses and cost totals", async ({ api }) => {
    const tripId = await addAndFindId(api, { tripName: 'Trip With Expense', ...tripDates });
    const { startDate } = currentMonthRange();

    await post(api, '/api/spending/discretionary/add', {
      category: 'RESTAURANTS',
      amountSpent: 40,
      spentDate: startDate,
      note: 'Trip dinner',
      linkedTripId: tripId,
    });

    const { expenseList } = await getJson<TripLinkedExpensesResponse>(api, '/api/trips/expenses', { tripId });
    expect(expenseList).toHaveLength(1);
    expect(expenseList[0]).toMatchObject({
      amountSpent: 40,
      category: 'RESTAURANTS',
      note: 'Trip dinner',
      linkedTripId: tripId,
    });

    const { tripsList } = await readList(api);
    expect(tripsList[0].costTotals.totalSpent).toBe(40);
    expect(tripsList[0].costTotals.totalDiscretionarySpent).toBe(40);
  });
});

test.describe('Trips — input validation (400)', () => {
  const cases: { name: string; body: Record<string, unknown>; badPath: string }[] = [
    { name: 'blank name', body: { tripName: '', ...tripDates }, badPath: 'tripName' },
    // The DB column is varchar(30); contract + ui now agree on that bound.
    { name: 'name over 30 chars', body: { tripName: 'T'.repeat(31), ...tripDates }, badPath: 'tripName' },
    {
      name: 'malformed startDate',
      body: { tripName: 'Trip', startDate: '2026/06/20', endDate: tripDates.endDate },
      badPath: 'startDate',
    },
  ];

  for (const { name, body, badPath } of cases) {
    test(`rejects ${name}`, async ({ api }) => {
      const res = await api.post('/api/trips/add', { data: body });
      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.data.issues.some((i: { path: string[] }) => i.path.includes(badPath))).toBe(true);
    });
  }

  test('accepts a name of exactly 30 characters (the DB max)', async ({ api }) => {
    const res = await api.post('/api/trips/add', { data: { tripName: 'T'.repeat(30), ...tripDates } });
    expect(res.status()).toBe(200);
  });
});

test.describe('Trips — tenant isolation', () => {
  test("a user cannot edit or delete another user's trip", async ({ api, otherApi }) => {
    const tripId = await addAndFindId(api, { tripName: 'Test Trip', ...tripDates });

    await post(otherApi, '/api/trips/edit', { tripId, tripName: 'Hacked', ...tripDates });
    await post(otherApi, '/api/trips/delete', { tripId });

    const { tripsList } = await readList(api);
    expect(tripsList).toHaveLength(1);
    expect(tripsList[0].trip.tripName).toBe('Test Trip');
  });
});
