# Trends E2E Test Plan

## Application Overview

The Trends page (/trends) in SpendWatcher is a personal spending analytics view. It composes several sub-modules: three summary-total tiles (Total spent, Discretionary total, Recurring total); a D3 bar-chart module that plots per-category spending totals for the selected time frame; a multi-column TotalsTable where every spending category appears as a clickable row showing combined, discretionary, and recurring sub-totals with percentage columns; a Top Discretionary Categories widget with a proportional colour bar and category labels; a flat Discretionary Transactions list grouped by date; and a bottom-of-page AlertMessage warning that recurring transactions are not yet shown on this page (WIP notice). A sticky navigation bar at the bottom of the page contains a time-frame navigation control (back/forward arrows flanking the current month or year label) and a toggle button that switches the view between Monthly and Yearly modes. Monthly view is the default; switching to Yearly changes the displayed period label, arrow navigation steps by year, and refreshes every data-bearing module for the new date range. Clicking a category row in the TotalsTable, or clicking a category chip in the Top Discretionary Categories widget, slides up a CategoryTransactionListPanel that lists that category's individual transactions and offers a Close button to dismiss it. The seeded state used by every test in this plan provides exactly three discretionary transactions this month (Restaurants $25, Groceries $86, Entertainment $15) and one recurring expense (Internet $60 — UTILITIES). Because the seed data is all in the current month, prior-month and prior-year periods are effectively empty.

## Test Scenarios

### 1. Page load and layout

**Seed:** `tests/seed.spec.ts`

#### 1.1. Trends page renders its title and navigation

**File:** `tests/trends/page-load.spec.ts`

**Steps:**
  1. Navigate to /trends
    - expect: The URL is /trends
    - expect: An h1 heading with the text 'Trends' is visible
    - expect: The main site navigation is visible
  2. Inspect the sticky bottom navigation bar on the Trends page
    - expect: A back-arrow button (left chevron) is present in the navigation bar
    - expect: A forward-arrow button (right chevron) is present in the navigation bar
    - expect: A current-period label is visible between the arrows showing the current month name and year (e.g. 'June' and '2026')
    - expect: A toggle button labelled 'Yearly' is visible (indicating the current mode is Monthly and clicking it switches to Yearly)

#### 1.2. Summary total tiles are visible with seeded amounts

**File:** `tests/trends/summary-totals.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for data to load (skeleton loaders disappear)
    - expect: A tile labelled 'Total spent' is visible
    - expect: A tile labelled 'Discretionary total' is visible
    - expect: A tile labelled 'Recurring total' is visible
  2. Read the displayed currency value in the 'Discretionary total' tile
    - expect: The discretionary total displays -$126 (the sum of Restaurants $25 + Groceries $86 + Entertainment $15)
  3. Read the displayed currency value in the 'Total spent' tile
    - expect: The total spent value is visible and negative (red), reflecting at least the $126 in discretionary spend for the current month

#### 1.3. WIP alert notice is present on the page

**File:** `tests/trends/wip-notice.spec.ts`

**Steps:**
  1. Navigate to /trends and scroll to the bottom of the page
    - expect: An alert message with the title 'Recurring transactions are not shown on this page yet.' is visible
    - expect: The alert message body contains 'This page is a work in progress.  Recurring transactions will be represented here soon.'

#### 1.4. Bar chart module renders with category bars for current month

**File:** `tests/trends/bar-chart.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the bar chart module to finish loading
    - expect: A module containing the heading 'Bar chart' is visible
    - expect: An SVG element is rendered inside the bar chart module
    - expect: Three bar groups are present in the SVG — one each for RESTAURANTS, GROCERIES, and ENTERTAINMENT (identifiable as g#bar-RESTAURANTS, g#bar-GROCERIES, g#bar-ENTERTAINMENT)

### 2. Time frame toggle — Monthly vs Yearly

**Seed:** `tests/seed.spec.ts`

#### 2.1. Default view is Monthly mode showing the current month

**File:** `tests/trends/timeframe-default-monthly.spec.ts`

**Steps:**
  1. Navigate to /trends
    - expect: The toggle button in the bottom nav bar is labelled 'Yearly' (meaning the current active mode is Monthly)
    - expect: The period label between the arrows shows the current month name (e.g. 'June') and the current year (e.g. '2026')

#### 2.2. Switching to Yearly mode updates the period label and toggle button

**File:** `tests/trends/timeframe-switch-to-yearly.spec.ts`

**Steps:**
  1. Navigate to /trends
    - expect: The toggle button reads 'Yearly'
  2. Click the 'Yearly' toggle button
    - expect: The toggle button label changes to 'Monthly' (indicating the current mode is now Yearly)
    - expect: The period label between the arrows shows only the current year (e.g. '2026') without a month name
    - expect: The summary total tiles remain visible and reload for the yearly date range

#### 2.3. Switching back to Monthly mode from Yearly restores the current month

**File:** `tests/trends/timeframe-switch-back-to-monthly.spec.ts`

**Steps:**
  1. Navigate to /trends and click the 'Yearly' toggle button to switch to Yearly mode
    - expect: The toggle button now reads 'Monthly'
  2. Click the 'Monthly' toggle button
    - expect: The toggle button label changes back to 'Yearly'
    - expect: The period label between the arrows shows the current month name and year again
    - expect: The summary total tiles reload and display the current-month discretionary total of -$126

### 3. Time frame navigation — period stepping

**Seed:** `tests/seed.spec.ts`

#### 3.1. Forward arrow is disabled on the current month in Monthly mode

**File:** `tests/trends/navigation-forward-disabled.spec.ts`

**Steps:**
  1. Navigate to /trends (Monthly mode, current month is the default)
    - expect: The forward-arrow button has the disabled appearance (receives the disabled CSS class)
  2. Click the forward-arrow button
    - expect: The period label does not change — it still shows the current month and year

#### 3.2. Back arrow navigates to the previous month and shows empty data

**File:** `tests/trends/navigation-back-one-month.spec.ts`

**Steps:**
  1. Navigate to /trends (Monthly mode)
    - expect: The period label shows the current month and year (e.g. 'June 2026')
  2. Click the back-arrow button once
    - expect: The period label changes to the previous month and the same year (e.g. 'May 2026')
    - expect: The forward-arrow button is now enabled (no longer has the disabled CSS class)
    - expect: The discretionary total tile displays $0 or --  because there are no transactions in the prior month

#### 3.3. Forward arrow re-navigates to the current month after going back

**File:** `tests/trends/navigation-forward-after-back.spec.ts`

**Steps:**
  1. Navigate to /trends, then click the back-arrow button once to go to the previous month
    - expect: The period label shows the previous month
  2. Click the forward-arrow button
    - expect: The period label returns to the current month and year
    - expect: The forward-arrow button becomes disabled again
    - expect: The discretionary total tile shows -$126 again

#### 3.4. Back arrow is disabled once the earliest transaction month is reached

**File:** `tests/trends/navigation-back-disabled-at-earliest.spec.ts`

**Steps:**
  1. Navigate to /trends (Monthly mode)
    - expect: The back-arrow button is enabled
  2. Click the back-arrow button repeatedly until the displayed month matches the earliest seeded transaction date (the current month, since all seed data is in the current month)
    - expect: After navigating back to the month of the earliest transaction, the back-arrow button receives the disabled appearance and no further back-navigation is possible

#### 3.5. Yearly mode: forward arrow is disabled on the current year

**File:** `tests/trends/navigation-yearly-forward-disabled.spec.ts`

**Steps:**
  1. Navigate to /trends and click 'Yearly' to switch to Yearly mode
    - expect: The period label shows the current year (e.g. '2026')
  2. Verify the state of the forward-arrow button
    - expect: The forward-arrow button has the disabled appearance because the current year is already the most recent period
  3. Click the forward-arrow button
    - expect: The period label does not change — it still shows the current year

#### 3.6. Yearly mode: back arrow navigates to the previous year and shows empty data

**File:** `tests/trends/navigation-yearly-back-one-year.spec.ts`

**Steps:**
  1. Navigate to /trends and click 'Yearly' to switch to Yearly mode
    - expect: The period label shows the current year (e.g. '2026')
  2. Click the back-arrow button once
    - expect: The period label changes to the previous year (e.g. '2025')
    - expect: The forward-arrow button is now enabled
    - expect: The discretionary total tile displays $0 or -- because no transactions exist in the prior year

### 4. Totals table

**Seed:** `tests/seed.spec.ts`

#### 4.1. Totals table renders column headers and one row per seeded category

**File:** `tests/trends/totals-table-headers.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the data to load
    - expect: A table is visible containing the header 'Category'
    - expect: The header 'Total spent' is present
    - expect: The header 'Transaction count' is present
    - expect: The header 'Percentage of total' is present
    - expect: The header 'Percentage of transactions' is present
    - expect: The header 'Discretionary total' is present
    - expect: The header 'Discretionary transaction count' is present
    - expect: The header 'Discretionary % of total' is present
    - expect: The header 'Discretionary % of transactions' is present
    - expect: The header 'Recurring total' is present
    - expect: The header 'Recurring transaction count' is present
    - expect: The header 'Recurring % of total' is present
    - expect: The header 'Recurring % of transactions' is present
  2. Count the data rows (tbody tr) in the table
    - expect: Exactly three category rows are shown: one for Restaurants, one for Groceries, and one for Entertainment (the three discretionary categories in the seed data)

#### 4.2. Totals table rows display correct amounts for seeded transactions

**File:** `tests/trends/totals-table-amounts.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the totals table to load
  2. Locate the 'Groceries' row in the table (should be first since it has the highest spend of $86)
    - expect: The 'Groceries' category row shows a total spent value of -$86
    - expect: The transaction count column shows 1
    - expect: The discretionary total column shows -$86
    - expect: The discretionary transaction count column shows 1
  3. Locate the 'Restaurants' row in the table
    - expect: The 'Restaurants' row shows a total spent value of -$25
    - expect: The transaction count column shows 1
    - expect: The discretionary total column shows -$25
  4. Locate the 'Entertainment' row in the table
    - expect: The 'Entertainment' row shows a total spent value of -$15
    - expect: The transaction count column shows 1
    - expect: The discretionary total column shows -$15
  5. Inspect the table footer (tfoot) row labelled 'Total'
    - expect: The total amount is -$126 (sum of 25 + 86 + 15)
    - expect: The total transaction count is 3
    - expect: The discretionary total is -$126
    - expect: The discretionary transaction count is 3

#### 4.3. Totals table shows empty state when navigated to a prior empty month

**File:** `tests/trends/totals-table-empty-month.spec.ts`

**Steps:**
  1. Navigate to /trends and click the back-arrow button to go to the previous month
    - expect: The period label changes to the previous month
  2. Inspect the totals table
    - expect: No category data rows appear in the table body (there are no transactions in the prior month)
    - expect: The table footer 'Total' row shows $0 or is empty for all amount columns

#### 4.4. Totals table updates when switching from Monthly to Yearly mode

**File:** `tests/trends/totals-table-yearly.spec.ts`

**Steps:**
  1. Navigate to /trends (Monthly mode, current month)
    - expect: Three category rows are visible in the table for the current month
  2. Click the 'Yearly' toggle button to switch to Yearly mode
    - expect: The table still shows three category rows (the seed data all falls within the current year)
    - expect: The per-category amounts remain the same since the yearly range encompasses the current month
    - expect: The total footer row still shows -$126 and 3 transactions for the full year

### 5. Category transaction list panel

**Seed:** `tests/seed.spec.ts`

#### 5.1. Clicking a category in the totals table opens the transaction list panel

**File:** `tests/trends/category-panel-open-from-table.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the totals table to load
  2. Click the 'Groceries' category button in the totals table
    - expect: A slide-up panel dialog appears with role='dialog'
    - expect: The panel title reads 'Groceries' (or the display label for GROCERIES)
    - expect: The panel is fully visible on screen
  3. Inspect the contents of the open panel
    - expect: One transaction row is listed for 'Groceries' showing the amount -$86
    - expect: The note 'Weekly groceries' is visible on the transaction row
    - expect: A 'Close' button is present at the bottom of the panel

#### 5.2. Closing the category panel via the Close button dismisses it

**File:** `tests/trends/category-panel-close.spec.ts`

**Steps:**
  1. Navigate to /trends, wait for the table to load, and click the 'Groceries' category button
    - expect: The transaction list panel is visible
  2. Click the 'Close' button inside the panel
    - expect: The slide-up panel is dismissed and is no longer visible
    - expect: The totals table is again accessible in the background

#### 5.3. Closing the category panel by clicking the backdrop dismisses it

**File:** `tests/trends/category-panel-close-backdrop.spec.ts`

**Steps:**
  1. Navigate to /trends, wait for the table to load, and click the 'Restaurants' category button
    - expect: The transaction list panel is visible with the title matching the Restaurants display label
  2. Click the semi-transparent backdrop overlay outside the panel
    - expect: The panel closes and is no longer visible

#### 5.4. Category panel shows correct transaction for Restaurants

**File:** `tests/trends/category-panel-restaurants.spec.ts`

**Steps:**
  1. Navigate to /trends, wait for the table to load, and click the 'Restaurants' category button
    - expect: The slide-up panel opens with the Restaurants label as its title
  2. Inspect the transaction listed in the panel
    - expect: One transaction row is visible showing the amount -$25
    - expect: The note 'Lunch' is displayed on the row
    - expect: A date is shown on the row

#### 5.5. Category panel shows correct transaction for Entertainment

**File:** `tests/trends/category-panel-entertainment.spec.ts`

**Steps:**
  1. Navigate to /trends, wait for the table to load, and click the 'Entertainment' category button
    - expect: The slide-up panel opens with the Entertainment label as its title
  2. Inspect the transaction listed in the panel
    - expect: One transaction row is visible showing the amount -$15
    - expect: The note 'Streaming' is displayed on the row

#### 5.6. Category panel opened from the Top Discretionary Categories widget

**File:** `tests/trends/category-panel-from-top-categories.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the 'Top discretionary categories' section to load
    - expect: The 'Top discretionary categories' heading is visible
    - expect: Category chips or labels are visible for Groceries, Restaurants, and Entertainment
  2. Click the 'Groceries' category chip or label in the Top Discretionary Categories widget
    - expect: A slide-up panel dialog opens
    - expect: The panel title reflects the Groceries category
    - expect: One transaction row shows the amount -$86 with the note 'Weekly groceries'
  3. Click the 'Close' button inside the panel
    - expect: The panel closes

#### 5.7. Category panel is empty when the selected category has no transactions in the period

**File:** `tests/trends/category-panel-empty.spec.ts`

**Steps:**
  1. Navigate to /trends and click the back-arrow to navigate to the previous month (an empty period)
    - expect: The period label shows the previous month
    - expect: The totals table shows no category rows
  2. Verify that no category rows are clickable in the totals table (since the table body is empty)
    - expect: No category buttons exist in the table body to click
    - expect: No slide-up panel is visible

### 6. Top Discretionary Categories widget

**Seed:** `tests/seed.spec.ts`

#### 6.1. Top Discretionary Categories widget renders with seeded data

**File:** `tests/trends/top-categories-widget.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the 'Top discretionary categories' module to load
    - expect: A module with the heading 'Top discretionary categories' is visible
    - expect: A proportional colour bar is rendered inside the module
    - expect: Category labels are visible for at least Groceries (the highest-spend category at $86)
  2. Inspect which categories appear in the widget
    - expect: Groceries is listed (highest spend $86)
    - expect: Restaurants is listed ($25)
    - expect: Entertainment is listed ($15)
    - expect: Since there are exactly 3 categories (≤ 4), no 'Remaining total' row is shown
    - expect: A 'Combined total' label is visible because there are more than one category

#### 6.2. Top Discretionary Categories shows empty-state when navigated to an empty period

**File:** `tests/trends/top-categories-empty.spec.ts`

**Steps:**
  1. Navigate to /trends and click the back-arrow button to go to the previous month
    - expect: The period label changes to the previous month
  2. Inspect the 'Top discretionary categories' module
    - expect: The message 'You have no discretionary spending so far this month.' is displayed inside the module (or equivalent no-data text)
    - expect: No category colour bar segments are shown

### 7. Discretionary transactions list

**Seed:** `tests/seed.spec.ts`

#### 7.1. Transactions list shows three entries grouped by date for the current month

**File:** `tests/trends/transactions-list-current-month.spec.ts`

**Steps:**
  1. Navigate to /trends and wait for the 'Discretionary transactions' module to load
    - expect: A module with the heading 'Discretionary transactions' is visible
  2. Inspect the list of transactions
    - expect: Three transaction rows are displayed in total across one or more date groups
    - expect: A row for 'Lunch' is visible (Restaurants, $25)
    - expect: A row for 'Weekly groceries' is visible (Groceries, $86)
    - expect: A row for 'Streaming' is visible (Entertainment, $15)
    - expect: Each date group header shows the date in 'MMM do' format (e.g. 'Jun 20th') and the day's total spend

#### 7.2. Transactions list is empty when navigated to a prior month with no data

**File:** `tests/trends/transactions-list-empty-month.spec.ts`

**Steps:**
  1. Navigate to /trends and click the back-arrow to go to the previous month
    - expect: The period label changes to the previous month
  2. Inspect the 'Discretionary transactions' module
    - expect: No transaction rows or date group headers are displayed inside the module (the list is empty)
