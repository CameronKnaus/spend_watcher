// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Linking an Expense to a Trip', () => {
  test('Multiple linked expenses sum correctly across Airfare, Lodging and Discretionary tiles', async ({ page }) => {
    // 1. Navigate to /dashboard.
    await page.goto('/dashboard');

    // 2. Log first expense: Airfare $100 linked to Test Trip.
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('100');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$100.00');

    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Airfare');
    await page.locator('div').filter({ hasText: /^Airfare$/ }).nth(3).click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Airfare');

    await page.getByRole('textbox', { name: '--' }).click();
    await page.getByText('Test Trip').click();
    await expect(page.getByRole('textbox', { name: '--' })).toHaveValue('Test Trip');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 3. Log second expense: Lodging $75 linked to Test Trip.
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('75');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$75.00');

    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Lodging');
    await page.locator('div').filter({ hasText: /^Lodging$/ }).nth(3).click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Lodging');

    await page.getByRole('textbox', { name: '--' }).click();
    await page.getByText('Test Trip').click();
    await expect(page.getByRole('textbox', { name: '--' })).toHaveValue('Test Trip');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 4. Log third expense: Other $25 linked to Test Trip.
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('25');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$25.00');
    // Category remains 'Other' (default)

    await page.getByRole('textbox', { name: '--' }).click();
    await page.getByText('Test Trip').click();
    await expect(page.getByRole('textbox', { name: '--' })).toHaveValue('Test Trip');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 5. Navigate to /trips.
    await page.goto('/trips');

    // 6. Verify the Test Trip card cost tiles sum correctly.
    // Airfare: -$100.00
    const airfareTile = page.locator('text=Airfare').locator('..').locator('..');
    await expect(airfareTile).toContainText('-$100.00');

    // Lodging: -$75.00
    const lodgingTile = page.locator('text=Lodging').locator('..').locator('..');
    await expect(lodgingTile).toContainText('-$75.00');

    // Discretionary: -$25.00 (Other category)
    const discretionaryTile = page.locator('text=Discretionary').locator('..').locator('..');
    await expect(discretionaryTile).toContainText('-$25.00');

    // Total: -$200.00 ($100 + $75 + $25)
    const totalTile = page.locator('text=Total').locator('..').locator('..');
    await expect(totalTile).toContainText('-$200.00');
  });
});
