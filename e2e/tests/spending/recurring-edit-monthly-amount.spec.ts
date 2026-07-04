// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts
//
// Consolidated monthly-transaction journey. The seed's fixed 'Internet' spend is auto-backfilled
// for the current month at creation, so the month ALWAYS starts logged at $60 — no add-vs-edit
// branching needed (the old log-monthly-default/custom and sidebar-totals specs all hedged with
// conditionals around this). One deterministic edit exercises the UPDATE path and asserts every
// surface that must recalculate: the history row, the card, the sidebar actual total, and the
// dashboard Recurring total tile.

import { test, expect } from '../../src/fixtures';
import { format } from 'date-fns';

test.describe('Recurring Spending — Monthly Transaction', () => {
  test("Edit the current month's logged amount and see every total recalculate", async ({ page }) => {
    const currentMonth = format(new Date(), 'LLLL');

    // 1. The sidebar reflects the seeded state: expected $60, actual $60 (auto-backfilled).
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    await expect(page.getByText('Estimated monthly total')).toBeVisible();
    await expect(page.getByText(`${currentMonth} actual total`)).toBeVisible();
    await expect(page.getByText('-$60.00').first()).toBeVisible();

    // 2. Open the Internet card. The month is already logged, so the panel opens to the base view
    //    (an update-required auto-open here would mean the backfill regressed).
    await page.getByText('Internet').click();
    await expect(page.getByText('What would you like to do?')).toBeVisible();
    await page.getByRole('button', { name: 'History' }).click();

    // 3. The current-month row holds the backfilled $60.
    await expect(page.locator('input[name="amountSpent"]')).toHaveValue('$60.00');

    // 4. Change it to 75 and confirm. Unlike the other money fields, this input mounts already
    // populated, and react-number-format repositions the caret asynchronously after focus — on a
    // slow first run that can undo fill()'s select-all and splice instead of replace ("75" + "60"
    // -> $7,560.00). Retry the fill until the formatted value confirms the replace took.
    await expect(async () => {
      await page.locator('input[name="amountSpent"]').fill('75');
      await expect(page.locator('input[name="amountSpent"]')).toHaveValue('$75.00', { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Confirm change' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm change' }).click();
    await expect(page.locator('input[name="amountSpent"]')).toHaveValue('$75.00');

    // 5. Close the panel: card and sidebar re-render from the API.
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('-$75.00').first()).toBeVisible();
    await expect(page.getByText('Update required')).not.toBeVisible();

    // 6. The dashboard Recurring total tile shows the recalculated amount.
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Recurring total', { exact: true })).toBeVisible();
    await expect(page.getByText('-$75.00').first()).toBeVisible();
  });
});
