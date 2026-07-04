# Spending E2E Test Plan

## Application Overview

SpendWatcher is a personal spending and savings tracker built as a React SPA backed by an oRPC API. This plan covers end-to-end tests for the Spending feature area only. Each test starts from a fresh, seeded state (3 discretionary transactions for the current month: "Lunch" RESTAURANTS $25 today, "Weekly groceries" GROCERIES $86 three days ago, "Streaming" ENTERTAINMENT $15 six days ago; plus 1 active recurring expense "Internet" UTILITIES expected $60/month). Authentication is handled by the seed fixture and is out of scope. Two primary surfaces are tested: (1) the Dashboard (/dashboard) with its spending summary tiles, recent transactions list, top discretionary categories widget, and avg-spent-per-month tile; and (2) the Recurring Spending page (/recurring_spending) with its create/edit/delete/toggle-active flows and monthly transaction logging. Key validation notes: the "Log expense" and recurring forms use a MoneyInput backed by react-number-format with decimalScale=2 for display; the contract schema enforces z.number().safe().positive() for amounts (decimals are accepted by the contract but 0 and negative values are rejected). Note name/description fields have explicit maxLength constraints (note: 100 chars, recurringSpendName: 60 chars). Date pickers have disableFuture set, blocking future-dated discretionary entries.

## Test Scenarios

### 1. Dashboard Spending Widgets

**Seed:** `tests/seed.spec.ts`

#### 1.1. Summary totals tile shows correct seeded amounts

**File:** `tests/spending/dashboard-summary-totals.spec.ts`

**Steps:**

1. Navigate to /dashboard and wait for the page heading to appear
   - expect: The page heading reads '[Month] overview' (e.g. 'June overview')

2. Locate the 'Total spent' tile
   - expect: The 'Total spent' tile is visible and displays a negative dollar amount reflecting the sum of all seeded transactions ($25 + $86 + $15 = $126 discretionary; recurring $0 if no monthly log yet, so total = $126)

3. Locate the 'Discretionary total' tile
   - expect: The 'Discretionary total' tile is visible and displays -$126.00 (the sum of the three seeded discretionary transactions)

4. Locate the 'Recurring total' tile
   - expect: The 'Recurring total' tile is visible and displays $0.00 or -- (no recurring monthly transaction has been logged yet)

#### 1.2. Recent transactions list displays seeded discretionary transactions

**File:** `tests/spending/dashboard-recent-transactions.spec.ts`

**Steps:**

1. Navigate to /dashboard and wait for the page heading
   - expect: The dashboard page renders without error

2. Locate the 'Recent transactions' module
   - expect: The 'Recent transactions' heading is visible

3. Inspect the transaction rows listed under 'Recent transactions'
   - expect: The 'Lunch' transaction is visible with its RESTAURANTS category icon and a -$25 amount
   - expect: The 'Weekly groceries' transaction is visible with its GROCERIES icon and a -$86 amount
   - expect: The 'Streaming' transaction is visible with its ENTERTAINMENT icon and a -$15 amount

4. Check the date headers that group the transactions
   - expect: The 'Lunch' transaction (today) is grouped under a header that includes 'Today'
   - expect: Older transactions are grouped under their respective date headers (e.g. 'Jun 17th')

5. Verify each date-group header shows a day-total amount in parentheses
   - expect: The day-total for today shows -$25.00 in the 'Lunch' group header

#### 1.3. Top discretionary categories widget shows correct category breakdown

**File:** `tests/spending/dashboard-top-categories.spec.ts`

**Steps:**

1. Navigate to /dashboard and wait for the page heading
   - expect: Dashboard renders

2. Locate the 'Top discretionary categories' module
   - expect: The heading 'Top discretionary categories' is visible

3. Inspect the category labels listed inside the module
   - expect: 'Groceries' category entry is visible with a -$86 amount and the highest percentage of total
   - expect: 'Dining out' (RESTAURANTS) category entry is visible with a -$25 amount
   - expect: 'Entertainment' category entry is visible with a -$15 amount

4. Verify the percentage bar at the top of the module is rendered
   - expect: A horizontal segmented bar representing category proportions is visible above the category labels

5. Click the 'Groceries' category label
   - expect: A slide-up panel or overlay opens showing individual transactions for the Groceries category, including 'Weekly groceries' for $86

6. Close the category detail panel
   - expect: The panel closes and the dashboard is visible again

#### 1.4. Summary totals update after logging a new discretionary expense

**File:** `tests/spending/dashboard-totals-update-after-add.spec.ts`

**Steps:**

1. Navigate to /dashboard and note the current 'Total spent' and 'Discretionary total' amounts
   - expect: Both tiles show values (total $126 and discretionary $126 respectively)

2. Click the 'Log expense' button on the dashboard
   - expect: The 'New expense' slide-up panel opens

3. Enter 50 into the Amount field
   - expect: The amount field displays '$50.00'

4. Select 'Fitness' from the Category filterable select
   - expect: The category field shows 'Fitness'

5. Select today's date in the Date of Expense date picker
   - expect: The date field shows today's date

6. Click the 'Submit' button
   - expect: The panel closes; a loading spinner may briefly appear on the button

7. Wait for the dashboard to re-render and inspect the 'Total spent' and 'Discretionary total' tiles
   - expect: The 'Total spent' tile now shows -$176.00 (previous $126 + new $50)
   - expect: The 'Discretionary total' tile now shows -$176.00

8. Check that the new transaction appears in the 'Recent transactions' list
   - expect: A transaction row for $50 with a Fitness category icon appears under today's date header

#### 1.5. Summary totals update after deleting a discretionary expense

**File:** `tests/spending/dashboard-totals-update-after-delete.spec.ts`

**Steps:**

1. Navigate to /dashboard and note the 'Total spent' tile shows -$126.00
   - expect: 'Total spent' displays -$126.00

2. In the 'Recent transactions' list, click the 'Lunch' transaction row
   - expect: The 'Edit expense' slide-up panel opens, pre-populated with the Lunch transaction details: RESTAURANTS category, $25 amount

3. Click 'Permanently delete this expense'
   - expect: The expense is deleted; the panel closes

4. Inspect the 'Total spent' and 'Discretionary total' tiles
   - expect: 'Total spent' now shows -$101.00 ($126 - $25)
   - expect: 'Discretionary total' now shows -$101.00

5. Inspect the 'Recent transactions' list
   - expect: The 'Lunch' row no longer appears; 'Weekly groceries' and 'Streaming' remain

### 2. Log Discretionary Spend — Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. Log a new expense with all optional fields filled

**File:** `tests/spending/log-expense-full-form.spec.ts`

**Steps:**

1. Navigate to /dashboard
   - expect: Dashboard renders with 'Log expense' button visible

2. Click 'Log expense'
   - expect: The 'New expense' slide-up panel opens with empty form fields; the Category field defaults to 'Other'

3. Click into the Amount field and type 42
   - expect: The field displays '$42.00'

4. Click the Category filterable select and type 'Gro' into the filter input
   - expect: The option list filters to show 'Groceries'

5. Select 'Groceries' from the filtered list
   - expect: The Category field shows 'Groceries'

6. Click the Notes field and type 'Trader Joes run'
   - expect: The notes field contains 'Trader Joes run'

7. Click the Date of Expense date picker and select a date from 2 days ago
   - expect: The date field shows the selected past date

8. Open the 'Linked Trip' select and choose 'Test Trip'
   - expect: The Linked Trip field shows 'Test Trip'

9. Click 'Submit'
   - expect: The panel closes; no error is shown

10. Check the 'Recent transactions' list on the dashboard
    - expect: A new Groceries transaction for -$42.00 appears, grouped under the date 2 days ago with note 'Trader Joes run' visible

#### 2.2. Log a new expense with only required fields

**File:** `tests/spending/log-expense-minimal-form.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Enter 100 in the Amount field
   - expect: The field displays '$100.00'

3. Leave the Category as the default 'Other'
   - expect: Category shows 'Other'

4. Select today's date in the Date of Expense picker
   - expect: Date field shows today's date

5. Click 'Submit'
   - expect: The panel closes; no error is shown

6. Verify the new transaction appears in 'Recent transactions'
   - expect: A new transaction row for -$100.00 with the 'Other' category icon appears under today's date

#### 2.3. Log expense panel can be cancelled without creating a transaction

**File:** `tests/spending/log-expense-cancel.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Enter 99 in the Amount field
   - expect: The field shows '$99.00'

3. Click the 'Cancel' button
   - expect: The panel closes without submitting; no loading state or API call occurs

4. Inspect the 'Recent transactions' list and 'Total spent' tile
   - expect: No new $99 transaction appears
   - expect: 'Total spent' still shows the original -$126.00

### 3. Log Discretionary Spend — Validation & Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 3.1. Submit button is disabled when Amount is empty

**File:** `tests/spending/log-expense-validation-empty-amount.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Leave the Amount field empty; select today's date in the Date of Expense picker
   - expect: The Amount field remains blank

3. Observe the 'Submit' button state
   - expect: The 'Submit' button is disabled (not clickable) because the form is invalid with no amount

#### 3.2. Submit button is disabled when Date is missing

**File:** `tests/spending/log-expense-validation-missing-date.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Enter 25 in the Amount field but do not select a date
   - expect: Amount shows '$25.00'; Date of Expense field remains empty

3. Observe the 'Submit' button state
   - expect: The 'Submit' button remains disabled because the required Date field is empty

#### 3.3. Future date is blocked in the Date of Expense picker

**File:** `tests/spending/log-expense-validation-future-date.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Open the Date of Expense date picker and attempt to select a date that is tomorrow or later
   - expect: Future dates are grayed out or disabled in the calendar; they cannot be selected

3. Confirm a past or today date is selectable
   - expect: Today and prior dates are enabled and can be picked

#### 3.4. Note field enforces 100-character maximum

**File:** `tests/spending/log-expense-validation-note-max-length.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Enter 101 characters into the Notes field (e.g. 'A' repeated 101 times)
   - expect: The notes field accepts input

3. Enter a valid amount (e.g. 10) and select today's date, then observe the Submit button state
   - expect: The 'Submit' button is disabled because the note exceeds the 100-character limit enforced by the form schema

4. Trim the note to exactly 100 characters
   - expect: The 'Submit' button becomes enabled

#### 3.5. Zero amount is rejected — Submit stays disabled

**File:** `tests/spending/log-expense-validation-zero-amount.spec.ts`

**Steps:**

1. Navigate to /dashboard and click 'Log expense'
   - expect: The 'New expense' panel opens

2. Type 0 in the Amount field and select today's date
   - expect: Amount field shows '$0.00'

3. Observe the 'Submit' button
   - expect: The 'Submit' button remains disabled; zero fails the positive() constraint in the Zod schema

### 4. Edit and Delete Discretionary Transactions

**Seed:** `tests/seed.spec.ts`

#### 4.1. Open edit panel from Recent Transactions and change the amount

**File:** `tests/spending/edit-expense-change-amount.spec.ts`

**Steps:**

1. Navigate to /dashboard
   - expect: Dashboard renders with 'Recent transactions' list visible

2. Click the 'Lunch' transaction row in the Recent Transactions list
   - expect: The 'Edit expense' slide-up panel opens, pre-populated with: Amount = $25.00, Category = 'Dining out', Date = today, Note = 'Lunch'

3. Clear the Amount field and type 35
   - expect: Amount field now shows '$35.00'

4. Click 'Submit'
   - expect: The panel closes

5. Inspect the 'Total spent' tile and the 'Recent transactions' list
   - expect: 'Total spent' now shows -$136.00 ($86 + $35 + $15)
   - expect: The 'Lunch' row (now under today's date) shows -$35.00

#### 4.2. Open edit panel and change the category

**File:** `tests/spending/edit-expense-change-category.spec.ts`

**Steps:**

1. Navigate to /dashboard and click the 'Streaming' transaction row
   - expect: The 'Edit expense' panel opens with Category showing 'Entertainment' and Amount $15.00

2. Open the Category select and choose 'Fitness'
   - expect: Category field now shows 'Fitness'

3. Click 'Submit'
   - expect: The panel closes without error

4. Check the 'Top discretionary categories' widget
   - expect: 'Entertainment' category label no longer appears (its amount dropped to $0); 'Fitness' now appears with -$15.00

#### 4.3. Edit panel enforces same validations as New expense form

**File:** `tests/spending/edit-expense-validation.spec.ts`

**Steps:**

1. Navigate to /dashboard and click the 'Lunch' transaction row
   - expect: The 'Edit expense' panel opens

2. Clear the Amount field completely
   - expect: Amount field is blank

3. Observe the 'Submit' button
   - expect: The 'Submit' button is disabled because the amount is empty/invalid

4. Re-enter a valid amount such as 25
   - expect: The 'Submit' button becomes enabled again

#### 4.4. Delete a discretionary transaction via the edit panel

**File:** `tests/spending/delete-expense.spec.ts`

**Steps:**

1. Navigate to /dashboard and click the 'Weekly groceries' transaction row
   - expect: The 'Edit expense' panel opens, pre-populated with: Amount $86.00, Category 'Groceries', Note 'Weekly groceries'

2. Click 'Permanently delete this expense'
   - expect: The panel closes immediately (no speed-bump confirmation for discretionary delete)

3. Inspect 'Recent transactions'
   - expect: 'Weekly groceries' row is no longer present; 'Lunch' and 'Streaming' remain

4. Inspect 'Discretionary total' tile
   - expect: 'Discretionary total' now shows -$40.00 ($25 + $15)

#### 4.5. Edit panel can be cancelled without saving changes

**File:** `tests/spending/edit-expense-cancel.spec.ts`

**Steps:**

1. Navigate to /dashboard and click the 'Lunch' transaction row
   - expect: 'Edit expense' panel opens with Amount $25.00

2. Clear the Amount and type 999
   - expect: Amount field shows '$999.00'

3. Click 'Cancel'
   - expect: The panel closes without saving the change

4. Check the 'Lunch' transaction in 'Recent transactions'
   - expect: The amount still shows -$25.00; 'Total spent' is still -$126.00

### 5. Recurring Spending Page — Create Recurring Expense

**Seed:** `tests/seed.spec.ts`

#### 5.1. Create a new fixed recurring expense with all required fields

**File:** `tests/spending/recurring-create-fixed.spec.ts`

**Steps:**

1. Navigate to /recurring_spending
   - expect: The 'Recurring spending' page heading is visible; the 'Internet' expense card is shown under 'Monthly transactions'

2. Click 'Create recurring expense'
   - expect: The 'New recurring expense' slide-up panel opens with: Expense name empty, Category defaulting to 'Other', 'This amount varies' checkbox unchecked, Monthly amount empty

3. Type 'Netflix' in the Expense name field
   - expect: The field shows 'Netflix'

4. Open the Category select and choose 'Entertainment'
   - expect: Category shows 'Entertainment'

5. Leave the 'This amount varies' checkbox unchecked
   - expect: Checkbox remains unchecked; label reads 'Monthly amount'

6. Enter 18 in the Monthly amount field
   - expect: Field shows '$18.00'

7. Click 'Submit'
   - expect: The panel closes without error

8. Inspect the 'Monthly transactions' list on the page
   - expect: A new 'Netflix' card appears with 'Entertainment' category icon, showing the 'Update required' tag (since no monthly transaction has been logged yet) and a 'Fixed' label

#### 5.2. Create a new variable recurring expense

**File:** `tests/spending/recurring-create-variable.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Create recurring expense'
   - expect: The 'New recurring expense' panel opens

2. Enter 'Electric bill' in the Expense name field
   - expect: Field shows 'Electric bill'

3. Select 'Utilities' from the Category select
   - expect: Category shows 'Utilities'

4. Check the 'This amount varies' checkbox
   - expect: Checkbox becomes checked; the monthly amount label changes to 'Estimated monthly amount'

5. Enter 80 in the Estimated monthly amount field
   - expect: Field shows '$80.00'

6. Click 'Submit'
   - expect: Panel closes

7. Inspect the new 'Electric bill' card
   - expect: The card shows 'Utilities' icon, 'Update required' tag, and 'Estimated: $80.00' label (not 'Fixed')

#### 5.3. Create recurring expense panel can be cancelled

**File:** `tests/spending/recurring-create-cancel.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and note the number of expense cards in 'Monthly transactions'
   - expect: One card ('Internet') is listed

2. Click 'Create recurring expense'
   - expect: The 'New recurring expense' panel opens

3. Type 'Rent' in the Expense name field and enter 1500 in the Monthly amount field
   - expect: Fields are filled

4. Click 'Cancel'
   - expect: Panel closes without saving

5. Inspect the 'Monthly transactions' list
   - expect: Only the 'Internet' card is shown; 'Rent' does not appear

### 6. Recurring Spending — Validation

**Seed:** `tests/seed.spec.ts`

#### 6.1. Submit is disabled when Expense name is missing

**File:** `tests/spending/recurring-validation-missing-name.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Create recurring expense'
   - expect: The 'New recurring expense' panel opens

2. Leave Expense name blank; enter 50 in the Monthly amount field
   - expect: Name field is empty; amount shows '$50.00'

3. Observe the 'Submit' button
   - expect: 'Submit' is disabled because the required Expense name is blank

#### 6.2. Submit is disabled when Monthly amount is missing

**File:** `tests/spending/recurring-validation-missing-amount.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Create recurring expense'
   - expect: The 'New recurring expense' panel opens

2. Enter 'Gym membership' in the Expense name field; leave the Monthly amount blank
   - expect: Name field shows 'Gym membership'; amount is empty

3. Observe the 'Submit' button
   - expect: 'Submit' is disabled because the required Monthly amount is blank

#### 6.3. Expense name field enforces 60-character maximum

**File:** `tests/spending/recurring-validation-name-max-length.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Create recurring expense'
   - expect: Panel opens

2. Type 61 characters into the Expense name field (e.g. 'A' repeated 61 times)
   - expect: The field accepts the input

3. Enter 50 in the Monthly amount field, then observe the Submit button
   - expect: 'Submit' is disabled because the name exceeds the 60-character max

4. Trim the name to exactly 60 characters
   - expect: 'Submit' becomes enabled

#### 6.4. Zero monthly amount is rejected

**File:** `tests/spending/recurring-validation-zero-amount.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Create recurring expense'
   - expect: Panel opens

2. Enter 'Parking' in Expense name and type 0 in the Monthly amount field
   - expect: Name field shows 'Parking'; amount shows '$0.00'

3. Observe the 'Submit' button
   - expect: 'Submit' is disabled; zero fails the positive() constraint

### 7. Recurring Spending — Edit and Delete

**Seed:** `tests/seed.spec.ts`

#### 7.1. Edit a recurring expense name and category

**File:** `tests/spending/recurring-edit-name-category.spec.ts`

**Steps:**

1. Navigate to /recurring_spending
   - expect: 'Internet' card is visible under 'Monthly transactions'

2. Click the 'Internet' card
   - expect: The manage panel opens showing 'What would you like to do?' with options: Edit, History, Mark as inactive / Reactivate, Permanently delete

3. Click 'Edit'
   - expect: The panel transitions to the Edit view; the Expense name field shows 'Internet', category shows 'Utilities', Monthly amount shows '$60.00'

4. Clear the Expense name and type 'Home Internet'
   - expect: The Expense name field shows 'Home Internet'

5. Open the Category select and choose 'Housing'
   - expect: Category shows 'Housing'

6. Click 'Submit'
   - expect: The panel closes

7. Inspect the 'Monthly transactions' list
   - expect: The card now shows 'Home Internet' with a Housing category icon instead of 'Internet' / Utilities

#### 7.2. Edit recurring expense submit is disabled when form is not dirty

**File:** `tests/spending/recurring-edit-submit-not-dirty.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click the 'Internet' card
   - expect: Manage panel opens

2. Click 'Edit'
   - expect: Edit form is shown, pre-populated with 'Internet' details

3. Do not change any field; observe the 'Submit' button
   - expect: The 'Submit' button is disabled because the form is not dirty (no changes made)

4. Change the Monthly amount to 65
   - expect: Amount shows '$65.00'; 'Submit' becomes enabled because the form is now dirty

#### 7.3. Permanently delete a recurring expense with speed-bump confirmation

**File:** `tests/spending/recurring-delete.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click the 'Internet' card
   - expect: Manage panel opens showing options

2. Click 'Permanently delete'
   - expect: The panel transitions to a speed-bump showing: 'Are you sure?', a description mentioning 'Internet', a 'This action cannot be undone.' final warning, and a 'Delete' button alongside a 'Cancel' button

3. Click 'Delete' (the confirm/proceed button)
   - expect: The panel closes

4. Inspect the 'Monthly transactions' list on the /recurring_spending page
   - expect: The 'Internet' card is gone; the section may show no active recurring expenses

#### 7.4. Cancel out of the delete speed-bump without deleting

**File:** `tests/spending/recurring-delete-cancel.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Internet', then 'Permanently delete'
   - expect: Speed-bump confirmation panel appears

2. Click 'Cancel'
   - expect: Panel returns to the 'What would you like to do?' base view

3. Close the panel
   - expect: 'Internet' card is still present in 'Monthly transactions'

### 8. Recurring Spending — Toggle Active/Inactive

**Seed:** `tests/seed.spec.ts`

#### 8.1. Mark an active recurring expense as inactive

**File:** `tests/spending/recurring-mark-inactive.spec.ts`

**Steps:**

1. Navigate to /recurring_spending
   - expect: 'Internet' card appears under the 'Monthly transactions' section (active)

2. Click the 'Internet' card
   - expect: Manage panel opens with option 'Mark as inactive'

3. Click 'Mark as inactive'
   - expect: A speed-bump panel appears with title 'Deactivate this recurring spend' and a description explaining what deactivation means

4. Click 'Confirm'
   - expect: The panel closes

5. Inspect the /recurring_spending page
   - expect: 'Internet' no longer appears under 'Monthly transactions'
   - expect: An 'Inactive transactions' section becomes visible and 'Internet' appears inside it with a visually muted/inactive style

#### 8.2. Reactivate an inactive recurring expense

**File:** `tests/spending/recurring-reactivate.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click the 'Internet' card to open its panel, then mark it inactive (as above) so it moves to the Inactive section
   - expect: 'Internet' is now in the 'Inactive transactions' section

2. Click the 'Internet' card in the 'Inactive transactions' section
   - expect: Manage panel opens with option 'Reactivate this expense'

3. Click 'Reactivate this expense'
   - expect: A speed-bump appears with title 'Reactivate this recurring spend' and a description about what reactivation means

4. Click 'Confirm'
   - expect: The panel closes

5. Inspect the page
   - expect: 'Internet' moves back to 'Monthly transactions' section
   - expect: The 'Inactive transactions' section either disappears or is empty

#### 8.3. Cancel out of the mark-inactive speed-bump without deactivating

**File:** `tests/spending/recurring-mark-inactive-cancel.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click 'Internet', then click 'Mark as inactive'
   - expect: Deactivation speed-bump appears

2. Click 'Cancel'
   - expect: Panel returns to the base 'What would you like to do?' view

3. Close the panel
   - expect: 'Internet' remains under 'Monthly transactions' (still active)

### 9. Recurring Spending — Log Monthly Transaction

**Seed:** `tests/seed.spec.ts`

#### 9.1. Log this month's actual amount for a recurring expense (defaults to expected amount)

**File:** `tests/spending/recurring-log-monthly-default.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click the 'Internet' card
   - expect: Manage panel opens; because 'Internet' has no monthly transaction logged, the panel should open directly to the History view (requiresMonthlyUpdate = true)

2. Locate the current-month row in the history list (e.g. 'June 2026'); it should show an 'Add for [Month Year]' button
   - expect: An 'Add for [Month Year]' button is shown for the current month

3. Click 'Add for [Month Year]'
   - expect: The row expands to an editable amount row with an Amount spent field pre-filled with the expected amount (shown as placeholder $60.00) and a confirm button

4. Leave the amount field blank (relying on the expected amount default) and click the confirm button
   - expect: The row collapses/saves; the month row now shows $60.00 as the logged amount

5. Go back to the main recurring panel view and close the panel
   - expect: The 'Internet' card on the main page now displays -$60.00 instead of 'Update required'

6. Navigate to /dashboard and inspect the 'Recurring total' tile
   - expect: 'Recurring total' now shows -$60.00

#### 9.2. Log a custom monthly amount that differs from expected

**File:** `tests/spending/recurring-log-monthly-custom.spec.ts`

**Steps:**

1. Navigate to /recurring_spending and click the 'Internet' card (opens to History view)
   - expect: History view is visible with 'Add for [Month Year]' button for current month

2. Click 'Add for [Month Year]' to expand the input row
   - expect: Amount spent field appears with placeholder showing the expected amount

3. Type 75 in the Amount spent field
   - expect: Field shows '75' (or $75 depending on input format)

4. Click the confirm button
   - expect: The row saves; current month shows $75 as the logged amount

5. Navigate to /dashboard and inspect the 'Recurring total' tile
   - expect: 'Recurring total' shows -$75.00 (the custom amount, not the expected $60)

#### 9.3. Edit a previously logged monthly recurring amount

**File:** `tests/spending/recurring-edit-monthly-amount.spec.ts`

**Steps:**

1. Navigate to /recurring_spending, click 'Internet', open the History view (click 'History' option from the base panel if not auto-opened), and log $60 for the current month
   - expect: Current month shows $60.00 as the logged amount

2. Locate the current-month row which now shows $60.00; modify the amount field to 55
   - expect: Amount field shows 55

3. Click the confirm button that appears when the value differs from the saved amount
   - expect: The row saves with the new amount $55.00

4. Navigate to /dashboard and inspect 'Recurring total'
   - expect: 'Recurring total' shows -$55.00

#### 9.4. Recurring spend page sidebar shows updated estimated and actual monthly totals

**File:** `tests/spending/recurring-sidebar-totals.spec.ts`

**Steps:**

1. Navigate to /recurring_spending
   - expect: Sidebar shows 'Estimated monthly total' with a value reflecting the seeded 'Internet' expected $60

2. Note the '[Month] actual total' value (should be $0 or blank if no monthly transaction logged yet)
   - expect: Actual total shows $0.00 or -- before any transaction is logged

3. Click 'Internet', open the History view, and add a monthly transaction of $65
   - expect: Transaction is saved

4. Close the panel and inspect the sidebar
   - expect: '[Month] actual total' now shows -$65.00 (the amount just logged)
