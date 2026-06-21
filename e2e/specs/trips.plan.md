# Trips E2E Test Plan

## Application Overview

SpendWatcher is a personal spending and savings tracker with a React SPA front end and an oRPC API. The Trips feature lives at /trips and lets users create, view, edit, and delete trips, then link discretionary expense transactions to a trip so those costs are grouped and totalled under it.

Each trip card on the list page shows the trip name, date range, and four cost-total data points (Airfare, Lodging, Discretionary, Total). Clicking "Details" opens a SlideUpPanel that shows the same date range, a "Linked transactions" list (empty-state info alert when none exist, rows when linked), and two action buttons: Close and Edit trip details. The edit form contains the same three fields as the add form (trip name, start date, end date) plus a "Permanently delete this trip" button that triggers a speed-bump confirmation before deletion.

Linking an expense to a trip is done through the "Log expense" form on the Dashboard (or the edit-expense form reachable by tapping any transaction). The form contains a "Linked Trip" filterable-select field. When a trip is active (today falls within its date range) the form auto-populates that field and shows an info notice naming the active trip.

Key constraints sourced from the code:
- tripName: required, min 1 character, max 100 characters (validated both client-side via zod and server-side via the contract).
- startDate / endDate: required; the date-picker enforces startDate <= endDate (maxDate on start picker = endDate; minDate on end picker = startDate).
- amountSpent for discretionary transactions: safe integer (whole number), required.
- The seeded "Test Trip" ran ~14–10 days ago, so it is NOT an active trip during any test run. To test the active-trip auto-selection behaviour a new trip spanning today must be created first.
- After a trip is deleted, linked transactions are unlinked (their linkedTripId is set to null) but not deleted.

## Test Scenarios

### 1. Trips List Page

**Seed:** `tests/seed.spec.ts`

#### 1.1. Trips list shows the seeded trip card with correct fields

**File:** `tests/trips/trips-list-shows-seeded-trip.spec.ts`

**Steps:**
  1. Navigate to /trips.
    - expect: The page heading 'My trips' is visible.
  2. Locate the trip card for 'Test Trip'.
    - expect: A card with the heading 'Test Trip' is present on the page.
    - expect: The card displays a formatted date range label (e.g. 'Jun 6 - Jun 10, 2026' using the seeded dates ~14–10 days ago).
    - expect: The card contains four data-point tiles: 'Airfare', 'Lodging', 'Discretionary', and 'Total'.
    - expect: All four cost-total amounts display as currency values (e.g. '$0.00' when no expenses are linked).
  3. Confirm the 'Add trip' button and the 'Details' button are both present.
    - expect: 'Add trip' button is visible on the page.
    - expect: A 'Details' button is visible within the 'Test Trip' card.

#### 1.2. Trips list shows empty cost totals for a trip with no linked expenses

**File:** `tests/trips/trips-list-empty-totals.spec.ts`

**Steps:**
  1. Navigate to /trips.
  2. On the 'Test Trip' card, inspect the four cost-total data-point amounts (Airfare, Lodging, Discretionary, Total).
    - expect: All four amounts show $0.00 because no expenses have been linked to 'Test Trip'.
  3. Note that no expenses show in the list.
    - expect: The absence of linked expenses means all totals are $0.00.

### 2. Add Trip — Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. Add a new trip with name, start date, and end date

**File:** `tests/trips/add-trip-happy-path.spec.ts`

**Steps:**
  1. Navigate to /trips.
    - expect: The 'Add trip' button is visible.
  2. Click the 'Add trip' button.
    - expect: A SlideUpPanel slides up with the title 'New trip'.
    - expect: The panel contains a 'Trip name' text input, a 'Start date' date picker, and an 'End date' date picker.
    - expect: The 'Submit' button is present (may be disabled until the form is valid).
  3. Type 'Summer Vacation' into the 'Trip name' input.
    - expect: The trip name field shows 'Summer Vacation'.
  4. Set the 'Start date' picker to a date two months from today (e.g., August 1, 2026).
    - expect: The start date field reflects the selected date.
  5. Set the 'End date' picker to a date four days after the start date (e.g., August 5, 2026).
    - expect: The end date field reflects the selected date.
    - expect: The 'Submit' button is enabled.
  6. Click the 'Submit' button.
    - expect: The panel closes.
    - expect: A new trip card for 'Summer Vacation' appears on the trips list.
    - expect: The card displays the correct date range.
    - expect: All four cost totals show $0.00.
  7. Verify the trips list now has two cards.
    - expect: Both 'Test Trip' and 'Summer Vacation' cards are present.

#### 2.2. Add a trip with a same-day start and end date

**File:** `tests/trips/add-trip-same-day.spec.ts`

**Steps:**
  1. Navigate to /trips.
  2. Click the 'Add trip' button.
    - expect: The 'New trip' panel opens.
  3. Type 'Day Trip' in the 'Trip name' input.
  4. Leave the start date and end date both set to today (the form defaults both to today's date).
    - expect: Both date pickers show today's date.
    - expect: The 'Submit' button is enabled.
  5. Click 'Submit'.
    - expect: The panel closes.
    - expect: A 'Day Trip' card appears in the trips list with a date range label showing a single date.
    - expect: All cost totals are $0.00.

### 3. Add Trip — Validation & Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 3.1. Submit button is disabled when trip name is empty

**File:** `tests/trips/add-trip-empty-name-blocked.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Add trip'.
    - expect: The 'New trip' panel opens with an empty 'Trip name' field.
  2. Do not type anything into the 'Trip name' input. Observe the 'Submit' button state.
    - expect: The 'Submit' button is disabled (the zod resolver with min(1) marks the form invalid while trip name is empty).
  3. Click the 'Submit' button (or attempt to).
    - expect: No submission occurs. The panel remains open.
  4. Type a single character 'A' into the 'Trip name' field.
    - expect: The 'Submit' button becomes enabled.

#### 3.2. Trip name at maximum length (100 characters) is accepted

**File:** `tests/trips/add-trip-max-name-length.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Add trip'.
    - expect: The 'New trip' panel opens.
  2. Type a 100-character string (e.g., 100 'x' characters) into the 'Trip name' input.
    - expect: The field accepts all 100 characters.
    - expect: The 'Submit' button is enabled.
  3. Click 'Submit'.
    - expect: The panel closes.
    - expect: A trip card with the 100-character name appears in the trips list.

#### 3.3. Cancel closes the add-trip panel without creating a trip

**File:** `tests/trips/add-trip-cancel.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Add trip'.
    - expect: The 'New trip' panel opens.
  2. Type 'Ghost Trip' into the 'Trip name' field.
  3. Click the 'Cancel' button.
    - expect: The panel closes without submitting.
    - expect: No 'Ghost Trip' card appears in the trips list. Only 'Test Trip' is shown.
  4. Confirm the trips list still shows only 'Test Trip'.
    - expect: Only 'Test Trip' is visible.

#### 3.4. End date picker enforces that end date cannot be before start date

**File:** `tests/trips/add-trip-date-order-enforced.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Add trip'.
    - expect: The 'New trip' panel opens.
  2. Type 'Date Order Test' into the 'Trip name' input.
  3. Set the 'Start date' picker to August 15, 2026.
    - expect: Start date shows August 15, 2026.
  4. Attempt to set the 'End date' picker to August 10, 2026 (before the start date).
    - expect: The end-date picker does not allow selecting August 10 because minDate is set to the current startDate value. Dates before August 15, 2026 are disabled/unselectable in the end date calendar.
  5. Set the 'End date' to August 15, 2026 (same as start date) to confirm the minimum allowed value.
    - expect: End date accepts August 15, 2026.
    - expect: The 'Submit' button is enabled.
  6. Attempt to set the 'Start date' picker to August 20, 2026 (after the current end date of August 15, 2026).
    - expect: The start-date picker does not allow selecting August 20 because maxDate is set to the current endDate value.

### 4. Trip Details Panel

**Seed:** `tests/seed.spec.ts`

#### 4.1. Opening trip details shows date range and empty linked transactions state

**File:** `tests/trips/trip-details-empty-state.spec.ts`

**Steps:**
  1. Navigate to /trips.
  2. Click the 'Details' button on the 'Test Trip' card.
    - expect: A SlideUpPanel slides up with the title 'Test Trip'.
    - expect: The panel displays the trip's date range label.
    - expect: A 'Linked transactions' section heading is visible.
    - expect: An info-variant alert message is shown with a title matching the empty-state copy (e.g., 'This trip has no linked transactions yet').
    - expect: The alert message body contains guidance such as 'Add transactions to this trip to see them here.'
  3. Verify the panel footer contains 'Close' and 'Edit trip details' buttons.
    - expect: 'Close' button is visible.
    - expect: 'Edit trip details' button is visible.

#### 4.2. Closing the trip details panel via the Close button returns to the trips list

**File:** `tests/trips/trip-details-close.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Details' on the 'Test Trip' card.
    - expect: The 'Test Trip' details panel is open.
  2. Click the 'Close' button.
    - expect: The panel closes.
    - expect: The user is back on the /trips page with the trip cards list visible.

### 5. Edit Trip — Happy Path

**Seed:** `tests/seed.spec.ts`

#### 5.1. Edit trip name and date range, then verify updated card

**File:** `tests/trips/edit-trip-happy-path.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Details' on the 'Test Trip' card.
    - expect: The 'Test Trip' details panel opens showing base state.
  2. Click the 'Edit trip details' button in the panel footer.
    - expect: The panel transitions to show the 'Edit trip details' view.
    - expect: The panel title changes to 'Edit trip details'.
    - expect: The 'Trip name' input is pre-populated with 'Test Trip'.
    - expect: The 'Start date' picker is pre-populated with the trip's existing start date.
    - expect: The 'End date' picker is pre-populated with the trip's existing end date.
    - expect: A 'Permanently delete this trip' button is visible (edit mode only).
  3. Clear the 'Trip name' input and type 'Edited Trip Name'.
    - expect: The field shows 'Edited Trip Name'.
  4. Click 'Submit'.
    - expect: The panel transitions back to the base (details) view.
    - expect: The panel title now reads 'Edited Trip Name'.
  5. Click 'Close' to dismiss the panel.
    - expect: On the trips list, the card formerly labeled 'Test Trip' now shows 'Edited Trip Name'.

#### 5.2. Cancel in edit mode returns to the trip details base state without saving

**File:** `tests/trips/edit-trip-cancel.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Details' on the 'Test Trip' card.
  2. Click 'Edit trip details'.
    - expect: The edit form is shown with 'Test Trip' pre-populated.
  3. Clear the 'Trip name' input and type 'Discarded Name'.
    - expect: The field shows 'Discarded Name'.
  4. Click 'Cancel'.
    - expect: The panel returns to the base detail view.
    - expect: The panel title still reads 'Test Trip' (the name was not saved).
  5. Click 'Close' and verify the trips list.
    - expect: The trip card still shows 'Test Trip'.

### 6. Delete Trip

**Seed:** `tests/seed.spec.ts`

#### 6.1. Delete a trip via the speed-bump confirmation and verify it is removed from the list

**File:** `tests/trips/delete-trip-happy-path.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Details' on 'Test Trip'.
  2. Click 'Edit trip details'.
    - expect: The edit form is visible with the 'Permanently delete this trip' delete button.
  3. Click the 'Permanently delete this trip' button.
    - expect: The panel transitions to the speed-bump (confirmation) state.
    - expect: The panel title reads 'Delete Test Trip'.
    - expect: A warning heading 'Are you sure?' is displayed.
    - expect: Warning body text confirms that the trip will be deleted but linked transactions will remain with their linked trip set to 'None'.
    - expect: 'Confirm' and 'Cancel' buttons are visible.
  4. Click the 'Confirm' button.
    - expect: The panel closes.
    - expect: The 'Test Trip' card is no longer present in the trips list.
    - expect: The trips list is empty (no other trips were added in this test).
  5. Navigate away and back to /trips to confirm persistence.
    - expect: 'Test Trip' does not reappear.

#### 6.2. Cancel the delete speed-bump returns to the edit form without deleting the trip

**File:** `tests/trips/delete-trip-cancel.spec.ts`

**Steps:**
  1. Navigate to /trips, open 'Test Trip' details, click 'Edit trip details', then click 'Permanently delete this trip'.
    - expect: The speed-bump confirmation state is shown.
  2. Click 'Cancel' on the speed-bump.
    - expect: The panel transitions back to the edit form (not the base details view — cancelling the delete goes to 'editTripDetails' state, per the code).
    - expect: The panel title is 'Edit trip details'.
  3. Click 'Cancel' on the edit form.
    - expect: The panel returns to the base details view showing 'Test Trip'.
  4. Click 'Close' and verify the trips list.
    - expect: The 'Test Trip' card is still present in the list.

### 7. Linking an Expense to a Trip

**Seed:** `tests/seed.spec.ts`

#### 7.1. Log a new expense linked to Test Trip and verify it appears in trip details

**File:** `tests/trips/link-expense-to-trip.spec.ts`

**Steps:**
  1. Navigate to /dashboard.
    - expect: The 'Log expense' button is visible.
  2. Click the 'Log expense' button.
    - expect: The 'New expense' SlideUpPanel opens.
    - expect: The form contains fields: Amount, Category, Notes, Date of Expense, and Linked Trip.
    - expect: The 'Linked Trip' field shows a filterable select with placeholder text (no active trip, so it is not auto-selected).
  3. Enter '50' in the Amount field.
    - expect: The amount field shows $50.
  4. Leave Category as 'Other' (default).
  5. Type 'Souvenir' in the Notes field.
  6. Leave the Date of Expense as today's date.
  7. Click the 'Linked Trip' filterable-select dropdown and select 'Test Trip' from the list.
    - expect: The 'Linked Trip' field now shows 'Test Trip'.
  8. Click 'Submit'.
    - expect: The panel closes.
    - expect: No error occurs.
  9. Navigate to /trips.
  10. Click 'Details' on the 'Test Trip' card.
    - expect: The 'Test Trip' details panel opens.
    - expect: The 'Linked transactions' section now shows one transaction row.
    - expect: The transaction row displays the category icon for 'Other', the note 'Souvenir', the amount '$50', and a date label.
    - expect: The empty-state alert ('This trip has no linked transactions yet') is no longer shown.
  11. Verify the cost totals on the 'Test Trip' card have updated.
    - expect: Close the panel.
    - expect: The 'Test Trip' card's 'Discretionary' data point now shows -$50 (or $50 formatted as a loss/spend).
    - expect: The 'Total' data point also reflects -$50.

#### 7.2. Link expense with Airfare category updates the airfare total on the trip card

**File:** `tests/trips/link-airfare-expense-to-trip.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click 'Log expense'.
    - expect: The 'New expense' panel opens.
  2. Enter '300' in the Amount field.
  3. Select 'Airfare' from the Category dropdown.
    - expect: Category is set to 'Airfare'.
  4. Select 'Test Trip' from the 'Linked Trip' dropdown.
    - expect: Linked Trip shows 'Test Trip'.
  5. Click 'Submit'.
    - expect: Panel closes.
  6. Navigate to /trips and inspect the 'Test Trip' card.
    - expect: The 'Airfare' data point on the card shows -$300.
    - expect: The 'Total' data point on the card shows -$300.

#### 7.3. Link expense with Lodging category updates the lodging total on the trip card

**File:** `tests/trips/link-lodging-expense-to-trip.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click 'Log expense'.
    - expect: The 'New expense' panel opens.
  2. Enter '200' in the Amount field.
  3. Select 'Lodging' from the Category dropdown.
    - expect: Category is set to 'Lodging'.
  4. Select 'Test Trip' from the 'Linked Trip' dropdown.
    - expect: Linked Trip shows 'Test Trip'.
  5. Click 'Submit'.
    - expect: Panel closes.
  6. Navigate to /trips and inspect the 'Test Trip' card.
    - expect: The 'Lodging' data point on the card shows -$200.
    - expect: The 'Total' data point on the card shows -$200.

#### 7.4. Multiple linked expenses sum correctly in trip totals

**File:** `tests/trips/link-multiple-expenses-totals.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click 'Log expense'. Enter amount '100', category 'Other', note 'Dinner', link to 'Test Trip', and submit.
    - expect: Panel closes.
  2. Click 'Log expense' again. Enter amount '75', category 'Other', note 'Museum', link to 'Test Trip', and submit.
    - expect: Panel closes.
  3. Navigate to /trips and click 'Details' on 'Test Trip'.
    - expect: The linked transactions list shows two transaction rows: 'Dinner' ($100) and 'Museum' ($75).
  4. Close the panel and inspect the trip card.
    - expect: The 'Discretionary' data point shows -$175.
    - expect: The 'Total' data point shows -$175.

#### 7.5. Editing a linked expense to remove the trip link removes it from trip details

**File:** `tests/trips/unlink-expense-from-trip.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click 'Log expense'. Enter amount '40', category 'Other', link to 'Test Trip', and submit.
    - expect: Panel closes.
  2. Navigate to /trips and confirm the 'Test Trip' details panel shows one linked transaction row for the $40 expense.
    - expect: One transaction row is visible.
  3. Click the $40 transaction row in the trip details panel to open the edit-expense form.
    - expect: The 'Edit expense' form opens (in-panel, within the trip details SlideUpPanel).
    - expect: The 'Linked Trip' field shows 'Test Trip'.
  4. Click the 'Linked Trip' filterable-select and choose the 'Clear selection' option to unlink the trip.
    - expect: The 'Linked Trip' field shows the empty/no-selection placeholder.
  5. Click 'Submit'.
    - expect: The form closes and the trip details base view is shown.
    - expect: The linked transactions list now shows the empty-state alert ('This trip has no linked transactions yet').
  6. Close the panel and verify the trip card.
    - expect: All four cost totals on the 'Test Trip' card show $0.00.

### 8. Active Trip Auto-Selection

**Seed:** `tests/seed.spec.ts`

#### 8.1. Creating a trip spanning today causes the Log Expense form to auto-select it

**File:** `tests/trips/active-trip-auto-select.spec.ts`

**Steps:**
  1. Navigate to /trips and click 'Add trip'.
    - expect: The 'New trip' panel opens.
  2. Type 'Current Trip' in the 'Trip name' input.
  3. Set the 'Start date' picker to today's date.
    - expect: Start date is today.
  4. Set the 'End date' picker to today's date.
    - expect: End date is today.
    - expect: The 'Submit' button is enabled.
  5. Click 'Submit'.
    - expect: 'Current Trip' card appears in the trips list.
  6. Navigate to /dashboard and click 'Log expense'.
    - expect: The 'New expense' SlideUpPanel opens.
    - expect: An info-variant alert notice is shown at the top of the form reading 'Your current trip, "Current Trip", has already been applied to this transaction.' (matching the tripNotice content key).
    - expect: The 'Linked Trip' filterable-select is pre-populated with 'Current Trip'.
  7. Click 'Cancel' to dismiss without submitting.
    - expect: The panel closes without creating a transaction.

#### 8.2. Seeded Test Trip (in the past) does not trigger the active-trip notice

**File:** `tests/trips/no-active-trip-notice-for-past-trip.spec.ts`

**Steps:**
  1. Navigate to /dashboard and click 'Log expense'.
    - expect: The 'New expense' panel opens.
    - expect: No active-trip info alert is shown at the top of the form (the seeded 'Test Trip' ended ~10 days ago, so it is not active).
    - expect: The 'Linked Trip' field shows the default no-selection placeholder (not pre-populated).
  2. Click 'Cancel'.
    - expect: The panel closes.
