# UI Plan — Design-doc features 1c / 1d / 1e-net-worth

Source design: `UX Improvements.dc.html` in the claude.ai design project (the visual specs are
transcribed below — this file is self-contained; you do not need the design doc to execute).

Three features, delivered as eight vertical slices:

1. **Dashboard (design 1c)** — the "Total spent" number gets month progress, a month-end
   projection, a pace-vs-last-month badge, and a daily-spend bar chart; the Discretionary and
   Recurring tiles get month-over-month deltas. Slices 1–4.
2. **Trends (design 1d)** — a new "Spending by category" module: per-category month total,
   vs-previous-month delta, 6-month sparkline, and share-of-total bar. Slices 5–6.
3. **Savings (design 1e, net-worth card only)** — a new net-worth summary tile: total net worth,
   YTD growth, and an allocation bar by account type. Slices 7–8.

All new UI is **net-new components** — do not rewrite existing components. Existing components are
only touched where a slice explicitly says "wire into page". Backend endpoints are added/extended
where a slice needs data the API doesn't serve yet.

---

## Ground rules (apply to every slice)

- **Architecture is contract-first oRPC.** Endpoint shape lives in `contract/src/*.contract.ts`
  (zod schemas), the api implements it in `api/src/modules/<domain>/` behind
  `authed.<domain>.<name>.handler(...)`, registers it in `api/src/orpc/router.ts`, and the ui
  consumes it via `orpc.<domain>.<name>.queryOptions()` in `ui/src/queryOptions/`.
- **API layering** (see `api/CLAUDE.md`): controller → service → repository, one direction only.
  Only repositories touch the DB, via `@lib/queryAsync` with `?`-bound params. snake_case row
  types stay inside the repository. `api/src/modules/trips/trips.*` is the canonical example.
- **No schema changes are needed anywhere in this plan** — every endpoint reads existing tables
  (`spend_transactions`, `recurring_transactions` + `recurring_spending`, `money_accounts` +
  `money_account_updates`). Do not touch `api/spendWatcherV1.sql`.
- **No decorative comments.** Comments only explain "why", never "what".
- **User-facing strings** go in `ui/src/Content/english.ts` under the page's section
  (`dashboard`, `trends`, `savings`) and are read with `createContentGetter('<section>')`.
- **Reuse existing UI primitives**: `ModuleContainer` (tile chrome, `elevation` prop), `Currency`
  (money formatting, `isGainLoss`), `SkeletonLoader` (loading states), `SpendingCategoryIcon` /
  `AccountCategoryIcon` + their `*IconMapper` files (category icons/colors),
  `useIsMobile()` from `Util/IsMobileContext`.
- **Gain/loss color semantics** (see `AvgSpentPerMonth.tsx` for the existing idiom): spending
  _increases_ render in `var(--token-color-semantic-loss)`, _decreases_ in
  `var(--token-color-semantic-gain)`. Caret icons come from `react-icons/fa`
  (`FaCaretUp`/`FaCaretDown`).
- **Dates**: ui `DbDate` strings are `yyyy-MM-dd`; `zMonthYearDate` is `yyyy-MM`. The dashboard
  always views the current month (`setToCurrentMonth()` on mount); Trends uses
  `useSelectedTimeFrame()` with `DateRangeType.MONTH | YEAR` and month/year steppers.
- **Tests**:
  - UI component tests: colocated `*.test.tsx` (vitest), run with
    `pnpm --filter @spend-watcher/ui run test:run`. Render/chrome checks belong here, not e2e.
  - API integration tests: `e2e/tests/api/*.spec.ts`, run with `pnpm test:api`
    (browser-less, uses `apiFixtures`; requires the podman machine to be running).
  - Browser e2e: `e2e/tests/**`, run with `pnpm test:e2e`.

### The loop

Every slice below is one iteration of this loop. Execute the steps in order; a step that doesn't
apply to the slice (e.g. no backend work) is skipped.

1. **Orient** — read the files listed in the slice's _Read first_ line, plus anything they import
   that you need to understand.
2. **Contract** — add or extend the contract in `contract/src/`, export any new schemas/types
   from `contract/src/index.ts`.
3. **API** — implement repository → service → controller in `api/src/modules/<domain>/`, register
   the procedure in `api/src/orpc/router.ts`.
4. **API tests** — add an integration spec under `e2e/tests/api/` covering the new/changed
   endpoint (happy path + the documented edge cases).
5. **UI data** — add a file in `ui/src/queryOptions/` (mirror the existing one-liner pattern, e.g.
   `yearlyAverageQueryOptions.ts`).
6. **UI component** — build the net-new component in its own directory with a CSS module,
   loading skeleton, and content keys added to `english.ts`.
7. **Wire into page** — the minimal edit to the page (and only the page) named by the slice.
8. **UI tests** — colocated `*.test.tsx` for the new component (loading state, empty/edge state,
   happy render).
9. **Verify** — all of:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit -p api/tsconfig.json`
   - `pnpm --filter @spend-watcher/ui run build` (type-checks the ui)
   - `pnpm --filter @spend-watcher/ui run test:run`
   - `pnpm test:api` if the slice touched the api
   - `pnpm test:e2e` if the slice changed page layout; update any specs the slice's
     _E2E impact_ line calls out. Fix regressions before moving on.
10. **Review gate** — confirm the slice's _Done when_ criteria, commit with a message describing
    the slice, and **stop for human review**. Do not start the next slice in the same commit.

Slices within a feature must run in order (2 depends on 1, etc.). Features are independent of
each other — Dashboard (1–4), Trends (5–6), Savings (7–8) can be reordered or interleaved at
review checkpoints.

---

## Feature 1 — Dashboard pace, projection & comparison (design 1c)

Design spec (1c): the dashboard's three summary tiles become one hero card + two small tiles.

- **Hero card** ("Total spent", elevation medium, full width): big loss-red total; a slim month
  progress bar labeled "Day 14 of 31" / "45% of October"; below it "On pace for $5,125 this
  month" with a pill badge "▼ 10% under September's pace" (gain-green when under, loss-red when
  over); on the right (desktop only) a "Daily spend — last 14 days" mini bar chart, today's bar
  highlighted, x-axis labels "Oct 1 … Today", and a spike annotation like
  "Big spike · Oct 8 — flights $412".
- **Discretionary total tile**: amount + pill badge "▲ 4% vs Sep".
- **Recurring total tile**: amount + muted text context line (design says "flat vs Sep · 3 bills
  due this week").

**Adaptations (deliberate, keep them):**

- "Bills due this week" is not modeled (recurring spends have no due dates). Substitute the
  existing `recurringSummary.spendsRequiringUpdatesCount` → "N awaiting update" (omit when 0).
- Pace comparison = previous month **through the same day-of-month** (clamped to the previous
  month's length, e.g. Mar 31 → Feb 28), so partial months compare like-for-like.
- Daily-spend bars use **discretionary transactions only** — recurring transactions carry a
  synthetic first-of-month date and would render as a fake day-1 spike.

### Slice 1 — Net-new dashboard tiles with month progress + projection (no backend)

_Read first_: `ui/src/Pages/Dashboard/Dashboard.tsx`, `SummaryTotals/SummaryTotals.tsx` (+ its
CSS module and test), `AvgSpentPerMonth/AvgSpentPerMonth.tsx`,
`ui/src/Hooks/useSpendingService/useSpendingDetailsService.ts`, `ui/src/Content/english.ts`
(dashboard section).

- New components under `ui/src/Pages/Dashboard/`:
  - `TotalSpentHero/TotalSpentHero.tsx` — reads `useSpendingDetailsService()`. Renders heading,
    `Currency` total (`-summary.total.amount`, `isGainLoss`), progress bar, and projection line.
    All math is client-side from `new Date()`: `dayOfMonth / daysInMonth` for the bar and labels;
    projection = `(total / dayOfMonth) * daysInMonth`, rendered via `Currency`. No badge, no
    chart yet (slices 2–3).
  - `DiscretionaryTotalTile/DiscretionaryTotalTile.tsx` and
    `RecurringTotalTile/RecurringTotalTile.tsx` — ports of the corresponding `SummaryTotals`
    tiles (same `ModuleContainer` + `Currency` + skeleton idiom), one tile per component so
    slices 2/4 can grow them independently.
- `Dashboard.tsx` replaces `<SummaryTotals />` with the three new components (desktop and
  mobile — on mobile stack them; hide nothing yet). **Do not modify `SummaryTotals`** — Trends
  still uses it.
- Content keys: reuse `totalSpent`/`discretionaryTotal`/`recurringTotal`; add keys for
  "Day {day} of {total}", "{pct}% of {month}", "On pace for {amount} this month".
- UI tests: progress/projection math at known dates (mock system time with `vi.setSystemTime`),
  loading skeletons, and that projection is hidden when the month has no spend.

_E2E impact_: dashboard layout changes. Check/update
`e2e/tests/spending/dashboard-widgets.spec.ts`, `dashboard-sparse-data.spec.ts`,
`dashboard-totals-update-after-add.spec.ts`, `delete-expense.spec.ts`,
`recurring-edit-monthly-amount.spec.ts` (they assert on "Total spent"/"Discretionary
total"/"Recurring total" — the labels survive but the DOM around them changes).
`e2e/tests/trends/summary-totals.spec.ts` must **not** need changes (Trends untouched).

_Done when_: dashboard shows the hero (total + progress + projection) and the two tiles with
identical amounts to before; Trends is pixel-identical; all verify commands green.

### Slice 2 — `spending.pace` endpoint + pace-vs-last-month badge

_Read first_: `contract/src/spending.contract.ts`, `contract/src/index.ts`,
`api/src/modules/spending/insights.{controller,service,repository}.ts` (closest pattern —
extend these files rather than creating a new module trio),
`e2e/tests/api/spending-details.spec.ts` (test fixtures/pattern).

- Contract — add to `spending.contract.ts` and register in `spendingContract`:

  ```ts
  const paceAmountsSchema = z.object({
    total: z.number(),
    discretionary: z.number(),
    recurring: z.number(),
  });

  export const paceContract = oc
    .route({ method: 'GET', path: '/spending/pace' })
    .input(z.object({ targetDate: z.iso.date() }))
    .output(
      z.object({
        monthToDate: paceAmountsSchema,
        previousMonthSameDay: paceAmountsSchema,
        previousMonthFull: paceAmountsSchema,
      }),
    );
  ```

  `targetDate` comes from the client so "today" is timezone-correct and tests are deterministic.
  Export a `SpendingPaceResponse` type from `contract/src/index.ts` like the other named
  response types.

- API — repository: one query (or two — discretionary + recurring, summed per window in the
  service) over the three date windows: month-start→targetDate, prev-month-start→same-day-clamped,
  full previous month. Follow the union pattern in `findYearlyMonthlyTotals`. Service owns the
  window math (date-fns; clamp with `min(dayOfMonth, daysInPreviousMonth)`). Controller:
  `authed.spending.pace.handler(...)`. Register `pace` in `router.ts`.
- API tests — seed known transactions across two months; assert the three windows, the same-day
  clamping edge (targetDate on the 31st), and zeroed amounts for a month with no data.
- UI — `spendingPaceQueryOptions.ts` (input: today as `DbDate`); `TotalSpentHero` adds the badge:
  `pctChange = (monthToDate.total − previousMonthSameDay.total) / previousMonthSameDay.total`,
  rendered as "▼ 10% under September's pace" / "▲ … over …" with gain/loss colors. Hide the badge
  when `previousMonthSameDay.total` is 0. Previous-month name via date-fns `format(subMonths(…))`.
- Content keys for the badge text; UI tests for under/over/hidden badge states.

_Done when_: hero shows a correct badge against seeded data; badge absent for a fresh user; all
verify commands green (`pnpm test:api` included).

### Slice 3 — Daily-spend bars in the hero

_Read first_: `ui/src/Pages/Trends/BarChartModule/BarChart.tsx` and
`ui/src/Components/charts/` (existing chart idioms), slice 2's pace files.

- Contract — extend `paceContract` output with:

  ```ts
  dailyTotals: z.array(z.object({ date: z.iso.date(), amount: z.number() })),
  largestRecentExpense: z
    .object({ date: z.iso.date(), amount: z.number(), note: z.string() })
    .nullable(),
  ```

  `dailyTotals` = one entry per day for the 14 days ending at `targetDate` (zero-fill missing
  days, in the service). `largestRecentExpense` = the single largest discretionary transaction in
  that window (`note` may be empty), `null` when the window has no transactions.

- API — repository adds a per-day discretionary totals query and a top-transaction query for the
  window; service zero-fills and assembles. Extend the existing api tests: window boundaries
  (transaction on day 15 excluded), zero-fill, tie/absence for `largestRecentExpense`.
- UI — net-new `ui/src/Pages/Dashboard/TotalSpentHero/DailySpendBars.tsx`: plain SVG bars (the
  design uses 14 rounded-corner rects), last bar (today) in an accent fill, others neutral;
  under-axis labels: window start date, spike annotation
  ("Big spike · {MMM d} — {note} {amount}", only when `largestRecentExpense` stands out — render
  it whenever non-null), "Today". Desktop only: render nothing when `useIsMobile()`.
- UI tests: bar count/heights from fixture data, spike label text, today-highlight, hidden on
  mobile.

_Done when_: hero matches the 1c layout on desktop (left: totals+pace, right: bars); mobile
unchanged from slice 2; all verify commands green.

### Slice 4 — MoM deltas on the Discretionary & Recurring tiles

_Read first_: slice 1's tile components, `ui/src/queryOptions/recurringSummaryQueryOptions.ts`,
`AvgSpentPerMonth.tsx` (badge idiom).

- No backend work — reuses slice 2's `spending.pace` data (`discretionary` / `recurring` fields)
  and the existing `recurringSummary` query.
- `DiscretionaryTotalTile` — badge "▲/▼ {pct}% vs {prevMonth}" from
  `monthToDate.discretionary` vs `previousMonthSameDay.discretionary`; hidden when the base is 0.
- `RecurringTotalTile` — muted context line: "flat vs {prevMonth}" when |pct| < 2%, else the
  ▲/▼ pct; append "· {n} awaiting update" from `recurringSummary.spendsRequiringUpdatesCount`
  when n > 0.
- Content keys + UI tests for each badge/context state.

_E2E impact_: re-run the dashboard specs from slice 1's list.

_Done when_: both tiles show deltas per the design; feature 1 fully matches the adapted 1c spec;
all verify commands green.

---

## Feature 2 — Trends "Spending by category" module (design 1d)

Design spec (1d): a card titled **"Spending by category"** with one row per category:

| Column         | Content                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| Category       | category icon + label                                                          |
| {Month}        | loss-red total for the selected month                                          |
| vs {PrevMonth} | ▲/▼ percent, loss-red when rising / gain-green when falling; "—" when no basis |
| Last 6 months  | sparkline (polyline) in the category's color                                   |
| Share of total | slim horizontal bar in the category color + right-aligned percent              |

Rows sort by month total descending. The design shows the top rows with a
"+ 4 more categories" footer; render all categories instead (the page already scrolls) unless
review feedback says to collapse.

### Slice 5 — Module v1: totals + share of total (no backend)

_Read first_: `ui/src/Pages/Trends/Trends.tsx`, `ui/src/Components/TotalsTable/TotalsTable.tsx`
(+ test), `contract/src/spendingDetails.ts` (`categoryDetailsList` shape),
`ui/src/Components/Shared/Icons/spendCategoryIconMapper.tsx` (category colors),
`english.ts` (trends section).

- New `ui/src/Pages/Trends/SpendingByCategoryModule/SpendingByCategoryModule.tsx` — reads
  `useSpendingDetailsService()` (already range-aware via `SelectedTimeFrame`). Renders inside
  `ModuleContainer` with heading "Spending by category": rows =
  `spendCategoryOverview.categoryDetailsList` sorted by `combinedTotals.amount` desc, columns
  Category / total (`Currency`, `isGainLoss`, negative) / share bar +
  `combinedTotals.percentageOfTotalAmount`%. Share-bar fill uses the category color from the
  icon mapper (add a color export there if the color isn't separately importable — additive
  change only). Skeleton rows while loading; empty state when there are no transactions.
- Delta and sparkline columns come in slice 6 — leave them out entirely here.
- Wire into `Trends.tsx` **above** `TotalsTable` (both stay; the old table remains until a
  human decides to retire it).
- UI tests: sorting, share percentages, empty state, loading state.

_E2E impact_: Trends layout gains a module; check `e2e/tests/trends/*` for strict-mode locator
collisions (the new module repeats category names and currency amounts that
`summary-totals.spec.ts` / bar-chart specs may match ambiguously).

_Done when_: Trends shows the module with correct totals/shares for the selected month AND when
stepping months / switching to Yearly (it simply reflects the selected range); all verify
commands green.

### Slice 6 — `spending.categoryTrends` endpoint: deltas + sparklines

_Read first_: slice 5's module, `contract/src/spending.contract.ts`,
`api/src/modules/spending/insights.*` (extend these files), `zMonthYearDate` in
`contract/src/shared.ts`.

- Contract:

  ```ts
  export const categoryTrendsContract = oc
    .route({ method: 'GET', path: '/spending/category-trends' })
    .input(z.object({ targetMonth: zMonthYearDate }))
    .output(
      z.object({
        months: z.array(zMonthYearDate),
        categories: z.array(
          z.object({
            category: zSpendingCategory,
            monthlyTotals: z.array(z.number()),
            percentChange: z.number().nullable(),
          }),
        ),
      }),
    );
  ```

  `months` = the 6 calendar months ending at `targetMonth`, oldest first; `monthlyTotals` aligns
  with it (zero-filled). Totals combine discretionary + recurring per category (union query, like
  `findYearlyMonthlyTotals`, grouped by category and month). `percentChange` =
  `(latest − previous) / previous`, `null` when previous is 0. Categories with all-zero totals
  across the window are omitted.

- **Documented caveat (accept it)**: when `targetMonth` is the current month the delta compares a
  partial month against a full one. The row totals in the module still come from the details
  query; this endpoint only feeds the delta + sparkline columns.
- API tests: 6-month window/zero-fill, category omission, `percentChange` null-vs-value, and
  month alignment across a year boundary (e.g. targetMonth 2026-02 → window starts 2025-09).
- UI — `categoryTrendsQueryOptions.ts` keyed by `targetMonth` (derive from
  `useSelectedTimeFrame().startDate`). Net-new `ui/src/Components/charts/Sparkline/Sparkline.tsx`
  (pure SVG polyline, props: `values`, `stroke`, sized ~110×26 like the design). Module adds the
  "vs {PrevMonth}" and "Last 6 months" columns, joined to rows by category; a category present in
  details but absent from trends data (or with `percentChange: null`) renders "—" and no
  sparkline. **Both columns render only when `dateRangeType === DateRangeType.MONTH`** — the
  Yearly view keeps the slice 5 layout (year-granularity trends are a possible follow-up, out of
  scope).
- UI tests: column presence per range type, delta colors (rising red / falling green), "—" case,
  sparkline point mapping.

_Done when_: monthly Trends shows all five design columns and stepping months moves the whole
window; Yearly view shows the v1 layout; all verify commands green.

---

## Feature 3 — Savings net-worth summary tile (design 1e, top card only)

Design spec (net-worth card): heading **"Net worth"**; large total (plain text-dark, not
gain/loss); right-aligned "+$7,702" in gain-green over a muted "YTD growth" label; a full-width
stacked allocation bar (one segment per account type, design order: Investing / Savings /
Checking / Bonds); a legend line per type: swatch + "Investing $22,120 · 45%".

Only this card is in scope from 1e — the inline balance-update row is a separate feature.

### Slice 7 — `NetWorthSummaryTile` v1: total + allocation (no backend)

_Read first_: `ui/src/Pages/Savings/Savings.tsx`, `NetWorthTile/NetWorthTile.tsx` (existing tile
— the name is taken; it stays), `TotalsByAccountType/TotalsByAccountType.tsx`,
`ui/src/queryOptions/accountsSummaryQueryOptions.ts`, `contract/src/accounts.contract.ts`
(summary output), `accountCategoryIconMapper.tsx` (type colors).

- New `ui/src/Pages/Savings/NetWorthSummaryTile/NetWorthSummaryTile.tsx` — reads the existing
  `accountsSummaryQueryOptions`. Total = `totalEquity` (`Currency`, not gain/loss). Allocation
  bar + legend from `accountTotalsByType`: segment width = share of `totalEquity`, ordered
  descending by amount; colors from the account-category mapper (add a color export if needed —
  additive). Skip zero/absent types; if `totalEquity <= 0` render the total and an empty-state
  line instead of the bar. No YTD badge yet.
- Wire into `Savings.tsx` as the first tile (above the existing `NetWorthTile`). To avoid two
  adjacent "Net worth" headings, this tile owns the heading "Net worth"; leave the existing
  chart tile's loading-state heading alone (rename decisions belong to a human).
- Content keys under `savings`; UI tests: segment math, ordering, zero-balance type skipped,
  negative/zero equity state, loading skeleton.

_E2E impact_: Savings layout gains a tile; check `e2e/tests/accounts/*` and `pages.spec.ts` for
locator collisions on "Net worth".

_Done when_: Savings shows the card with total + allocation matching `accounts/summary` data;
all verify commands green.

### Slice 8 — YTD growth on the accounts summary

_Read first_: `api/src/modules/accounts/accounts.{controller,service,repository}.ts`,
`e2e/tests/api/accounts.spec.ts`, slice 7's tile.

- Contract — extend `accountsSummaryContract` output (additive):
  `yearStartNetWorth: z.number().nullable()`.
- API — repository: for each of the user's **active** accounts take its most recent
  `money_account_updates` row dated **before Jan 1 of the current year**, sum the amounts
  (one query — e.g. join on a `MAX(date)`-per-account subquery with `date < ?`). Service passes
  `startOfYear(new Date())` and returns `null` when no account has pre-year history (accounts
  created this year contribute 0 to the year-start sum, so their balances count as YTD growth —
  intended: net-worth change, not investment return).
- API tests — extend the accounts spec: multi-update accounts pick the latest pre-year value,
  account added this year, and `null` for a fresh user.
- UI — tile shows `ytd = totalEquity − yearStartNetWorth` as "+$X"/"−$X" (gain/loss colors) over
  the "YTD growth" label; badge hidden when `yearStartNetWorth` is `null`.
- UI tests: positive, negative, and hidden badge states.

_Done when_: the tile matches the full design card; all verify commands green
(`pnpm test:api` included).

---

# Phase 2 — Trends insight tiles (design 4b) + month comparison (3b) + category ledger (3c)

All seven additions are **standalone tiles on the Trends page**, added without deleting or
modifying any existing widget. Isolation is the ruling constraint: each tile lives in its own
directory under `ui/src/Pages/Trends/`, is wired into `Trends.tsx` with a single line, and lands
in its own commit — backing one out means deleting its directory, its content keys, and that line.
Backend work is additive only (new contract entries, new insights functions, new router lines).

**Shared decisions (apply to every Phase-2 tile):**

- Tiles render in **MONTH mode only** (`dateRangeType === DateRangeType.MONTH`) — same rule the
  slice-6 trend columns follow. In yearly mode they render nothing.
- Tiles honor the selected month (`useSelectedTimeFrame`), not just "now": date-parameterized
  queries use the range's `endDate` as `targetDate`.
- Pace and rhythm math is **discretionary-only** (the 4b mock's default toggle is
  "Discretionary"; recurring lands on synthetic first-of-month dates). The
  Discretionary/Recurring/Everything toggle from the mock is out of scope.
- The mock's CTA links ("See your pace", "Open the ledger", …) navigate to separate views that
  don't exist here — the tiles are standalone, so CTAs are omitted.
- Each tile shows a friendly empty-state line when it has no basis (fresh user), never a crash.
- Existing endpoints are reused wherever the data already exists: `spending/details` (current
  range, already fetched on Trends) and `spending/category-trends` (already fetched by the
  slice-6 module; same query key = cache hit). Only two new endpoints are needed:
  `spending/typical-pace` (slice 12) and `spending/rhythm` (slice 13).

The insight tiles (slices 9–13) share a CSS grid wrapper: slice 9 introduces
`TrendsInsightsGrid` (a thin layout component that composes whichever insight tiles exist) so
later slices only add one import + one child line there instead of touching `Trends.tsx` again.

### Slice 9 — Insights grid + Months tile (client-only)

Design (4b "Months" card): uppercase MONTHS label; headline "May was your priciest month —
$357 above average" (delta in loss red); six mini bars — priciest month in loss red, the
current/selected month in primary green, others neutral.

- `TrendsInsightsGrid/TrendsInsightsGrid.tsx` — CSS grid (3 columns desktop, 1 column mobile),
  renders nothing in yearly mode. Wire into `Trends.tsx` directly under the banners.
- `MonthsInsightTile/MonthsInsightTile.tsx` — data: `categoryTrends` (sum `monthlyTotals` across
  categories per month = six month totals). Priciest month, average of the six, delta headline.
  Empty state when every month is zero. Headline month names from the `months` axis.

### Slice 10 — Breakdown tile (client-only)

Design (4b "Breakdown"): headline "Groceries and restaurants are half of July so far"; a
horizontal color band, one segment per top-4 category + a neutral "everything else" segment.

- `BreakdownInsightTile/BreakdownInsightTile.tsx` — data: existing details query
  (`categoryDetailsList` combined totals + percentages). Headline: top two categories and their
  combined rounded share of the selected month. Band segments use `spendCategoryColorMapper`.

### Slice 11 — Categories tile (client-only)

Design (4b "Categories"): headline "Entertainment is up 35% vs your 3-month average" (loss red
when up, gain green when down); the category's icon chip + 6-month sparkline in its color.

- `CategoriesInsightTile/CategoriesInsightTile.tsx` — data: `categoryTrends`. Biggest mover =
  max |current − avg(prev 3 months)| / avg among categories with a non-zero 3-month average.
  Reuses `Sparkline` + `SpendingCategoryIcon`. Empty state when no category has a basis.

### Slice 12 — Pace tile (`spending/typical-pace` endpoint)

Design (4b "Pace", semantics from 3a): headline "You're $214 under your usual pace this month";
subline "Projected $2,610 vs a typical $2,890"; a chart with the actual cumulative line ending in
a dot vs a dashed "typical" trajectory.

- Contract (additive): `GET /spending/typical-pace`, input `{ targetDate }`, output
  `{ cumulativeByDay: [{date, amount}], typicalMonthTotal: number|null,
  typicalThroughSameDay: number|null, baselineMonthCount: number }`. Baseline = the six full
  months before targetDate's month, using only months that have any discretionary spend;
  typicalThroughSameDay clamps day-of-month per month length. Nulls when the baseline is empty.
- API: new service function in `insights.service.ts` reusing the existing
  `findDiscretionaryDailyTotals` repo function over a 7-month window (no repo changes);
  controller + router lines. API tests: fixed-date seeds pinning baseline averaging, the
  same-day clamp, partial-baseline (only some months have data), and the no-history nulls.
- UI: `PaceInsightTile/PaceInsightTile.tsx` (spans 2 grid columns). Delta headline
  under/over in green/red; projection = client-side `(monthToDate / day) * daysInMonth`;
  SVG: solid cumulative polyline + endpoint dot, dashed straight typical trajectory to
  `typicalMonthTotal`. Empty state (no baseline): show month-to-date line only with a
  "not enough history" subline.

### Slice 13 — Rhythm tile (`spending/rhythm` endpoint)

Design (4b "Rhythm", semantics from 3e): headline "Jul 4 ran 3.8× your daily median"; a 7-cell
strip for the last 7 days — unusual days outlined loss-red with the day number, today outlined
primary-green.

- Contract (additive): `GET /spending/rhythm`, input `{ targetDate }`, output
  `{ dailyMedian: number|null, days: [{date, amount}] }` where `days` covers the 1st of
  targetDate's month through targetDate (zero-filled) and `dailyMedian` is the median of
  non-zero discretionary days in the 90 days ending at targetDate.
- API: service reuses `findDiscretionaryDailyTotals` (90-day window + month window); no repo
  changes. Tests: median math (odd/even counts, zero days excluded), zero-fill, null median.
- UI: `RhythmInsightTile/RhythmInsightTile.tsx` — flag threshold: amount ≥ 3× median. Headline
  names the month's biggest-ratio flagged day; falls back to an even-rhythm line when nothing
  is flagged or the median is null. Strip = last 7 entries of `days`.

### Slice 14 — Spending by month tile (design 3b, client-only)

Master-detail: left = six stacked bars (top-4 categories by window total + "everything else"),
dashed 6-month average line, month/total labels, selected bar highlighted, legend; right panel =
selected month (default: priciest): total, "±$X vs your average" badge, "What drove it" (top 3
discretionary transactions by amount, note as label), "vs your average month" per-category bars
with an average tick and ±% (vs the average of the other five months).

- `SpendingByMonthTile/SpendingByMonthTile.tsx` — stacks/averages from `categoryTrends`;
  the right panel fetches `spending/details` for the selected month's full range (react-query
  caches per month). Clicking a bar re-selects. The mock's projection overlay on the current
  month and the "See all N transactions" link are out of scope.

### Slice 15 — Category ledger tile (design 3c, client-only)

Master-detail: left = categories sorted by signed change vs their 3-month average (risers first,
no-basis last) — icon chip, name, "avg $X/mo", sparkline, current-month total, ±% badge; right
panel = selected category (default: top of the list): icon + name + transaction count, total,
"±% vs your 3-mo average", 6-month bar chart with dashed average line, and the selected month's
discretionary transactions newest-first (note as label, day-of-month date).

- `CategoryLedgerTile/CategoryLedgerTile.tsx` — list/sparklines/averages from `categoryTrends`;
  transactions from the existing details query (`transactionDictionary` filtered to the selected
  category, discretionary only — the mock's "Recurring bills are a separate tab" note becomes a
  static footnote). The mock's "Log expense to X" button is out of scope.

**Verification per slice** — same loop as Phase 1: lint, api tsc, ui build, ui tests,
`pnpm test:api` when the api changed, Trends e2e (`e2e/tests/trends`) for every slice (layout
grew), full e2e before the final commit. Commit per slice with explicit `git add` paths.
