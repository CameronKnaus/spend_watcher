/* global React, window */

function SavingsPage() {
  const accounts = window.ACCOUNTS;
  const netWorth = accounts.reduce((s, a) => s + a.value, 0);
  const byType = accounts; // one account per type in this fixture
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 8px' }}>Savings</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <window.ModuleContainer heading="Net worth" elevation="medium" style={{ flex: 2, minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 48, fontWeight: 300, fontVariantNumeric: 'tabular-nums' }}>{window.formatCurrency(netWorth, false, 0)}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'var(--token-color-semantic-gain)', fontWeight: 600 }}>+{window.formatCurrency(7702, false, 0)}</div>
              <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>YTD growth</div>
            </div>
          </div>
          <NetWorthSparkline />
        </window.ModuleContainer>
        <window.ModuleContainer heading="Accounts total" elevation="low" style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 4 }}>{window.formatCurrency(netWorth)}</div>
          <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>{accounts.length} tracked accounts</div>
        </window.ModuleContainer>
      </div>
      <window.ModuleContainer heading="Totals by account type" elevation="low">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          {byType.map(a => (
            <window.InteractiveRow key={a.id}
              icon={<window.CategoryIcon category={a.category} size={36} account />}
              primaryLabel={window.ACCOUNT_CATEGORY[a.category].label}
              primaryDataPoint={<window.Currency amount={a.value} />}
              secondaryLabel={a.name}
              secondaryDataPoint={`${((a.value / netWorth) * 100).toFixed(0)}% of net worth`} />
          ))}
        </div>
      </window.ModuleContainer>
    </div>
  );
}

function NetWorthSparkline() {
  const vals = window.DASH_DATA.netWorthWeekly;
  const w = 100, h = 40, min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 56, marginTop: 16, display: 'block' }}>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="var(--theme-color-primary-500)" opacity=".12" />
      <path d={d} fill="none" stroke="var(--theme-color-primary-500)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

Object.assign(window, { SavingsPage });
