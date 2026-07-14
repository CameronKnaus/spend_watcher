import type { APIRequestContext } from '@playwright/test';
import { endOfMonth, format, startOfMonth } from 'date-fns';

// GETs through the real api and throws with the server's body on any non-2xx, so a spec reading
// state it just wrote fails loudly at the read instead of on a confusing downstream assertion.
// The type parameter is trusted, not validated — pass the contract-derived response type.
export async function getJson<T>(api: APIRequestContext, path: string, params?: Record<string, string>): Promise<T> {
  const response = await api.get(path, { params });
  if (!response.ok()) {
    throw new Error(`GET ${path} failed (${response.status()}): ${await response.text()}`);
  }
  return (await response.json()) as T;
}

// The `yyyy-MM-dd` start/end bracketing the current month, for the date-range read endpoints
// (`/spending/details`). Derived from "now" so seeded current-month data always falls inside it.
export function currentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}
