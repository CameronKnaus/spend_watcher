# Accounts E2E Test Plan

## Application Overview

SpendWatcher is a personal spending and savings tracker built as a React SPA backed by an oRPC API. The Accounts feature lets users add, edit, stop tracking, and delete financial accounts (Checking, Savings, Investing, Bonds). The primary surface is the Savings page (/savings), which contains a Net Worth tile (growth-over-time chart), a Totals by Account Type breakdown, and a "Your accounts" list. The same accounts list and an "Add account" button also appear on the Dashboard (/dashboard). Each account row is interactive: clicking it opens a slide-up "Manage" panel with four options — Edit account, History, Stop tracking this account, and Delete account. Account name validation requires a minimum of 3 characters. Monetary inputs use a formatted NumericInput (react-number-format) with a $ prefix, decimal scale of 2, and thousand separators; percentage inputs use the same component with a % suffix. The add-account form requires an account name, account type (filterable select defaulting to CHECKING), current/starting value (required), an optional annual growth rate percentage, and an optional "This growth rate is fixed" checkbox (defaults to checked). The edit-account form carries the same fields except the starting value (omitted — only updates via the history panel). Stop-tracking triggers a SpeedBump confirmation with a single warning and a "Stop tracking" proceed button. Delete triggers a SpeedBump with both a description and a bold "This action cannot be undone." final-warning line, causing the proceed button to render in the destructive (tertiary) variant. The Account Update History panel shows one editable row per month back to the account's oldest update; months without a saved update show an "Add for [Month Year]" button that expands to a MoneyInput; months with an existing update show the amount pre-populated and a "Confirm change" button appears only when the value has changed and is > 0. A banner on both the Dashboard and Savings pages reads "N account(s) require updates for this month" when any active account is missing the current month's update.

## Test Scenarios

### 1. Savings Page — Layout and Read-Only Display

**Seed:** `tests/seed.spec.ts`

#### 1.1. Savings page renders all three tiles for a seeded user

**File:** `tests/accounts/savings-page-layout.spec.ts`

**Steps:**
  1. Navigate to /savings.
    - expect: The page heading (h1) reads 'Savings'.
    - expect: A 'Net worth' module tile is visible.
    - expect: A 'Totals by account type' module tile is visible.
    - expect: A 'Your accounts' module tile is visible.
    - expect: An 'Add account' button is visible below the accounts list.
  2. Observe the 'Your accounts' module.
    - expect: One account row is present with the label 'Test Checking'.
    - expect: The row's secondary label reads 'Checking'.
    - expect: A currency amount is displayed for that account row.
  3. Observe the 'Totals by account type' module.
    - expect: A row for 'Checking' is visible with a non-zero currency total.

#### 1.2. Dashboard shows accounts list and Add account button

**File:** `tests/accounts/dashboard-accounts-widgets.spec.ts`

**Steps:**
  1. Navigate to /dashboard.
    - expect: The 'Your accounts' module is visible in the right-hand column.
    - expect: The 'Test Checking' account row is present.
    - expect: An 'Add account' button is visible below the accounts list.

#### 1.3. Accounts-need-update banner appears on Dashboard when an account lacks a current-month update

**File:** `tests/accounts/accounts-need-update-banner.spec.ts`

**Steps:**
  1. Navigate to /dashboard immediately after seed (the seeded 'Test Checking' account has no update for the current month).
    - expect: An alert banner reading '1 account(s) require updates for this month' is visible near the top of the page.
  2. Navigate to /savings.
    - expect: The same '1 account(s) require updates for this month' banner is NOT present on the Savings page (the banner component is only rendered on Dashboard).
    - expect: The 'Test Checking' row in the 'Your accounts' list shows a call-to-action text indicating the current month requires an update (text includes the current month name and 'requires an update').

### 2. Add Account — Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. Add a Checking account with all fields filled in

**File:** `tests/accounts/add-account-checking-full.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Add account' button.
    - expect: A slide-up panel opens with the title 'Add account'.
    - expect: Fields visible: 'Account name' text input, 'Account type' filterable select (default value shows 'Checking'), 'Current account value' money input, 'Annual growth rate' percentage input, 'This growth rate is fixed' checkbox (checked by default).
    - expect: The 'Submit' button is disabled because the form is not yet valid.
  2. Type 'My Checking' into the 'Account name' field.
    - expect: The text 'My Checking' is reflected in the input.
  3. Leave 'Account type' at its default of 'Checking'.
    - expect: The filterable select still shows 'Checking'.
  4. Click the 'Current account value' money input and type '2500'.
    - expect: The formatted value '$2,500.00' is displayed in the input.
  5. Click the 'Annual growth rate' percentage input and type '3.5'.
    - expect: The formatted value '3.50%' is displayed in the input.
  6. Verify the 'This growth rate is fixed' checkbox is checked, then click 'Submit'.
    - expect: The panel closes.
    - expect: The 'Your accounts' list now contains a row with the label 'My Checking'.
    - expect: The row shows the secondary label 'Checking' and a currency amount of '$2,500.00'.

#### 2.2. Add a Savings account with growth rate

**File:** `tests/accounts/add-account-savings.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
    - expect: The add-account panel opens.
  2. Type 'Emergency Fund' in the 'Account name' field.
  3. Click the 'Account type' filterable select to open the dropdown.
    - expect: A dropdown opens listing at minimum: 'Checking', 'Savings', 'Investment', 'Bonds'.
  4. Click 'Savings' in the dropdown.
    - expect: The select field now shows 'Savings'.
  5. Enter '10000' into the 'Current account value' field.
    - expect: The formatted value '$10,000.00' is shown.
  6. Leave the 'Annual growth rate' field blank (0.00%) and click 'Submit'.
    - expect: The panel closes.
    - expect: A new row 'Emergency Fund' with secondary label 'Savings' appears in the 'Your accounts' list.

#### 2.3. Add an Investing account

**File:** `tests/accounts/add-account-investing.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
  2. Type 'Brokerage' into the 'Account name' field.
  3. Open the 'Account type' dropdown and select 'Investment'.
    - expect: The select shows 'Investment'.
  4. Enter '50000' in the 'Current account value' field.
    - expect: The value shows '$50,000.00'.
  5. Enter '7' in the 'Annual growth rate' field and uncheck the 'This growth rate is fixed' checkbox.
    - expect: The checkbox is now unchecked.
    - expect: The 'Submit' button is enabled (name and value are valid).
  6. Click 'Submit'.
    - expect: The panel closes.
    - expect: 'Brokerage' row with secondary label 'Investment' appears in 'Your accounts'.

#### 2.4. Add a Bonds account

**File:** `tests/accounts/add-account-bonds.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
  2. Type 'US Savings Bonds' in the 'Account name' field.
  3. Open the 'Account type' dropdown and select 'Bonds'.
    - expect: The select shows 'Bonds'.
  4. Enter '5000' in the 'Current account value' field.
  5. Click 'Submit'.
    - expect: The panel closes and 'US Savings Bonds' appears in 'Your accounts' with secondary label 'Bonds'.

#### 2.5. Cancel the add-account form discards unsaved data

**File:** `tests/accounts/add-account-cancel.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
    - expect: The add-account panel opens.
  2. Type 'Temp Account' in the 'Account name' field and enter '999' in 'Current account value'.
  3. Click the 'Cancel' button.
    - expect: The panel closes.
    - expect: No new account named 'Temp Account' appears in the 'Your accounts' list (only 'Test Checking' is present).
  4. Click 'Add account' again to reopen the panel.
    - expect: The 'Account name' field is empty.
    - expect: The 'Current account value' field is empty.
    - expect: The 'Account type' defaults back to 'Checking'.
    - expect: The 'This growth rate is fixed' checkbox is checked.

### 3. Add Account — Validation and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 3.1. Account name shorter than 3 characters keeps Submit disabled

**File:** `tests/accounts/add-account-name-too-short.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
    - expect: The panel opens and the 'Submit' button is disabled.
  2. Type 'AB' (2 characters) into the 'Account name' field.
    - expect: The 'Submit' button remains disabled.
  3. Enter '1000' in the 'Current account value' field.
    - expect: The 'Submit' button is still disabled because the name is too short.
  4. Type one more character to make the name 'ABC' (3 characters).
    - expect: The 'Submit' button becomes enabled.

#### 3.2. Missing current account value keeps Submit disabled

**File:** `tests/accounts/add-account-no-value.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
    - expect: The panel opens.
  2. Type 'Valid Name' into the 'Account name' field and leave 'Current account value' blank.
    - expect: The 'Submit' button remains disabled because the required value field is empty.
  3. Enter '0.01' in the 'Current account value' field.
    - expect: The 'Submit' button becomes enabled.

#### 3.3. Empty account name keeps Submit disabled

**File:** `tests/accounts/add-account-empty-name.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'.
    - expect: The panel opens with the 'Submit' button disabled.
  2. Click the 'Current account value' field, enter '1000', and click elsewhere.
    - expect: The 'Submit' button remains disabled because the account name is still empty.

#### 3.4. Account type filterable select can be filtered by typing

**File:** `tests/accounts/add-account-type-filter.spec.ts`

**Steps:**
  1. Navigate to /savings and click 'Add account'. Click the 'Account type' filterable select.
    - expect: The dropdown opens showing all four options: Checking, Savings, Investment, Bonds.
  2. Type 'inv' into the account type field.
    - expect: The dropdown filters to show only 'Investment'.
  3. Click 'Investment' in the filtered list.
    - expect: The field displays 'Investment'.
    - expect: The dropdown closes.

### 4. Manage Account Panel — Open and Navigate

**Seed:** `tests/seed.spec.ts`

#### 4.1. Clicking an account row opens the manage panel with all options

**File:** `tests/accounts/manage-panel-opens.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' account row.
    - expect: A slide-up panel opens with the title 'Manage Test Checking'.
    - expect: Four option buttons are visible: 'Edit account', 'History', 'Stop tracking this account', 'Delete account'.
    - expect: A 'Close' button is visible at the bottom of the panel.
  2. Click the 'Close' button.
    - expect: The panel closes.
    - expect: The 'Your accounts' list is visible again.

#### 4.2. Manage panel opens from the Dashboard accounts list

**File:** `tests/accounts/manage-panel-opens-from-dashboard.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click the 'Test Checking' account row in the accounts list.
    - expect: The slide-up manage panel opens with title 'Manage Test Checking'.
  2. Click 'Close'.
    - expect: The panel closes.

### 5. Edit Account

**Seed:** `tests/seed.spec.ts`

#### 5.1. Edit account name and type — happy path

**File:** `tests/accounts/edit-account-name-and-type.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' account row to open the manage panel.
    - expect: The manage panel opens.
  2. Click 'Edit account'.
    - expect: The panel title changes to 'Edit Test Checking'.
    - expect: The 'Account name' field is pre-populated with 'Test Checking'.
    - expect: The 'Account type' field shows 'Checking'.
    - expect: The 'Submit' button is disabled (form is not yet dirty).
  3. Clear the 'Account name' field and type 'Primary Checking'.
    - expect: The input shows 'Primary Checking'.
    - expect: The 'Submit' button becomes enabled (form is dirty and valid).
  4. Click 'Submit'.
    - expect: The panel closes.
    - expect: The account row in 'Your accounts' now shows 'Primary Checking' instead of 'Test Checking'.

#### 5.2. Edit account — change type to Savings

**File:** `tests/accounts/edit-account-type-change.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
  2. Click 'Edit account'.
    - expect: The account type shows 'Checking'.
  3. Open the 'Account type' dropdown and select 'Savings'.
    - expect: The field shows 'Savings'.
    - expect: The 'Submit' button is enabled.
  4. Click 'Submit'.
    - expect: The panel closes.
    - expect: The 'Test Checking' row now shows a secondary label of 'Savings'.
    - expect: The 'Totals by account type' tile reflects the Savings total instead of a Checking total.

#### 5.3. Edit account — update annual growth rate

**File:** `tests/accounts/edit-account-growth-rate.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
  2. Click 'Edit account'. Observe the 'Annual growth rate' field.
    - expect: The field shows '0.00%' (matching the seeded value of 0).
  3. Click the 'Annual growth rate' field and type '5'.
    - expect: The field shows '5.00%'.
    - expect: The 'Submit' button is enabled.
  4. Click 'Submit'.
    - expect: The panel closes without error.

#### 5.4. Edit account — cancel discards changes

**File:** `tests/accounts/edit-account-cancel.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
  2. Click 'Edit account'.
    - expect: The edit form opens with 'Test Checking' pre-populated.
  3. Clear the 'Account name' field and type 'Should Not Save'.
  4. Click 'Cancel'.
    - expect: The edit form closes and the manage panel returns to its base view (options list).
    - expect: The account row in 'Your accounts' still reads 'Test Checking'.

#### 5.5. Edit account — name below 3 characters keeps Submit disabled

**File:** `tests/accounts/edit-account-name-validation.spec.ts`

**Steps:**
  1. Navigate to /savings, click the 'Test Checking' row, then click 'Edit account'.
    - expect: The form opens with 'Test Checking' in the name field.
  2. Clear the name field and type 'AB'.
    - expect: The 'Submit' button is disabled.
  3. Type one more character so the field contains 'ABC'.
    - expect: The 'Submit' button becomes enabled.

#### 5.6. Edit account — Submit disabled when form is unchanged

**File:** `tests/accounts/edit-account-not-dirty.spec.ts`

**Steps:**
  1. Navigate to /savings, click the 'Test Checking' row, then click 'Edit account'.
    - expect: The form opens pre-populated with the existing values.
  2. Do not change any field.
    - expect: The 'Submit' button is disabled because the form is not dirty.

### 6. Stop Tracking (Set Inactive)

**Seed:** `tests/seed.spec.ts`

#### 6.1. Stop tracking an account — happy path

**File:** `tests/accounts/stop-tracking-happy-path.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row to open the manage panel.
    - expect: The manage panel opens.
  2. Click 'Stop tracking this account'.
    - expect: The panel title changes to 'Stop tracking this account'.
    - expect: A heading reads 'Stop tracking "Test Checking"'.
    - expect: A description is shown explaining that this will not delete the account or its data.
    - expect: A 'Stop tracking' proceed button is visible.
    - expect: A 'Cancel' button is visible.
  3. Click 'Stop tracking'.
    - expect: The panel closes.
    - expect: The 'Test Checking' account row is no longer visible in the 'Your accounts' list (inactive accounts are not shown).
    - expect: The 'Your accounts' total updates to reflect zero or empty accounts.

#### 6.2. Cancel stop-tracking returns to base manage options

**File:** `tests/accounts/stop-tracking-cancel.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
  2. Click 'Stop tracking this account'.
    - expect: The SpeedBump confirmation screen appears.
  3. Click 'Cancel'.
    - expect: The manage panel returns to the base options list (showing Edit account, History, Stop tracking this account, Delete account).
    - expect: The account is still visible in the list and has not been deactivated.

### 7. Delete Account

**Seed:** `tests/seed.spec.ts`

#### 7.1. Delete account — full confirmation flow

**File:** `tests/accounts/delete-account-happy-path.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
    - expect: The manage panel opens.
  2. Click 'Delete account'.
    - expect: The panel title changes to 'Delete account'.
    - expect: A heading reads 'Permanently delete "Test Checking"'.
    - expect: A description warns about permanent deletion and suggests setting the account inactive instead.
    - expect: A bold final-warning line reads 'This action cannot be undone.'
    - expect: A 'Delete account' proceed button is visible and rendered in the destructive (tertiary) style.
    - expect: A 'Cancel' button is visible.
  3. Click 'Delete account' (the proceed button).
    - expect: The panel closes.
    - expect: The 'Test Checking' row is no longer in the 'Your accounts' list.
    - expect: The 'Your accounts' total is updated to $0.00 or the list shows no accounts.
    - expect: The 'Totals by account type' tile no longer shows a Checking row (or shows $0).
    - expect: The accounts-need-update banner is no longer shown on the Dashboard.

#### 7.2. Cancel delete returns to base manage options

**File:** `tests/accounts/delete-account-cancel.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
  2. Click 'Delete account'.
    - expect: The delete SpeedBump appears with the final warning text.
  3. Click 'Cancel'.
    - expect: The manage panel returns to the base options list.
    - expect: 'Test Checking' is still present in the 'Your accounts' list.

#### 7.3. Final warning text is bold and the proceed button uses the tertiary/destructive style

**File:** `tests/accounts/delete-account-final-warning-style.spec.ts`

**Steps:**
  1. Navigate to /savings, click 'Test Checking', then click 'Delete account'.
    - expect: The SpeedBump is visible.
  2. Inspect the final-warning paragraph.
    - expect: The text 'This action cannot be undone.' is wrapped in a <strong> element (bold).
    - expect: The 'Delete account' button does not use the primary (blue/green) style; it uses the tertiary (warning/danger) style.

### 8. Account Update History

**Seed:** `tests/seed.spec.ts`

#### 8.1. Open account history — shows current month as an add row

**File:** `tests/accounts/history-opens.spec.ts`

**Steps:**
  1. Navigate to /savings and click the 'Test Checking' row.
    - expect: The manage panel opens.
  2. Click 'History'.
    - expect: The panel title changes to '"Test Checking" history'.
    - expect: A row for the current month (e.g. 'June 2026') is present.
    - expect: Because the seeded account has no update for the current month, that row shows an 'Add for [current month]' button.
    - expect: A 'Back' button is visible at the bottom.
  3. Click 'Back'.
    - expect: The manage panel returns to the base options list.

#### 8.2. Account requiring update opens directly to History tab

**File:** `tests/accounts/history-auto-opens-on-update-required.spec.ts`

**Steps:**
  1. Navigate to /savings. Observe the 'Test Checking' row — it should display a CTA indicating the current month requires an update.
    - expect: The row shows a call-to-action text like '[Month] requires an update'.
  2. Click the 'Test Checking' row.
    - expect: The manage panel opens directly on the History tab (not the base options list), showing the title '"Test Checking" history'.
    - expect: The current month row is shown as an 'Add for [Month Year]' button.

#### 8.3. Add a monthly update for the current month

**File:** `tests/accounts/history-add-update.spec.ts`

**Steps:**
  1. Navigate to /savings, click 'Test Checking', then click 'History'.
    - expect: The history panel opens. The current month row shows an 'Add for [Month Year]' button.
  2. Click the 'Add for [current month]' button.
    - expect: The row expands to show a money input (prefixed with $) with the label 'Amount', and the 'Confirm change' button is not yet visible (no valid value entered).
  3. Enter '5250' in the money input.
    - expect: The formatted value '$5,250.00' appears in the input.
    - expect: A 'Confirm change' button becomes visible.
  4. Click 'Confirm change'.
    - expect: The row transitions from an 'Add' state to an 'Edit' state, showing '$5,250.00' pre-populated.
    - expect: No 'Confirm change' button is visible yet (form is not dirty).
    - expect: The 'Your accounts' list now shows the updated value for 'Test Checking'.
    - expect: The current-month update banner is no longer shown on the Dashboard (the account is now up to date).

#### 8.4. Edit an existing monthly update

**File:** `tests/accounts/history-edit-update.spec.ts`

**Steps:**
  1. Navigate to /savings, click 'Test Checking', click 'History', and add an update of '5000' for the current month via the 'Add for [Month]' button and 'Confirm change' (prerequisite step within the test).
    - expect: The current month row now shows '$5,000.00' pre-populated in the edit state.
  2. Clear the current-month amount field and type '5500'.
    - expect: The formatted value '$5,500.00' appears.
    - expect: A 'Confirm change' button becomes visible (the value is different from the saved value and is > 0).
  3. Click 'Confirm change'.
    - expect: The row updates to show '$5,500.00'.
    - expect: No 'Confirm change' button is visible (form is no longer dirty).
    - expect: The 'Your accounts' list reflects the updated value.

#### 8.5. Confirm change button hidden when edit amount equals saved amount

**File:** `tests/accounts/history-edit-no-change.spec.ts`

**Steps:**
  1. Navigate to /savings, click 'Test Checking', click 'History'. Add an update of '5000' for the current month and confirm it.
    - expect: The current month row shows '$5,000.00' and no 'Confirm change' button.
  2. Clear the amount field and retype '5000'.
    - expect: The 'Confirm change' button does not appear because the value matches the previously saved amount.

#### 8.6. Confirm change button hidden when edit amount is zero or empty

**File:** `tests/accounts/history-edit-zero-amount.spec.ts`

**Steps:**
  1. Navigate to /savings, click 'Test Checking', click 'History'. Add an update of '5000' for the current month and confirm it.
    - expect: The current month row is in the edit state showing '$5,000.00'.
  2. Clear the amount field entirely.
    - expect: The 'Confirm change' button does not appear (amount is 0 / empty, which fails the > 0 check).

#### 8.7. History panel shows months back to the earliest update month

**File:** `tests/accounts/history-month-rows.spec.ts`

**Steps:**
  1. Navigate to /savings. Add a second account named 'Old Account' (Checking, $1000) via 'Add account', then navigate to its history panel. Since this account was just created, there should be at least two month rows: the current month and one additional row for the month prior to the account creation month.
    - expect: The history panel shows at minimum two rows.
  2. Observe the rows.
    - expect: Rows are labeled by month and year (e.g., 'June 2026', 'May 2026').
    - expect: The current-month row shows an 'Add for [Month Year]' button.
    - expect: One extra 'Add for [previous month]' row is always shown below the oldest saved update.

### 9. Net Worth Tile and Totals by Account Type

**Seed:** `tests/seed.spec.ts`

#### 9.1. Net Worth tile renders for seeded user

**File:** `tests/accounts/net-worth-tile.spec.ts`

**Steps:**
  1. Navigate to /savings.
    - expect: The 'Net worth' module is visible.
    - expect: A chart or data visualization is rendered inside the module (not just a loading skeleton).

#### 9.2. Totals by Account Type reflects seeded Checking account

**File:** `tests/accounts/totals-by-type.spec.ts`

**Steps:**
  1. Navigate to /savings.
    - expect: The 'Totals by account type' module is visible.
    - expect: A row with the label 'Checking' is present.
    - expect: The 'Checking' row shows a currency total of '$5,000.00' (matching the seeded starting value).

#### 9.3. Totals by Account Type updates after adding a new account type

**File:** `tests/accounts/totals-by-type-updates.spec.ts`

**Steps:**
  1. Navigate to /savings and observe the 'Totals by account type' module.
    - expect: Only the 'Checking' row is present.
  2. Click 'Add account', enter name 'My IRA', select 'Investment', enter value '15000', and click 'Submit'.
    - expect: The panel closes.
  3. Observe the 'Totals by account type' module.
    - expect: An 'Investment' row is now present with a total of '$15,000.00'.
    - expect: The 'Checking' row still shows '$5,000.00'.
    - expect: Rows are sorted by total descending (Investment first, then Checking).
