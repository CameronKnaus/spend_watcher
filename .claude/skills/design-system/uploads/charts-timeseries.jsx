/* global React, window */
// Time-series visualizations: stacked bar, multi-line, paired bars, streamgraph,
// cumulative YTD line, waterfall.
const { useState: useS1, useMemo: useM1 } = React;

const CATS = () => window.CATEGORIES;
const D = () => window.DASH_DATA;

// ============================ STACKED BAR (monthly spend by category) ============================
function MonthlyStackedBar({ highlight, setHighlight }) {
  const months = window.MONTHS;
  const data = D();
  const cats = CATS();
  // For each month, build segments from largest to smallest
  const total = data.monthlyTotals;
  const max = Math.max(...total) * 1.05;
  const W = 720, H = 280;
  const padL = 44, padR = 12, padT = 12, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const barW = innerW / months.length;
  const tt = window.useTooltip();

  const yTicks = 5;
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i / 100) * 100);

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* gridlines */}
        {tickVals.map((v, i) => {
          const y = padT + innerH - (v / max) * innerH;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--theme-color-neutral-700)" strokeWidth="1"/>
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--token-color-text-subdued)" fontFamily="var(--font-family-mono)">${(v/1000).toFixed(v >= 1000 ? 1 : 0)}k</text>
            </g>
          );
        })}
        {/* bars */}
        {months.map((m, mi) => {
          let yCursor = padT + innerH;
          const isCurrent = mi === 9; // October
          return (
            <g key={m} transform={`translate(${padL + barW * mi}, 0)`}>
              {cats.map(c => {
                const v = data.byCategoryMonthly[c.id][mi];
                if (!v) return null;
                const h = (v / max) * innerH;
                yCursor -= h;
                const dim = highlight && highlight !== c.id;
                return (
                  <rect
                    key={c.id}
                    x={barW * 0.18} y={yCursor}
                    width={barW * 0.64} height={Math.max(h, 0.5)}
                    fill={c.color}
                    opacity={dim ? 0.18 : 1}
                    onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${m} · ${c.label} · ${window.fmtUSD(v)}`)}
                    onMouseLeave={tt.hide}
                    onMouseMove={(e) => tt.show(e.clientX, e.clientY, `${m} · ${c.label} · ${window.fmtUSD(v)}`)}
                    style={{ cursor: 'pointer', transition: 'opacity .15s' }}
                  />
                );
              })}
              {/* total label on top of bar */}
              <text
                x={barW / 2} y={padT + innerH - (total[mi] / max) * innerH - 6}
                textAnchor="middle" fontSize="10.5" fontWeight="500"
                fill={isCurrent ? 'var(--theme-color-primary-500)' : 'var(--token-color-text-subdued)'}
                fontFamily="var(--font-family-mono)">
                ${(total[mi]/1000).toFixed(1)}k
              </text>
              <text x={barW / 2} y={H - 10} textAnchor="middle" fontSize="11"
                fill={isCurrent ? 'var(--token-color-text-dark)' : 'var(--token-color-text-subdued)'}
                fontWeight={isCurrent ? 600 : 400}>{m}</text>
            </g>
          );
        })}
      </svg>
      {tt.node}
    </div>
  );
}

// ============================ NET WORTH MULTI-LINE ============================
function NetWorthMultiLine() {
  const data = D();
  const accts = [
    { id: 'CHECKING',  label: 'Checking',  color: '#4884bc' },
    { id: 'SAVINGS',   label: 'Savings',   color: '#f20d2b' },
    { id: 'INVESTING', label: 'Investing', color: '#84b63a' },
    { id: 'BONDS',     label: 'Bonds',     color: '#e87217' },
  ];
  const months = window.MONTHS.slice(0, 10);
  const W = 520, H = 230;
  const padL = 48, padR = 16, padT = 14, padB = 30;
  const iw = W - padL - padR, ih = H - padT - padB;

  // Stack to get cumulative for net-worth area
  const stack = months.map((_, i) => accts.reduce((s, a) => s + data.accountBalances[a.id][i], 0));
  const max = Math.max(...stack) * 1.05;
  const min = 0;
  const x = (i) => padL + (i / (months.length - 1)) * iw;
  const y = (v) => padT + ih - ((v - min) / (max - min)) * ih;

  // Build per-account cumulative paths (lower → upper)
  let cum = months.map(() => 0);
  const layers = [];
  for (const a of accts) {
    const lower = [...cum];
    cum = cum.map((c, i) => c + data.accountBalances[a.id][i]);
    const upper = [...cum];
    const path = [
      ...lower.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`),
      ...upper.map((v, i) => `L${x(months.length - 1 - i)} ${y(upper[months.length - 1 - i])}`),
      'Z'
    ].join(' ');
    layers.push({ a, path, top: upper });
  }

  const tt = window.useTooltip();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const yy = padT + ih * (1 - p);
          const val = max * p;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--theme-color-neutral-700)"/>
              <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize="10.5"
                fill="var(--token-color-text-subdued)" fontFamily="var(--font-family-mono)">
                ${(val/1000).toFixed(0)}k
              </text>
            </g>
          );
        })}
        {/* stacked areas */}
        {layers.map((L, i) => (
          <path key={i} d={L.path} fill={L.a.color} opacity="0.85"
            stroke="var(--token-color-background-primary)" strokeWidth="1"/>
        ))}
        {/* top boundary line (net worth) */}
        <path
          d={layers[layers.length - 1].top.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')}
          fill="none" stroke="var(--theme-color-primary-200)" strokeWidth="2"
        />
        {/* dots on top line */}
        {layers[layers.length - 1].top.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="3"
            fill="var(--token-color-background-primary)"
            stroke="var(--theme-color-primary-200)" strokeWidth="1.5"
            onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${months[i]} · Net worth ${window.fmtUSD(v)}`)}
            onMouseLeave={tt.hide}
            style={{ cursor: 'pointer' }}/>
        ))}
        {/* x labels */}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11"
            fill="var(--token-color-text-subdued)">{m}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap', fontSize: 12 }}>
        {accts.map(a => (
          <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--token-color-text-subdued)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: a.color }} />
            {a.label}
            <span style={{ color: 'var(--token-color-text-standard)', fontWeight: 500, fontFamily: 'var(--font-family-mono)' }}>
              {window.fmtUSD(data.accountBalances[a.id].at(-1), { fractionDigits: 0 })}
            </span>
          </span>
        ))}
      </div>
      {tt.node}
    </div>
  );
}

// ============================ INCOME vs SPEND paired bars ============================
function IncomeVsSpendBars() {
  const months = window.MONTHS;
  const d = D();
  const W = 520, H = 230;
  const padL = 44, padR = 12, padT = 12, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = Math.max(...d.incomePerMonth, ...d.monthlyTotals) * 1.05;
  const bw = iw / months.length;
  const tt = window.useTooltip();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const yy = padT + ih * (1 - p);
          return <line key={i} x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--theme-color-neutral-700)"/>;
        })}
        {[0, 0.5, 1].map((p, i) => {
          const yy = padT + ih * (1 - p);
          return <text key={i} x={padL - 8} y={yy + 4} textAnchor="end" fontSize="10.5"
            fill="var(--token-color-text-subdued)" fontFamily="var(--font-family-mono)">
            ${(max * p / 1000).toFixed(1)}k
          </text>;
        })}
        {months.map((m, i) => {
          const inc = d.incomePerMonth[i];
          const spend = d.monthlyTotals[i];
          const incH = (inc / max) * ih;
          const spendH = (spend / max) * ih;
          return (
            <g key={m} transform={`translate(${padL + bw * i}, 0)`}>
              <rect x={bw * 0.16} y={padT + ih - incH} width={bw * 0.32} height={incH}
                fill="var(--theme-color-primary-500)" rx="2"
                onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${m} · Income ${window.fmtUSD(inc)}`)}
                onMouseLeave={tt.hide}
                style={{ cursor: 'pointer' }}/>
              <rect x={bw * 0.52} y={padT + ih - spendH} width={bw * 0.32} height={spendH}
                fill="var(--theme-color-tertiary-500)" rx="2"
                onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${m} · Spent ${window.fmtUSD(spend)}`)}
                onMouseLeave={tt.hide}
                style={{ cursor: 'pointer' }}/>
              <text x={bw / 2} y={H - 8} textAnchor="middle" fontSize="10.5"
                fill="var(--token-color-text-subdued)">{m}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--theme-color-primary-500)', marginRight: 6 }}/>Income</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--theme-color-tertiary-500)', marginRight: 6 }}/>Spent</span>
      </div>
      {tt.node}
    </div>
  );
}

// ============================ STREAMGRAPH ============================
function Streamgraph() {
  const months = window.MONTHS;
  const d = D();
  // Exclude HOUSING (drowns everything) — show discretionary stream.
  const cats = CATS().filter(c => c.id !== 'HOUSING');
  const W = 520, H = 220;
  const padL = 8, padR = 8, padT = 8, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;

  // Compute total per month for non-housing
  const totals = months.map((_, i) => cats.reduce((s, c) => s + d.byCategoryMonthly[c.id][i], 0));
  const maxTotal = Math.max(...totals);

  // Use silhouette centering: y0[i] = -sum_k/2
  const y0 = months.map((_, i) => -totals[i] / 2);
  const x = (i) => padL + (i / (months.length - 1)) * iw;
  const scaleY = (v) => (v / maxTotal) * (ih * 0.96);

  // Smoothing helper for cardinal-ish curves
  const smoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d2 = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const x0 = pts[i][0], y0_ = pts[i][1];
      const x1 = pts[i+1][0], y1_ = pts[i+1][1];
      const cx = (x0 + x1) / 2;
      d2 += ` C${cx} ${y0_}, ${cx} ${y1_}, ${x1} ${y1_}`;
    }
    return d2;
  };

  let lowerLayer = months.map((_, i) => y0[i]);
  const layers = [];
  cats.forEach(c => {
    const lower = [...lowerLayer];
    const upper = lower.map((b, i) => b + d.byCategoryMonthly[c.id][i]);
    layers.push({ c, lower, upper });
    lowerLayer = upper;
  });

  const centerY = padT + ih / 2;
  const toPt = (i, v) => [x(i), centerY + scaleY(v)];

  const tt = window.useTooltip();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {layers.map((L, idx) => {
          const upperPts = L.upper.map((v, i) => toPt(i, v));
          const lowerPts = L.lower.map((v, i) => toPt(i, v));
          // path: upper L→R then lower R→L
          const path = smoothPath(upperPts) + ' L' + lowerPts.slice().reverse().map(p => p[0] + ' ' + p[1]).join(' L') + ' Z';
          return (
            <path key={L.c.id} d={path} fill={L.c.color} opacity="0.85"
              onMouseEnter={(e) => tt.show(e.clientX, e.clientY, L.c.label)}
              onMouseLeave={tt.hide}
              onMouseMove={(e) => tt.show(e.clientX, e.clientY, L.c.label)}
              style={{ cursor: 'pointer' }}/>
          );
        })}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5"
            fill="var(--token-color-text-subdued)">{m}</text>
        ))}
      </svg>
      {tt.node}
    </div>
  );
}

// ============================ CUMULATIVE YTD line vs target ============================
function CumulativeLine() {
  const months = window.MONTHS;
  const d = D();
  const W = 520, H = 230;
  const padL = 50, padR = 16, padT = 14, padB = 30;
  const iw = W - padL - padR, ih = H - padT - padB;

  // Actual cumulative
  const cum = [];
  let s = 0;
  d.monthlyTotals.forEach((v, i) => {
    if (i <= 9) { s += v; cum.push(s); } else cum.push(null);
  });
  // Last year cumulative (estimated from lastYearByCategory total / 12 with seasonality)
  const lyTotal = Object.values(d.lastYearByCategory).reduce((a,b) => a+b, 0);
  const lyCum = months.map((_, i) => (lyTotal / 12) * (i + 1));
  // Target line: cumulative budget
  const budgetTotal = Object.values(d.budgets).reduce((a,b) => a+b, 0);
  const budgetCum = months.map((_, i) => budgetTotal * (i + 1));

  const max = Math.max(...lyCum, ...budgetCum, cum[9]) * 1.05;
  const x = (i) => padL + (i / (months.length - 1)) * iw;
  const y = (v) => padT + ih - (v / max) * ih;
  const tt = window.useTooltip();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const yy = padT + ih * (1 - p);
          return <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--theme-color-neutral-700)"/>
            <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize="10.5"
              fill="var(--token-color-text-subdued)" fontFamily="var(--font-family-mono)">
              ${(max * p / 1000).toFixed(0)}k
            </text>
          </g>;
        })}
        {/* budget */}
        <path d={budgetCum.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')}
          fill="none" stroke="var(--theme-color-neutral-300)" strokeDasharray="4 4" strokeWidth="1.5"/>
        {/* last year */}
        <path d={lyCum.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')}
          fill="none" stroke="var(--theme-color-secondary-500)" strokeWidth="1.6" opacity="0.7"/>
        {/* this year area */}
        <path d={`M${x(0)} ${y(0)} ` + cum.filter(v => v != null).map((v, i) => `L${x(i)} ${y(v)}`).join(' ') + ` L${x(9)} ${padT + ih} Z`}
          fill="var(--theme-color-primary-500)" opacity="0.12"/>
        <path d={cum.filter(v => v != null).map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')}
          fill="none" stroke="var(--theme-color-primary-500)" strokeWidth="2.5"/>
        {cum.map((v, i) => v != null ? (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === 9 ? 5 : 3} fill="var(--theme-color-primary-500)"
            onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${months[i]} · YTD ${window.fmtUSD(v)}`)}
            onMouseLeave={tt.hide} style={{ cursor: 'pointer' }}/>
        ) : null)}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11"
            fill={i === 9 ? 'var(--token-color-text-dark)' : 'var(--token-color-text-subdued)'}
            fontWeight={i === 9 ? 600 : 400}>{m}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 18, marginTop: 4, fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
        <span><span style={{ display: 'inline-block', width: 18, height: 3, background: 'var(--theme-color-primary-500)', marginRight: 6, verticalAlign: 'middle' }}/>This year</span>
        <span><span style={{ display: 'inline-block', width: 18, height: 3, background: 'var(--theme-color-secondary-500)', marginRight: 6, verticalAlign: 'middle' }}/>Last year</span>
        <span><span style={{ display: 'inline-block', width: 18, height: 0, borderTop: '1.5px dashed var(--theme-color-neutral-300)', marginRight: 6, verticalAlign: 'middle' }}/>Budget</span>
      </div>
      {tt.node}
    </div>
  );
}

// ============================ WATERFALL: Income → category spend → savings ============================
function Waterfall() {
  const d = D();
  const incomeYTD = d.incomePerMonth.slice(0, 10).reduce((a,b) => a+b, 0);
  const byCat = window.CATEGORIES.map(c => ({
    label: c.label, color: c.color, value: -d.ytdByCategory[c.id]
  })).sort((a, b) => a.value - b.value); // most negative first
  const ytdSpend = byCat.reduce((s, c) => s + c.value, 0);
  const savings = incomeYTD + ytdSpend;

  const items = [
    { label: 'Income', value: incomeYTD, color: 'var(--theme-color-primary-500)', kind: 'start' },
    ...byCat.map(c => ({ ...c, kind: 'minus' })),
    { label: 'Saved', value: savings, color: 'var(--theme-color-secondary-500)', kind: 'end' },
  ];

  const W = 720, H = 280;
  const padL = 50, padR = 16, padT = 14, padB = 60;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = incomeYTD * 1.05;
  const bw = iw / items.length;

  let running = 0;
  const bars = items.map((it, i) => {
    let top, bottom;
    if (it.kind === 'start') { top = it.value; bottom = 0; running = it.value; }
    else if (it.kind === 'end') { top = it.value; bottom = 0; }
    else { top = running; running += it.value; bottom = running; }
    return { it, top, bottom, i };
  });

  const y = (v) => padT + ih - (v / max) * ih;
  const tt = window.useTooltip();

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        {[0, 0.5, 1].map((p, i) => {
          const yy = padT + ih * (1 - p);
          return <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--theme-color-neutral-700)"/>
            <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize="10.5"
              fill="var(--token-color-text-subdued)" fontFamily="var(--font-family-mono)">
              ${(max * p / 1000).toFixed(0)}k
            </text>
          </g>;
        })}
        {bars.map(({ it, top, bottom, i }) => {
          const yTop = y(Math.max(top, bottom));
          const yBot = y(Math.min(top, bottom));
          const h = Math.max(2, yBot - yTop);
          return (
            <g key={i} transform={`translate(${padL + bw * i}, 0)`}>
              <rect x={bw * 0.18} y={yTop} width={bw * 0.64} height={h} fill={it.color} rx="3"
                onMouseEnter={(e) => tt.show(e.clientX, e.clientY, `${it.label} · ${window.fmtUSD(it.value, { signed: true })}`)}
                onMouseLeave={tt.hide}
                style={{ cursor: 'pointer' }}/>
              {/* connector */}
              {i < bars.length - 1 && (
                <line x1={bw * 0.82} x2={bw + bw * 0.18}
                  y1={it.kind === 'start' || it.kind === 'minus' ? yTop : yBot}
                  y2={it.kind === 'start' || it.kind === 'minus' ? yTop : yBot}
                  stroke="var(--theme-color-neutral-400)" strokeDasharray="2 3" strokeWidth="1"/>
              )}
              <text x={bw / 2} y={H - 44} textAnchor="end" fontSize="10.5"
                transform={`rotate(-40, ${bw / 2}, ${H - 44})`}
                fill="var(--token-color-text-subdued)">{it.label}</text>
              <text x={bw / 2} y={yTop - 4} textAnchor="middle" fontSize="10"
                fill="var(--token-color-text-standard)" fontWeight="500" fontFamily="var(--font-family-mono)">
                {it.kind === 'minus' ? '−' : ''}${(Math.abs(it.value)/1000).toFixed(1)}k
              </text>
            </g>
          );
        })}
      </svg>
      {tt.node}
    </div>
  );
}

Object.assign(window, {
  MonthlyStackedBar, NetWorthMultiLine, IncomeVsSpendBars, Streamgraph, CumulativeLine, Waterfall,
});
