/* global React, window */
const { useMemo: useMemoDash } = React;

const ACCOUNTS = [
  { id: 'a1', name: 'Chase checking',     category: 'CHECKING',  value: 4823,  updated: 'Oct 2026' },
  { id: 'a2', name: 'Ally savings',       category: 'SAVINGS',   value: 18450, updated: 'Oct 2026' },
  { id: 'a3', name: 'Fidelity brokerage', category: 'INVESTING', value: 22120, updated: 'Sep 2026', needsUpdate: true },
  { id: 'a4', name: 'Treasury I-bonds',   category: 'BONDS',     value: 3509,  updated: 'Oct 2026' },
];

function useMonthSpend() {
  return useMemoDash(() => {
    const d = window.DASH_DATA, cats = window.CATEGORIES, idx = 9; // October
    const fixed = new Set(cats.filter(c => c.type === 'fixed').map(c => c.id));
    const rows = cats.map(c => ({ ...c, amount: d.byCategoryMonthly[c.id][idx], fixed: fixed.has(c.id) }));
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const recurring = rows.filter(r => r.fixed).reduce((s, r) => s + r.amount, 0);
    const discretionary = total - recurring;
    const discRows = rows.filter(r => !r.fixed && r.amount > 0).sort((a, b) => b.amount - a.amount);
    const top = discRows.slice(0, 4);
    const remaining = discRows.slice(4).reduce((s, r) => s + r.amount, 0);
    return { total, recurring, discretionary, top, remaining };
  }, []);
}

// ---------- Summary totals ----------
function SummaryTotals() {
  const { total, discretionary, recurring } = useMonthSpend();
  const item = (heading, amount, elevation) => (
    <window.ModuleContainer heading={heading} elevation={elevation} style={{ flex: 1, minWidth: 150 }}>
      <window.Currency amount={-amount} isGainLoss
        style={{ fontSize: 24, fontWeight: 300 }} />
    </window.ModuleContainer>
  );
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', width: '100%' }}>
      {item('Total spent', total, 'medium')}
      {item('Discretionary total', discretionary, 'low')}
      {item('Recurring total', recurring, 'low')}
    </div>
  );
}

// ---------- Top discretionary categories ----------
function TopDiscretionaryCategories({ onSelect }) {
  const { discretionary, top, remaining } = useMonthSpend();
  const pct = (a) => (a / discretionary) * 100;
  const labelFor = (id) => window.CATEGORIES.find(c => c.id === id).label;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', flexBasis: '100%', borderRadius: 16, overflow: 'clip', height: 8 }}>
        {top.map(r => (
          <div key={r.id} style={{ width: `${pct(r.amount)}%`, height: 8, background: window.SPEND_CATEGORY[r.id].color }} />
        ))}
        <div style={{ flex: 1, height: 8, background: 'var(--theme-color-neutral-500)' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 16, rowGap: 14, width: '100%', fontSize: 14 }}>
        {top.map(r => (
          <button key={r.id} onClick={() => onSelect && onSelect(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            <window.CategoryIcon category={r.id} size={36} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--token-color-text-standard)' }}>{labelFor(r.id)}</div>
              <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
                <window.Currency amount={-r.amount} isGainLoss /> · {pct(r.amount).toFixed(0)}%
              </div>
            </div>
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--theme-color-neutral-500)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--token-color-text-standard)' }}>Remaining total</div>
            <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
              <window.Currency amount={-remaining} isGainLoss />
            </div>
          </div>
        </div>
      </div>
      <window.CustomButton variant="secondary" style={{ marginLeft: 'auto', padding: '4px 16px', fontSize: 14, borderRadius: 8 }}>See more</window.CustomButton>
    </div>
  );
}

// ---------- Recent transactions ----------
function RecentTransactions({ onSelect }) {
  const txns = window.DASH_DATA.recentTransactions.filter(t => !t.isAccount).slice(0, 6);
  const groups = useMemoDash(() => {
    const g = {};
    txns.forEach(t => { (g[t.date] = g[t.date] || []).push(t); });
    return g;
  }, []);
  const catLabel = (id) => {
    const found = window.CATEGORIES.find(c => c.id === id);
    if (found) return found.label;
    const extra = { FUEL: 'Fuel' };
    return extra[id] || id.charAt(0) + id.slice(1).toLowerCase();
  };
  return (
    <window.ModuleContainer heading="Recent transactions" elevation="low">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(groups).map(([date, list]) => {
          const dayTotal = list.reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, margin: '4px 0 8px', color: 'var(--token-color-text-standard)' }}>
                {date === 'Oct 14' ? 'Oct 14th - Today' : date}
                <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', fontWeight: 400, whiteSpace: 'nowrap' }}>
                  (<window.Currency amount={dayTotal} isGainLoss />)
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {list.map(t => (
                  <window.InteractiveRow key={t.id}
                    icon={<window.CategoryIcon category={t.category} size={36} />}
                    primaryLabel={catLabel(t.category)}
                    primaryDataPoint={<window.Currency amount={t.amount} isGainLoss />}
                    secondaryLabel={t.name}
                    onClick={() => onSelect && onSelect(t)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </window.ModuleContainer>
  );
}

// ---------- Accounts list ----------
function AccountsList() {
  const total = ACCOUNTS.reduce((s, a) => s + a.value, 0);
  return (
    <window.ModuleContainer heading="Your accounts" elevation="low">
      <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>
        {window.formatCurrency(total)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ACCOUNTS.map(a => (
          <window.InteractiveRow key={a.id}
            icon={<window.CategoryIcon category={a.category} size={36} account />}
            primaryLabel={a.name}
            primaryDataPoint={<window.Currency amount={a.value} />}
            secondaryLabel={window.ACCOUNT_CATEGORY[a.category].label}
            secondaryDataPoint={`As of ${a.updated}`}
            callToActionText={a.needsUpdate ? 'Fidelity brokerage requires an update' : ''} />
        ))}
      </div>
    </window.ModuleContainer>
  );
}

// ---------- Page ----------
function DashboardPage({ onLogExpense, onSelectTxn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 8px' }}>October overview</h1>
      <window.AlertMessage variant="info" title="1 account requires an update for this month" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ flexGrow: 1, flexShrink: 0, minWidth: 360, maxWidth: 720, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 }}>
          <SummaryTotals />
          <window.ModuleContainer heading="Top discretionary categories" elevation="low">
            <TopDiscretionaryCategories onSelect={onSelectTxn} />
          </window.ModuleContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 5, flexGrow: 1, maxWidth: 360 }}>
          <window.CustomButton variant="primary" layout="full-width" onClick={onLogExpense}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px', fontWeight: 600 }}>
            <window.Icon name="plus" size={18} color="#fff" /> Log expense
          </window.CustomButton>
          <RecentTransactions onSelect={onSelectTxn} />
          <AccountsList />
          <window.CustomButton variant="secondary" layout="full-width"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <window.Icon name="plus" size={16} color="#fff" /> Add account
          </window.CustomButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage, ACCOUNTS, useMonthSpend });
