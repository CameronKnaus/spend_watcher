/* global React, window */
const { useState: useStateTr, useMemo: useMemoTr } = React;

function TrendsPage() {
  const [view, setView] = useStateTr('Yearly');
  const rows = useMemoTr(() => {
    const d = window.DASH_DATA, cats = window.CATEGORIES;
    const src = view === 'Yearly' ? d.ytdByCategory : Object.fromEntries(cats.map(c => [c.id, d.byCategoryMonthly[c.id][9]]));
    const total = Object.values(src).reduce((a, b) => a + b, 0);
    return cats.map(c => ({ id: c.id, label: c.label, amount: src[c.id] || 0, pct: ((src[c.id] || 0) / total) * 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [view]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, margin: 0 }}>Trends</h1>
        <window.Segmented options={['Yearly', 'Monthly']} value={view} onChange={setView} />
      </div>
      <window.ModuleContainer heading="Spending by category" elevation="medium" padding="16px 20px">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--token-color-text-subdued)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '8px 12px', fontWeight: 500, textAlign: 'right' }}>Total spent</th>
                <th style={{ padding: '8px 0 8px 12px', fontWeight: 500, width: '34%' }}>Percentage of total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--token-color-border-tertiary)' }}>
                  <td style={{ padding: '10px 12px 10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <window.CategoryIcon category={r.id} size={28} />
                      <span>{r.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {window.formatCurrency(-r.amount, true)}
                  </td>
                  <td style={{ padding: '10px 0 10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--theme-color-neutral-700)', overflow: 'hidden' }}>
                        <div style={{ width: `${r.pct}%`, height: 8, background: window.SPEND_CATEGORY[r.id] ? window.SPEND_CATEGORY[r.id].color : 'var(--theme-color-neutral-400)' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', width: 36, textAlign: 'right' }}>{r.pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </window.ModuleContainer>
    </div>
  );
}

Object.assign(window, { TrendsPage });
