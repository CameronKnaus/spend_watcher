/* global window */
// SpendWatcher annual fixture. All values invented.
// Year is 2026, viewing as of October 14, 2026 (in-app "today").

(function () {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const CATEGORIES = [
    { id: 'HOUSING',        label: 'Housing',         color: '#577590', glyph: '⌂',  type: 'fixed' },
    { id: 'GROCERIES',      label: 'Groceries',       color: '#82aa46', glyph: '🛒' },
    { id: 'RESTAURANTS',    label: 'Restaurants',     color: '#ff8442', glyph: '🍴' },
    { id: 'TRANSPORTATION', label: 'Transport',       color: '#e5ad04', glyph: '🚍' },
    { id: 'ENTERTAINMENT',  label: 'Entertainment',   color: '#de2682', glyph: '★' },
    { id: 'UTILITIES',      label: 'Utilities',       color: '#2ba1d4', glyph: '⌬', type: 'fixed' },
    { id: 'HEALTH',         label: 'Health',          color: '#a30015', glyph: '+' },
    { id: 'CLOTHING',       label: 'Clothing',        color: '#cebe79', glyph: '👕' },
    { id: 'TRAVEL',         label: 'Travel',          color: '#49c165', glyph: '✈' },
    { id: 'OTHER',          label: 'Other',           color: '#776871', glyph: '•' },
  ];

  // Monthly spend by category — 10 cats × 12 months. October is current month.
  // Some categories spike seasonally (Travel summer, Clothing fall, Health Q1).
  const byCategoryMonthly = {
    HOUSING:        [1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850],
    GROCERIES:      [ 420, 392, 468, 441, 504, 478, 522, 488, 460, 502, 510, 540],
    RESTAURANTS:    [ 218, 198, 256, 278, 312, 340, 392, 360, 280, 326, 300, 410],
    TRANSPORTATION: [ 142, 138, 162, 155, 178, 188, 224, 210, 168, 154, 160, 180],
    ENTERTAINMENT:  [ 102,  88, 134, 156, 188, 210, 240, 198, 128, 168, 180, 260],
    UTILITIES:      [ 198, 212, 180, 158, 142, 168, 186, 192, 174, 168, 184, 220],
    HEALTH:         [ 320,  84,  62,  48,  76,  92,  68,  84,  58,  72,  90, 120],
    CLOTHING:       [  48,  62,  88, 102,  78,  64,  92, 108, 220, 180, 142, 198],
    TRAVEL:         [   0,   0, 218,   0, 412,   0,1840, 304,   0, 220,   0, 980],
    OTHER:          [  92,  78,  88, 102,  96, 110,  88,  92, 102, 118, 104, 132],
  };

  // Monthly totals (computed) and discretionary vs recurring split
  const monthlyTotals = MONTHS.map((_, i) =>
    Object.values(byCategoryMonthly).reduce((s, arr) => s + arr[i], 0)
  );
  const recurringPerMonth = MONTHS.map((_, i) =>
    byCategoryMonthly.HOUSING[i] + byCategoryMonthly.UTILITIES[i]
  );
  const discretionaryPerMonth = MONTHS.map((_, i) => monthlyTotals[i] - recurringPerMonth[i]);

  // Income (semi-monthly paycheck + the odd bonus)
  const incomePerMonth =     [5200,5200,5400,5200,5200,5800,5200,5200,5200,5200,5200,7100];
  const savingsPerMonth = incomePerMonth.map((inc, i) => inc - monthlyTotals[i]);

  // Net worth weekly series, Jan 1 → Oct 14 (~41 weeks).
  // Builds smoothly upward with a couple of dips (market drawdowns).
  const netWorthWeekly = (() => {
    const start = 41200;
    const series = [];
    let v = start;
    const drift = 240;
    const noise = (i) => ([-180, 120, -60, 90, 220, -310, 80, 140, -50, 60][i % 10]);
    for (let i = 0; i < 41; i++) {
      v += drift + noise(i);
      // small market dip mid-July
      if (i === 26 || i === 27) v -= 480;
      series.push(Math.round(v));
    }
    return series;
  })();

  // Account balances over time, monthly to October
  const accountBalances = {
    CHECKING:  [3920,4010,4180,4220,4310,4480,4540,4620,4740,4823],
    SAVINGS:   [14820,15240,15680,16080,16520,16980,17320,17680,18020,18450],
    INVESTING: [18120,18540,19120,19680,20220,20640,20480,21080,21640,22120],
    BONDS:     [ 3200, 3220, 3250, 3280, 3320, 3360, 3400, 3440, 3480, 3509],
  };

  // Calendar heatmap data: 365 days, Jan 1 → Dec 31 (current year).
  // Each entry: { d: 'YYYY-MM-DD', spent: number, count: number }
  // We synthesize: roughly 0–3 transactions per day, weekend higher restaurants/entertainment,
  // start-of-month rent on the 1st.
  const calendar = (() => {
    const days = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    const date = new Date(2026, 0, 1);
    for (let i = 0; i < 365; i++) {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i);
      const dow = d.getDay();
      const dom = d.getDate();
      let s = 0;
      const r = seed(i);
      if (dom === 1) s += 1850;                   // rent
      if (dom === 15) s += 110 + 220 * seed(i+3); // utilities
      // base discretionary
      s += 18 + 80 * r;
      // weekend bump
      if (dow === 0 || dow === 6) s += 30 + 90 * seed(i+7);
      // sometimes a big day
      if (seed(i+11) > 0.92) s += 220 + 320 * seed(i+13);
      // suppress future dates after Oct 14
      const cutoff = new Date(2026, 9, 14);
      if (d > cutoff) s = 0;
      days.push({ d: d.toISOString().slice(0, 10), v: Math.round(s), dow, month: d.getMonth() });
    }
    return days;
  })();

  // Previous-year comparison (for slope chart)
  const lastYearByCategory = {
    HOUSING: 1780*12,    GROCERIES: 5640,  RESTAURANTS: 2480,
    TRANSPORTATION: 1820,ENTERTAINMENT: 1620, UTILITIES: 2080,
    HEALTH: 980,         CLOTHING: 1180,    TRAVEL: 2900,        OTHER: 1080,
  };
  const ytdByCategory = Object.fromEntries(
    Object.entries(byCategoryMonthly).map(([k, arr]) => [k, arr.slice(0, 10).reduce((a,b)=>a+b,0)])
  );

  // Budgets per category (monthly)
  const budgets = {
    HOUSING: 1850, GROCERIES: 500, RESTAURANTS: 300, TRANSPORTATION: 180,
    ENTERTAINMENT: 175, UTILITIES: 200, HEALTH: 100, CLOTHING: 120,
    TRAVEL: 350, OTHER: 100,
  };

  // Recent transactions
  const recentTransactions = [
    { id: 1, name: "Stella's Kitchen",  date: 'Oct 14', amount: -48.20,  category: 'RESTAURANTS' },
    { id: 2, name: 'Whole Foods',       date: 'Oct 12', amount: -112.40, category: 'GROCERIES' },
    { id: 3, name: 'Chase · Payday',    date: 'Oct 10', amount: 2600.00, category: 'CHECKING', isAccount: true },
    { id: 4, name: 'Shell',             date: 'Oct 08', amount: -42.18,  category: 'FUEL' },
    { id: 5, name: 'A24 Cinema',        date: 'Oct 06', amount: -28.00,  category: 'ENTERTAINMENT' },
    { id: 6, name: 'Trader Joe\'s',     date: 'Oct 04', amount: -68.91,  category: 'GROCERIES' },
    { id: 7, name: 'PG&E',              date: 'Oct 03', amount: -148.00, category: 'UTILITIES' },
    { id: 8, name: 'Rent · Landlord',   date: 'Oct 01', amount: -1850.00,category: 'HOUSING' },
  ];

  window.CATEGORIES = CATEGORIES;
  window.MONTHS = MONTHS;
  window.DASH_DATA = {
    asOf: 'October 14, 2026',
    today: new Date(2026, 9, 14),
    byCategoryMonthly,
    monthlyTotals,
    recurringPerMonth,
    discretionaryPerMonth,
    incomePerMonth,
    savingsPerMonth,
    netWorthWeekly,
    accountBalances,
    calendar,
    lastYearByCategory,
    ytdByCategory,
    budgets,
    recentTransactions,
  };
})();
