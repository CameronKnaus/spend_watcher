/* global React, window */
// Category-oriented visualizations: donut, treemap, top bars vs budget,
// slope YoY, radar (monthly profile), small-multiples sparkline grid,
// month × category heatmap, calendar heatmap, savings-rate ring.
const { useState: useS2 } = React;

const D2 = () => window.DASH_DATA;
const C2 = () => window.CATEGORIES;

// ============================ DONUT ============================
function CategoryDonut({ highlight, setHighlight }) {
  const d = D2();
  const cats = C2();
  const total = Object.values(d.ytdByCategory).reduce((a,b) => a+b, 0);
  const W = 280, H = 280;
  const cx = W/2, cy = H/2;
  const r = 110, rIn = 72;
  let acc = 0;
  const arcs = cats.map(c => {
    const v = d.ytdByCategory[c.id];
    const start = acc / total * Math.PI * 2 - Math.PI / 2;
    acc += v;
    const end = acc / total * Math.PI * 2 - Math.PI / 2;
    const large = (end - start) > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const x3 = cx + rIn * Math.cos(end), y3 = cy + rIn * Math.sin(end);
    const x4 = cx + rIn * Math.cos(start),y4 = cy + rIn * Math.sin(start);
    const d2 = `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`;
    return { d2, c, v, pct: v/total*100 };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="220" height="220">
        {arcs.map(a => (
          <path key={a.c.id} d={a.d2} fill={a.c.color}
            opacity={!highlight || highlight === a.c.id ? 1 : 0.2}
            onMouseEnter={() => setHighlight && setHighlight(a.c.id)}
            onMouseLeave={() => setHighlight && setHighlight(null)}
            style={{ cursor: 'pointer', transition: 'opacity .15s' }}/>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="var(--token-color-text-subdued)" letterSpacing=".05em">YTD SPEND</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="24" fontWeight="300" fill="var(--token-color-text-standard)" fontFamily="var(--font-family-sans)">
          {window.fmtUSD(total, { compact: true, fractionDigits: 0 })}
        </text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, fontSize: 12, minWidth: 180 }}>
        {arcs.sort((a,b) => b.v - a.v).map(a => (
          <div key={a.c.id}
            onMouseEnter={() => setHighlight && setHighlight(a.c.id)}
            onMouseLeave={() => setHighlight && setHighlight(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px',
              borderRadius: 'var(--radius-xs)', cursor: 'pointer',
              background: highlight === a.c.id ? 'var(--theme-color-neutral-800)' : 'transparent',
            }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: a.c.color, flex: '0 0 auto' }}/>
            <span style={{ flex: 1, color: 'var(--token-color-text-standard)' }}>{a.c.label}</span>
            <span style={{ color: 'var(--token-color-text-subdued)', fontFamily: 'var(--font-family-mono)' }}>
              {a.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================ TREEMAP (squarified, simple) ============================
function CategoryTreemap() {
  const d = D2();
  const cats = C2();
  const items = cats.map(c => ({ ...c, v: d.ytdByCategory[c.id] })).sort((a,b) => b.v - a.v);
  const W = 520, H = 280;
  // Simple slice-and-dice layout
  const total = items.reduce((s, x) => s + x.v, 0);
  // Take the biggest, give a big slice; second tier shares right column; smallest share bottom.
  // Implement squarified-lite: alternate slicing direction filling.
  function layout(items, x, y, w, h) {
    const out = [];
    let cx = x, cy = y, cw = w, ch = h;
    const remaining = [...items];
    while (remaining.length) {
      // pick slice direction based on aspect
      const horizontal = cw >= ch;
      const totalLeft = remaining.reduce((s, r) => s + r.v, 0);
      // Take top item; allocate proportional area; reserve a strip
      const top = remaining.shift();
      const ratio = top.v / totalLeft;
      if (horizontal) {
        const tw = cw * ratio;
        out.push({ ...top, x: cx, y: cy, w: tw, h: ch });
        cx += tw; cw -= tw;
      } else {
        const th = ch * ratio;
        out.push({ ...top, x: cx, y: cy, w: cw, h: th });
        cy += th; ch -= th;
      }
    }
    return out;
  }
  const rects = layout(items, 0, 0, W, H);
  const [hover, setHover] = useS2(null);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {rects.map((r, i) => {
          const showLabel = r.w > 64 && r.h > 38;
          return (
            <g key={r.id}>
              <rect x={r.x + 1} y={r.y + 1} width={Math.max(0, r.w - 2)} height={Math.max(0, r.h - 2)}
                fill={r.color} rx="6"
                opacity={hover && hover !== r.id ? 0.3 : 1}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer', transition: 'opacity .15s' }}/>
              {showLabel && (
                <>
                  <text x={r.x + 10} y={r.y + 22} fontSize="13" fill="#fff" fontWeight="600">{r.label}</text>
                  <text x={r.x + 10} y={r.y + 40} fontSize="12" fill="#fff" opacity=".85" fontFamily="var(--font-family-mono)">
                    {window.fmtUSD(r.v, { compact: true, fractionDigits: 0 })}
                  </text>
                  <text x={r.x + 10} y={r.y + r.h - 10} fontSize="11" fill="#fff" opacity=".75">
                    {((r.v / items.reduce((s,x)=>s+x.v,0)) * 100).toFixed(1)}%
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================ TOP CATEGORIES BARS vs BUDGET ============================
function TopCategoriesVsBudget() {
  const d = D2();
  const cats = C2();
  // This month spend by category
  const items = cats.map(c => ({
    ...c,
    spent: d.byCategoryMonthly[c.id][9],
    budget: d.budgets[c.id] || 0,
  })).sort((a,b) => b.spent - a.spent).slice(0, 8);
  const max = Math.max(...items.map(i => Math.max(i.spent, i.budget))) * 1.1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(it => {
        const overBudget = it.spent > it.budget;
        const pctSpent = (it.spent / max) * 100;
        const pctBudget = (it.budget / max) * 100;
        return (
          <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 70px', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--token-color-text-standard)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color }} />
              <span style={{ fontWeight: 500 }}>{it.label}</span>
            </div>
            <div style={{ position: 'relative', height: 22, background: 'var(--theme-color-neutral-700)', borderRadius: 4, overflow: 'visible' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%', width: pctSpent + '%',
                background: overBudget ? 'var(--theme-color-tertiary-500)' : it.color,
                borderRadius: 4,
                transition: 'width .3s',
              }}/>
              {it.budget > 0 && (
                <div style={{
                  position: 'absolute', left: pctBudget + '%', top: -3, height: 28, width: 2,
                  background: 'var(--token-color-text-standard)',
                }} title={`Budget ${window.fmtUSD(it.budget)}`}/>
              )}
            </div>
            <div style={{
              textAlign: 'right', fontFamily: 'var(--font-family-mono)',
              color: overBudget ? 'var(--token-color-semantic-loss)' : 'var(--token-color-text-standard)',
              fontWeight: 500,
            }}>{window.fmtUSD(it.spent, { fractionDigits: 0 })}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================ SLOPE chart: YoY ============================
function SlopeChart() {
  const d = D2();
  const cats = C2();
  const W = 520, H = 280;
  const padL = 80, padR = 80, padT = 24, padB = 36;
  const iw = W - padL - padR, ih = H - padT - padB;
  const items = cats.map(c => ({
    ...c,
    ly: d.lastYearByCategory[c.id],
    ty: d.ytdByCategory[c.id] * 12 / 10, // annualized
  }));
  const allVals = items.flatMap(i => [i.ly, i.ty]);
  const max = Math.max(...allVals) * 1.05;
  const y = (v) => padT + ih - (v / max) * ih;
  const [hover, setHover] = useS2(null);

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        <line x1={padL} x2={padL} y1={padT} y2={padT + ih} stroke="var(--theme-color-neutral-500)"/>
        <line x1={W - padR} x2={W - padR} y1={padT} y2={padT + ih} stroke="var(--theme-color-neutral-500)"/>
        <text x={padL} y={padT - 8} textAnchor="middle" fontSize="12" fill="var(--token-color-text-subdued)" letterSpacing=".05em">LAST YEAR</text>
        <text x={W - padR} y={padT - 8} textAnchor="middle" fontSize="12" fill="var(--token-color-text-subdued)" letterSpacing=".05em">PROJECTED 2026</text>
        {items.map(it => {
          const y1 = y(it.ly), y2 = y(it.ty);
          const isUp = it.ty > it.ly;
          const dim = hover && hover !== it.id;
          return (
            <g key={it.id} onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <line x1={padL} x2={W - padR} y1={y1} y2={y2}
                stroke={isUp ? 'var(--theme-color-tertiary-500)' : 'var(--theme-color-primary-500)'}
                strokeWidth={hover === it.id ? 3 : 1.6} opacity={dim ? 0.15 : 0.85}/>
              <circle cx={padL} cy={y1} r="3.6" fill={it.color} opacity={dim ? 0.2 : 1}/>
              <circle cx={W - padR} cy={y2} r="3.6" fill={it.color} opacity={dim ? 0.2 : 1}/>
              <text x={padL - 8} y={y1 + 4} textAnchor="end" fontSize="11"
                fill="var(--token-color-text-standard)" opacity={dim ? 0.25 : 1}>{it.label}</text>
              <text x={W - padR + 8} y={y2 + 4} fontSize="11"
                fill="var(--token-color-text-standard)" opacity={dim ? 0.25 : 1}>
                {window.fmtUSD(it.ty, { compact: true, fractionDigits: 0 })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================ RADAR ============================
function RadarChart() {
  // Plot this month vs avg of months, both normalized per category by max(this, avg) so the shape is comparable.
  const d = D2();
  const cats = C2();
  const W = 320, H = 320;
  const cx = W/2, cy = H/2 + 4;
  const r = 110;
  const n = cats.length;
  const pts = (vals, factor) => vals.map((v, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = r * factor[i];
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  });
  const thisMonth = cats.map(c => d.byCategoryMonthly[c.id][9]);
  const avg = cats.map(c => {
    const arr = d.byCategoryMonthly[c.id].slice(0, 10);
    return arr.reduce((a,b) => a+b, 0) / arr.length;
  });
  const factor = cats.map((c, i) => {
    const m = Math.max(thisMonth[i], avg[i]);
    return m === 0 ? 0 : 1;
  });
  const fThis = cats.map((c, i) => {
    const m = Math.max(thisMonth[i], avg[i]);
    return m === 0 ? 0 : thisMonth[i] / m;
  });
  const fAvg = cats.map((c, i) => {
    const m = Math.max(thisMonth[i], avg[i]);
    return m === 0 ? 0 : avg[i] / m;
  });
  const ptsThis = pts(thisMonth, fThis);
  const ptsAvg = pts(avg, fAvg);
  const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="280" height="280">
        {[0.25, 0.5, 0.75, 1].map((p, i) => (
          <polygon key={i}
            points={cats.map((_, ii) => {
              const a = (ii / n) * Math.PI * 2 - Math.PI / 2;
              return `${cx + r*p*Math.cos(a)},${cy + r*p*Math.sin(a)}`;
            }).join(' ')}
            fill="none" stroke="var(--theme-color-neutral-600)" strokeWidth={i === 3 ? 1.2 : 0.8}/>
        ))}
        {cats.map((c, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return <line key={c.id} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="var(--theme-color-neutral-600)" strokeWidth="0.8"/>;
        })}
        <path d={pathOf(ptsAvg)} fill="var(--theme-color-secondary-500)" opacity="0.18"/>
        <path d={pathOf(ptsAvg)} fill="none" stroke="var(--theme-color-secondary-500)" strokeWidth="1.5" strokeDasharray="3 3"/>
        <path d={pathOf(ptsThis)} fill="var(--theme-color-primary-500)" opacity="0.28"/>
        <path d={pathOf(ptsThis)} fill="none" stroke="var(--theme-color-primary-500)" strokeWidth="2"/>
        {ptsThis.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill="var(--theme-color-primary-500)"/>)}
        {cats.map((c, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const lr = r + 16;
          const tx = cx + lr * Math.cos(a);
          const ty = cy + lr * Math.sin(a);
          return <text key={c.id} x={tx} y={ty + 3} textAnchor="middle" fontSize="10.5" fill="var(--token-color-text-subdued)">{c.label}</text>;
        })}
      </svg>
    </div>
  );
}

// ============================ SMALL MULTIPLES: per-category sparklines ============================
function SmallMultiples() {
  const d = D2();
  const cats = C2();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
      {cats.map(c => {
        const arr = d.byCategoryMonthly[c.id];
        const last = arr[9];
        const total = arr.slice(0, 10).reduce((a,b)=>a+b, 0);
        const avg = total / 10;
        const delta = avg ? (last - avg) / avg * 100 : 0;
        return (
          <div key={c.id} style={{
            padding: 12,
            background: 'var(--token-color-background-primary)',
            border: '1px solid var(--theme-color-neutral-700)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--token-color-text-standard)' }}>{c.label}</span>
            </div>
            <window.Sparkline values={arr} color={c.color} width={150} height={36} strokeWidth={1.4}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 300, fontVariantNumeric: 'tabular-nums', color: 'var(--token-color-text-standard)' }}>
                {window.fmtUSD(last, { compact: true, fractionDigits: 0 })}
              </span>
              <span style={{
                fontSize: 11,
                color: delta > 0 ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)',
                fontFamily: 'var(--font-family-mono)', fontWeight: 600,
              }}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================ MONTH × CATEGORY HEATMAP ============================
function MonthCategoryHeatmap() {
  const d = D2();
  const cats = C2();
  const months = window.MONTHS;
  const max = Math.max(...cats.flatMap(c => d.byCategoryMonthly[c.id]));
  const tt = window.useTooltip();
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 3, fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ width: 100 }}></th>
            {months.map((m, i) => (
              <th key={m} style={{
                fontWeight: i === 9 ? 600 : 500,
                color: i === 9 ? 'var(--token-color-text-dark)' : 'var(--token-color-text-subdued)',
                padding: '2px 4px', minWidth: 32,
              }}>{m}</th>
            ))}
            <th style={{ paddingLeft: 8, color: 'var(--token-color-text-subdued)', fontWeight: 500 }}>YTD</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c => {
            const ytd = d.ytdByCategory[c.id];
            return (
              <tr key={c.id}>
                <td style={{
                  paddingRight: 8, color: 'var(--token-color-text-standard)', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  {c.label}
                </td>
                {months.map((m, i) => {
                  const v = d.byCategoryMonthly[c.id][i];
                  const intensity = v / max;
                  // Color: lerp from background to category color
                  return (
                    <td key={m} style={{
                      background: v ? `color-mix(in srgb, ${c.color} ${Math.min(intensity * 100 + 10, 100)}%, var(--theme-color-neutral-800))` : 'var(--theme-color-neutral-800)',
                      color: intensity > 0.5 ? '#fff' : 'var(--token-color-text-standard)',
                      borderRadius: 4,
                      textAlign: 'center',
                      padding: '6px 0',
                      minWidth: 32,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: 10.5,
                    }}
                    onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${c.label} · ${m} · ${window.fmtUSD(v)}`)}
                    onMouseLeave={tt.hide}>
                      {v ? (v >= 1000 ? (v/1000).toFixed(1) + 'k' : v) : '·'}
                    </td>
                  );
                })}
                <td style={{
                  paddingLeft: 8, fontFamily: 'var(--font-family-mono)',
                  color: 'var(--token-color-text-standard)', fontWeight: 500,
                }}>
                  {window.fmtUSD(ytd, { compact: true, fractionDigits: 0 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tt.node}
    </div>
  );
}

// ============================ CALENDAR HEATMAP (year of days) ============================
function CalendarHeatmap() {
  const d = D2();
  const days = d.calendar;
  // Skip rent/utility days when computing max so the scale isn't dominated.
  const dailyDiscretionary = days.map(day => Math.min(day.v, 350));
  const max = Math.max(...dailyDiscretionary);
  // Group into weeks (Sunday-start columns)
  // We want columns = weeks (~53), rows = 7 days of week.
  const firstDow = days[0].dow; // 0=Sun
  // Pad before
  const padded = Array(firstDow).fill(null).concat(days);
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  const cell = 12, gap = 3;
  const W = weeks.length * (cell + gap) + 30;
  const H = 7 * (cell + gap) + 30;
  const tt = window.useTooltip();
  const colorScale = (v) => {
    if (v == null || v === 0) return 'var(--theme-color-neutral-700)';
    const clamped = Math.min(v, 350);
    const t = clamped / max;
    // Big rent days override:
    if (v > 1500) return 'var(--theme-color-tertiary-500)';
    if (t < 0.18) return 'var(--theme-color-primary-900)';
    if (t < 0.4)  return 'var(--theme-color-primary-800)';
    if (t < 0.65) return 'var(--theme-color-primary-700)';
    if (t < 0.85) return 'var(--theme-color-primary-500)';
    return 'var(--theme-color-primary-400)';
  };

  // Month label positions (column of first day of month)
  const monthLabels = [];
  let lastMonth = -1;
  let runningIdx = firstDow;
  days.forEach((day, i) => {
    if (day.month !== lastMonth) {
      const colIdx = Math.floor(runningIdx / 7);
      monthLabels.push({ month: day.month, col: colIdx });
      lastMonth = day.month;
    }
    runningIdx++;
  });

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
        {/* Month labels */}
        {monthLabels.map((ml, i) => (
          <text key={i} x={30 + ml.col * (cell + gap)} y={12}
            fontSize="10.5" fill="var(--token-color-text-subdued)">{window.MONTHS[ml.month]}</text>
        ))}
        {/* Day-of-week labels */}
        {['Mon', 'Wed', 'Fri'].map((lab, i) => {
          const row = i * 2 + 1;
          return <text key={lab} x={0} y={26 + row * (cell + gap)} fontSize="10" fill="var(--token-color-text-subdued)">{lab}</text>;
        })}
        {weeks.map((week, wi) => week.map((day, di) => day == null ? null : (
          <rect key={wi + '-' + di}
            x={30 + wi * (cell + gap)} y={20 + di * (cell + gap)}
            width={cell} height={cell} rx="2"
            fill={colorScale(day.v)}
            onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${day.d} · ${day.v ? window.fmtUSD(day.v) : 'No spend'}`)}
            onMouseLeave={tt.hide}
            onMouseMove={(e) => tt.show(e.clientX, e.clientY, `${day.d} · ${day.v ? window.fmtUSD(day.v) : 'No spend'}`)}
            style={{ cursor: 'pointer' }}/>
        )))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: 'var(--token-color-text-subdued)' }}>
        <span>Less</span>
        {['var(--theme-color-neutral-700)', 'var(--theme-color-primary-900)', 'var(--theme-color-primary-800)', 'var(--theme-color-primary-700)', 'var(--theme-color-primary-500)', 'var(--theme-color-primary-400)'].map(c => (
          <span key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c, display: 'inline-block' }}/>
        ))}
        <span>More</span>
        <span style={{ marginLeft: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--theme-color-tertiary-500)', display: 'inline-block' }}/>
          Bill day
        </span>
      </div>
      {tt.node}
    </div>
  );
}

// ============================ SAVINGS RATE RING ============================
function SavingsRateRing() {
  const d = D2();
  const incomeYTD = d.incomePerMonth.slice(0, 10).reduce((a,b) => a+b, 0);
  const spendYTD = d.monthlyTotals.slice(0, 10).reduce((a,b) => a+b, 0);
  const savedYTD = incomeYTD - spendYTD;
  const rate = savedYTD / incomeYTD;
  // Big ring
  const W = 200, H = 200, cx = W/2, cy = H/2, r = 78, rIn = 58;
  const start = -Math.PI/2;
  const end = start + rate * Math.PI * 2;
  const large = (end - start) > Math.PI ? 1 : 0;
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
  const x3 = cx + rIn * Math.cos(end), y3 = cy + rIn * Math.sin(end);
  const x4 = cx + rIn * Math.cos(start),y4 = cy + rIn * Math.sin(start);
  const arc = `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`;

  // Monthly mini rates
  const monthlyRates = d.incomePerMonth.slice(0, 10).map((inc, i) => (inc - d.monthlyTotals[i]) / inc);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="180" height="180">
        {/* track */}
        <circle cx={cx} cy={cy} r={(r + rIn)/2} fill="none" stroke="var(--theme-color-neutral-700)" strokeWidth={r - rIn}/>
        <path d={arc} fill="var(--theme-color-primary-500)"/>
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="34" fontWeight="300" fill="var(--token-color-text-standard)" fontFamily="var(--font-family-sans)">{(rate*100).toFixed(0)}%</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="var(--token-color-text-subdued)" letterSpacing=".05em">SAVED YTD</text>
      </svg>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: 'var(--token-color-text-subdued)' }}>Saved YTD</span>
          <span style={{ fontWeight: 500, fontFamily: 'var(--font-family-mono)', color: 'var(--token-color-semantic-gain)' }}>
            {window.fmtUSD(savedYTD, { fractionDigits: 0 })}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: 'var(--token-color-text-subdued)' }}>Of income</span>
          <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--token-color-text-standard)' }}>
            {window.fmtUSD(incomeYTD, { compact: true, fractionDigits: 0 })}
          </span>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--token-color-text-subdued)', letterSpacing: '.04em', textTransform: 'uppercase' }}>BY MONTH</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
          {monthlyRates.map((rt, i) => (
            <div key={i} title={`${window.MONTHS[i]}: ${(rt*100).toFixed(0)}%`} style={{
              flex: 1, height: Math.max(2, rt * 40) + 'px',
              background: rt < 0 ? 'var(--theme-color-tertiary-500)' : 'var(--theme-color-primary-500)',
              borderRadius: '2px 2px 0 0',
              opacity: i === 9 ? 1 : 0.7,
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--token-color-text-subdued)' }}>
          <span>Jan</span><span>Oct</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CategoryDonut, CategoryTreemap, TopCategoriesVsBudget, SlopeChart, RadarChart,
  SmallMultiples, MonthCategoryHeatmap, CalendarHeatmap, SavingsRateRing,
});
