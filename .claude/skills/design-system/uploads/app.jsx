/* global React, ReactDOM, window */
const { useState, useMemo } = React;

function Header({ range, setRange, month, setMonth }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px', borderBottom: '1px solid var(--theme-color-neutral-700)',
      background: 'var(--token-color-background-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="assets/spendwatcher-logo.png" alt="SpendWatcher" width="36" height="36" style={{ borderRadius: 8 }}/>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>Spending insights</h1>
          <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
            As of {window.DASH_DATA.asOf} · all amounts USD
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>Range</span>
        <window.Segmented
          value={range}
          onChange={setRange}
          options={['Month', '3M', 'YTD', '1Y', 'All']}
        />
        <div style={{ width: 1, height: 24, background: 'var(--theme-color-neutral-600)' }}/>
        <button style={{
          padding: '8px 14px', borderRadius: 'var(--radius-md)', border: 'none',
          background: 'var(--token-cta-background-color)', color: 'var(--token-cta-text-color)',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>+ Log expense</button>
      </div>
    </header>
  );
}

function KPIRow() {
  const d = window.DASH_DATA;
  const totalYTD = d.monthlyTotals.slice(0, 10).reduce((a,b) => a+b, 0);
  const avg = totalYTD / 10;
  const thisMonth = d.monthlyTotals[9];
  const lastMonth = d.monthlyTotals[8];
  const incomeYTD = d.incomePerMonth.slice(0, 10).reduce((a,b) => a+b, 0);
  const savedYTD = incomeYTD - totalYTD;
  const rate = savedYTD / incomeYTD;
  const netWorth = Object.values(d.accountBalances).reduce((s, arr) => s + arr.at(-1), 0);
  const netWorthStart = Object.values(d.accountBalances).reduce((s, arr) => s + arr[0], 0);
  const nwDelta = netWorth - netWorthStart;

  const monthSpendDelta = (thisMonth - lastMonth) / lastMonth * 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <window.KPI
        label="Spent · This month"
        value={window.fmtUSD(thisMonth, { compact: true, fractionDigits: 0 })}
        delta={monthSpendDelta}
        deltaLabel="vs Sep"
        inverse
        spark={<window.Sparkline values={d.monthlyTotals.slice(0,10)} color="var(--theme-color-tertiary-500)" />}
      />
      <window.KPI
        label="Avg spent · per month"
        value={window.fmtUSD(avg, { compact: true, fractionDigits: 0 })}
        delta={(avg - 3100) / 3100 * 100}
        deltaLabel="vs 2025 avg"
        inverse
        spark={<window.Sparkline values={d.monthlyTotals.slice(0,10)} color="var(--theme-color-secondary-500)" />}
      />
      <window.KPI
        label="Savings rate · YTD"
        value={(rate * 100).toFixed(0) + '%'}
        delta={4.2}
        deltaLabel="vs 2025"
        spark={<window.Sparkline
          values={d.incomePerMonth.slice(0,10).map((inc, i) => Math.max(0, inc - d.monthlyTotals[i]))}
          color="var(--theme-color-primary-500)"/>}
      />
      <window.KPI
        label="Net worth"
        value={window.fmtUSD(netWorth, { compact: true, fractionDigits: 0 })}
        delta={nwDelta}
        deltaLabel="YTD"
        deltaFormat="currency"
        spark={<window.Sparkline values={d.netWorthWeekly} color="var(--theme-color-primary-500)"/>}
      />
    </div>
  );
}

function App() {
  const [range, setRange] = useState('YTD');
  const [highlightCat, setHighlightCat] = useState(null);
  const cats = window.CATEGORIES;
  const d = window.DASH_DATA;

  return (
    <div style={{ background: 'var(--token-color-background-secondary)', minHeight: '100vh' }}>
      <Header range={range} setRange={setRange}/>
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPIs */}
        <KPIRow/>

        {/* Category filter strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '12px 16px', background: 'var(--token-color-background-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--token-background-secondary-elevation-low)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 500, marginRight: 4 }}>Filter</span>
          <window.Chip color="var(--token-color-text-standard)" active={!highlightCat} onClick={() => setHighlightCat(null)}>All categories</window.Chip>
          {cats.map(c => (
            <window.Chip key={c.id} color={c.color}
              active={highlightCat === c.id}
              onClick={() => setHighlightCat(highlightCat === c.id ? null : c.id)}>
              {c.label}
            </window.Chip>
          ))}
        </div>

        {/* ROW: Monthly stacked bar + Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <window.Tile elevation="medium">
            <window.SectionHeader
              title="Monthly spending by category"
              subtitle="Stacked by category · last 12 months"
              action={<window.Segmented size="sm" value="Stacked" onChange={()=>{}} options={['Stacked', 'Grouped']}/>}
            />
            <window.MonthlyStackedBar highlight={highlightCat} setHighlight={setHighlightCat}/>
          </window.Tile>
          <window.Tile elevation="medium">
            <window.SectionHeader title="Share of spend" subtitle="YTD by category"/>
            <window.CategoryDonut highlight={highlightCat} setHighlight={setHighlightCat}/>
          </window.Tile>
        </div>

        {/* ROW: Net worth + Income vs spend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <window.Tile>
            <window.SectionHeader
              title="Net worth growth"
              subtitle="Stacked by account · monthly"
              action={<span style={{ fontSize: 13, color: 'var(--token-color-semantic-gain)', fontWeight: 600, fontFamily: 'var(--font-family-mono)' }}>
                +{window.fmtUSD(7702, { compact: true, fractionDigits: 1 })} YTD
              </span>}
            />
            <window.NetWorthMultiLine/>
          </window.Tile>
          <window.Tile>
            <window.SectionHeader
              title="Income vs. spending"
              subtitle="Monthly · YTD"
            />
            <window.IncomeVsSpendBars/>
          </window.Tile>
        </div>

        {/* ROW: Streamgraph + Cumulative */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <window.Tile>
            <window.SectionHeader
              title="Spending flow"
              subtitle="Streamgraph · discretionary categories"
            />
            <window.Streamgraph/>
          </window.Tile>
          <window.Tile>
            <window.SectionHeader
              title="YTD pace"
              subtitle="Cumulative spend vs. last year and budget"
            />
            <window.CumulativeLine/>
          </window.Tile>
        </div>

        {/* ROW: Calendar heatmap full bleed */}
        <window.Tile>
          <window.SectionHeader
            title="Daily spending heatmap"
            subtitle={`365 days · ${d.calendar.filter(x => x.v > 0).length} days with activity`}
          />
          <window.CalendarHeatmap/>
        </window.Tile>

        {/* ROW: Month × Category heatmap + Savings ring */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <window.Tile>
            <window.SectionHeader
              title="Where every dollar went"
              subtitle="Month × category heatmap"
            />
            <window.MonthCategoryHeatmap/>
          </window.Tile>
          <window.Tile>
            <window.SectionHeader title="Savings rate" subtitle="YTD"/>
            <window.SavingsRateRing/>
          </window.Tile>
        </div>

        {/* ROW: Top categories + Slope */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <window.Tile>
            <window.SectionHeader
              title="This month vs. budget"
              subtitle="Bars are spend, vertical mark is budget"
            />
            <window.TopCategoriesVsBudget/>
          </window.Tile>
          <window.Tile>
            <window.SectionHeader
              title="Year-over-year"
              subtitle="Last year vs. projected 2026 by category"
              action={<div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--token-color-text-subdued)' }}>
                <span><span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--theme-color-primary-500)', verticalAlign: 'middle', marginRight: 4 }}/>Decrease</span>
                <span><span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--theme-color-tertiary-500)', verticalAlign: 'middle', marginRight: 4 }}/>Increase</span>
              </div>}
            />
            <window.SlopeChart/>
          </window.Tile>
        </div>

        {/* ROW: Treemap + Radar */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <window.Tile>
            <window.SectionHeader
              title="Category treemap"
              subtitle="Area proportional to YTD spend"
            />
            <window.CategoryTreemap/>
          </window.Tile>
          <window.Tile>
            <window.SectionHeader
              title="This month profile"
              subtitle="October vs. monthly average"
              action={<div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--token-color-text-subdued)' }}>
                <span><span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--theme-color-primary-500)', verticalAlign: 'middle', marginRight: 4 }}/>Oct</span>
                <span><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px dashed var(--theme-color-secondary-500)', verticalAlign: 'middle', marginRight: 4 }}/>Avg</span>
              </div>}
            />
            <window.RadarChart/>
          </window.Tile>
        </div>

        {/* ROW: Waterfall full bleed */}
        <window.Tile>
          <window.SectionHeader
            title="Where the year went"
            subtitle="YTD income → category spend → saved · waterfall"
          />
          <window.Waterfall/>
        </window.Tile>

        {/* ROW: Small multiples */}
        <window.Tile>
          <window.SectionHeader
            title="Per-category trend"
            subtitle="12-month sparklines · % is current month vs. category average"
          />
          <window.SmallMultiples/>
        </window.Tile>

        <footer style={{
          marginTop: 8, padding: '20px 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--token-color-text-subdued)', fontSize: 12,
        }}>
          <span>SpendWatcher · Personal spending and savings tracker</span>
          <span>Last sync · Oct 14, 2026 · 9:42 AM</span>
        </footer>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
