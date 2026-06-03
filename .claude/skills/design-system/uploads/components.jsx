/* global React */
const { useState: useStateP, useRef: useRefP, useEffect: useEffectP } = React;

// ---------- Tile ----------
function Tile({ children, elevation = 'medium', style, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`sw-tile ${className}`}
      style={{
        background: 'var(--token-color-background-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: `var(--token-background-secondary-elevation-${elevation})`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ---------- Currency ----------
function fmtUSD(value, opts = {}) {
  const { compact = false, fractionDigits = 2, signed = false } = opts;
  if (value === null || value === undefined) return '--';
  const absV = Math.abs(value);
  let body;
  if (compact && absV >= 1000) {
    body = '$' + (absV / 1000).toFixed(absV >= 10000 ? 0 : 1) + 'k';
  } else {
    body = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(absV);
  }
  const sign = signed ? (value >= 0 ? '+' : '−') : (value < 0 ? '−' : '');
  return sign + body;
}

function Currency({ value, size = 16, weight = 300, neutral = true, compact = false }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--token-color-text-placeholder)', fontSize: size, fontWeight: weight }}>--</span>;
  }
  const positive = value >= 0;
  const color = neutral ? 'var(--token-color-text-standard)'
    : positive ? 'var(--token-color-semantic-gain)' : 'var(--token-color-semantic-loss)';
  return (
    <span style={{ color, fontSize: size, fontWeight: weight, fontVariantNumeric: 'tabular-nums' }}>
      {fmtUSD(value, { compact, signed: !neutral })}
    </span>
  );
}

// ---------- Section header ----------
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--token-color-text-standard)', letterSpacing: '.005em' }}>{title}</h2>
        {subtitle && <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', marginTop: 2 }}>{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}

// ---------- Segmented control ----------
function Segmented({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? '4px 10px' : '6px 14px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--theme-color-neutral-700)', padding: 2, gap: 2 }}>
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value;
        const lab = typeof o === 'string' ? o : o.label;
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)}
            style={{
              padding: pad, fontSize: fs, fontFamily: 'inherit', cursor: 'pointer', border: 'none',
              background: active ? 'var(--theme-color-primary-500)' : 'transparent',
              color: active ? '#fff' : 'var(--token-color-text-standard)',
              fontWeight: active ? 600 : 500,
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              transition: 'background .15s, color .15s',
            }}>{lab}</button>
        );
      })}
    </div>
  );
}

// ---------- Category dot ----------
function CatDot({ color, size = 10, square = false }) {
  return <span style={{
    display: 'inline-block', width: size, height: size,
    background: color, borderRadius: square ? 3 : 999, flex: '0 0 auto',
  }} />;
}

// ---------- Category badge (small rounded square w/ glyph) ----------
function CatBadge({ category, size = 32 }) {
  const cat = window.CATEGORIES.find(c => c.id === category) || { color: '#778e97', glyph: '•' };
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--radius-md)',
      background: cat.color, color: 'var(--token-color-category-icon)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, fontWeight: 600, flex: '0 0 auto',
    }}>{cat.glyph}</div>
  );
}

// ---------- Tooltip helper ----------
function useTooltip() {
  const [tt, setTT] = useStateP(null);
  const show = (x, y, content) => setTT({ x, y, content });
  const hide = () => setTT(null);
  const node = tt ? (
    <div style={{
      position: 'fixed',
      left: tt.x + 12, top: tt.y + 12,
      background: 'var(--theme-color-neutral-000)',
      color: 'var(--theme-color-neutral-1000)',
      fontSize: 12, padding: '8px 10px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--token-background-secondary-elevation-medium)',
      pointerEvents: 'none', zIndex: 1000,
      whiteSpace: 'nowrap',
    }}>{tt.content}</div>
  ) : null;
  return { show, hide, node };
}

// ---------- KPI tile ----------
// delta: numeric (sign meaningful). `inverse` flips good/bad semantics — for "Spent" KPIs,
// a lower number is good. `deltaFormat`: 'percent' (default) or 'currency'.
function KPI({ label, value, delta, deltaLabel, inverse = false, deltaFormat = 'percent', spark }) {
  if (delta === undefined || delta === null) {
    return (
      <Tile style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 132 }}>
        <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 300, lineHeight: 1.05, color: 'var(--token-color-text-standard)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          {spark && <div style={{ width: 100, height: 36 }}>{spark}</div>}
        </div>
        {deltaLabel && <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>{deltaLabel}</div>}
      </Tile>
    );
  }
  const up = delta > 0;
  const good = inverse ? !up : up; // for inverse KPIs, decrease = good
  const arrow = up ? '▲' : delta < 0 ? '▼' : '·';
  const color = good
    ? 'var(--token-color-semantic-gain)'
    : 'var(--token-color-semantic-loss)';
  const formatted = deltaFormat === 'currency'
    ? (up ? '+' : '−') + fmtUSD(Math.abs(delta), { compact: true, fractionDigits: 1 })
    : (up ? '+' : '−') + Math.abs(delta).toFixed(1) + '%';
  return (
    <Tile style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 132 }}>
      <div style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 32, fontWeight: 300, lineHeight: 1.05, color: 'var(--token-color-text-standard)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        {spark && <div style={{ width: 100, height: 36 }}>{spark}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {arrow} {formatted}
        </span>
        {deltaLabel && <span style={{ color: 'var(--token-color-text-subdued)' }}>{deltaLabel}</span>}
      </div>
    </Tile>
  );
}

// ---------- Sparkline ----------
function Sparkline({ values, color = 'var(--theme-color-primary-500)', fill = true, width = 100, height = 36, strokeWidth = 1.6 }) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1 || 1);
  const pts = values.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${width} ${height} L 0 ${height} Z`;
  const lastX = pts[pts.length - 1][0], lastY = pts[pts.length - 1][1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} opacity=".12" />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastX} cy={lastY} r="2.4" fill={color}/>
    </svg>
  );
}

// ---------- Chip ----------
function Chip({ active, color, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px',
      borderRadius: 'var(--radius-pill)',
      border: `1px solid ${active ? color : 'var(--theme-color-neutral-600)'}`,
      background: active ? color + '20' : 'var(--token-color-background-primary)',
      color: active ? 'var(--token-color-text-dark)' : 'var(--token-color-text-subdued)',
      fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
      transition: 'background .15s, color .15s, border-color .15s',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {children}
    </button>
  );
}

Object.assign(window, {
  Tile, Currency, fmtUSD, SectionHeader, Segmented, CatDot, CatBadge,
  useTooltip, KPI, Sparkline, Chip,
});
