// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Log Discretionary Spend — DB Boundaries', () => {
  test('A note of exactly 60 characters persists end-to-end', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('10');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$10.00');

    const maxLengthNote = 'N'.repeat(60);
    await page.getByRole('textbox', { name: 'About your expense' }).fill(maxLengthNote);

    // Category defaults to Other; date defaults to today.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // The row's accessible name includes the note text served back by the API (CSS may truncate
    // the render, but the DOM text is the full stored value).
    await expect(page.getByRole('button', { name: new RegExp(`Other.*-\\$10\\.00.*${maxLengthNote}`) })).toBeVisible();
  });
});
