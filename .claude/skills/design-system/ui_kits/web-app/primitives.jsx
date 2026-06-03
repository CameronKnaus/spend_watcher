/* global React, window */
const { useState: useStateUI } = React;

// ---------- currency ----------
function formatCurrency(amount, isGainLoss = false, fractionDigits = 2) {
  if (amount === undefined || amount === null) return '--';
  const sign = amount < 0 ? '−' : (isGainLoss && amount > 0 ? '+' : '');
  const body = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits,
  }).format(Math.abs(amount));
  return sign + body;
}
function Currency({ amount, isGainLoss = false, className = '', style = {} }) {
  if (amount === undefined) return null;
  const color = !isGainLoss ? 'inherit'
    : amount > 0 ? 'var(--token-color-semantic-gain)'
    : amount < 0 ? 'var(--token-color-semantic-loss)'
    : 'var(--token-color-text-standard)';
  return <span className={className} style={{ color, fontVariantNumeric: 'tabular-nums', ...style }}>{formatCurrency(amount, isGainLoss)}</span>;
}

// ---------- ModuleContainer (tile) ----------
function ModuleContainer({ heading, elevation, children, padding, style, className = '', onClick }) {
  return (
    <div onClick={onClick} className={className} style={{
      padding: padding || '10px 16px',
      background: 'var(--token-color-background-primary)',
      borderRadius: 'var(--radius-md)', width: '100%',
      boxShadow: elevation ? `var(--token-background-secondary-elevation-${elevation})` : 'none',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>
      {heading && <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{heading}</h3>}
      {children}
    </div>
  );
}

// ---------- CustomButton ----------
const BTN = {
  primary:   { bg: 'var(--token-button-primary-color)',   hover: 'var(--token-button-primary-hover-color)',   fg: '#fff' },
  secondary: { bg: 'var(--token-button-secondary-color)',  hover: 'var(--token-button-secondary-hover-color)',  fg: '#fff' },
  tertiary:  { bg: 'var(--token-button-tertiary-color)',   hover: 'var(--token-button-tertiary-hover-color)',   fg: '#fff' },
  detail:    { bg: 'var(--token-button-details-color)',    hover: 'var(--token-button-details-color-hover)',    fg: '#fff' },
};
function CustomButton({ variant = 'primary', isDisabled, layout = 'fit-content', onClick, children, style }) {
  const [hover, setHover] = useStateUI(false);
  const v = BTN[variant] || BTN.primary;
  return (
    <button
      onClick={() => !isDisabled && onClick && onClick()}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      disabled={isDisabled}
      style={{
        fontSize: 16, textAlign: 'center', borderRadius: 12, color: v.fg,
        background: isDisabled ? 'var(--token-disable-button-background)' : (hover ? v.hover : v.bg),
        transition: 'background .3s', padding: '9px 18px', border: 'none', fontFamily: 'inherit',
        cursor: isDisabled ? 'default' : 'pointer',
        width: layout === 'full-width' ? '100%' : 'fit-content', ...style,
      }}>
      {children}
    </button>
  );
}

// ---------- SectionHeader ----------
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{title}</h2>
        {subtitle && <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)', marginTop: 2 }}>{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}

// ---------- Segmented ----------
function Segmented({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? '4px 10px' : '6px 14px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--theme-color-neutral-700)', padding: 2, gap: 2 }}>
      {options.map(o => {
        const active = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: pad, fontSize: fs, fontFamily: 'inherit', cursor: 'pointer', border: 'none',
            background: active ? 'var(--theme-color-primary-500)' : 'transparent',
            color: active ? '#fff' : 'var(--token-color-text-standard)',
            fontWeight: active ? 600 : 500, borderRadius: 6, transition: 'background .15s, color .15s',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

// ---------- InteractiveRow ----------
function InteractiveRow({ icon, primaryLabel, secondaryLabel, primaryDataPoint, secondaryDataPoint, callToActionText, onClick }) {
  const [hover, setHover] = useStateUI(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', width: '100%', columnGap: 10, alignItems: 'center' }}>
        {icon}
        <div style={{ flexBasis: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--token-color-text-standard)' }}>
            <span style={{ textAlign: 'left' }}>{primaryLabel}</span>
            <span>{primaryDataPoint}</span>
          </div>
          {(secondaryLabel || secondaryDataPoint) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--token-color-text-subdued)' }}>
              <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondaryLabel}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{secondaryDataPoint}</span>
            </div>
          )}
        </div>
        <span style={{ color: hover ? 'var(--token-color-text-standard)' : 'var(--token-color-text-placeholder)', transition: 'color .2s' }}>
          <window.Icon name="chevron-right" size={18} />
        </span>
      </div>
      {callToActionText && (
        <div style={{ background: 'var(--token-cta-background-color)', color: 'var(--token-cta-text-color)', padding: 4, borderRadius: '0 0 8px 8px', marginTop: 6, fontSize: 12 }}>
          {callToActionText}
        </div>
      )}
    </button>
  );
}

// ---------- AlertMessage ----------
function AlertMessage({ title, message, variant = 'info' }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-sm)', alignItems: 'flex-start',
      background: `var(--token-${variant}-background-color)`, border: `1px solid var(--token-${variant}-border-color)`,
    }}>
      <span style={{ color: `var(--token-${variant}-icon-color)`, marginTop: 1 }}><window.Icon name="circle-info" size={16} /></span>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, color: `var(--token-${variant}-title-color)` }}>{title}</h3>
        {message && <p style={{ fontSize: 12, margin: 0, color: `var(--token-${variant}-message-color)` }}>{message}</p>}
      </div>
    </div>
  );
}

// ---------- SlideUpPanel ----------
function SlideUpPanel({ isOpen, title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(51,51,51,.35)', zIndex: 40,
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity .25s',
      }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        background: 'var(--token-color-background-primary)',
        borderRadius: '16px 16px 0 0', boxShadow: 'var(--token-background-secondary-elevation-high)',
        transform: isOpen ? 'translateY(0)' : 'translateY(110%)', transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
        maxWidth: 480, margin: '0 auto', padding: '20px 22px 28px',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--theme-color-neutral-600)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--token-color-text-subdued)' }}>
            <window.Icon name="xmark" size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

Object.assign(window, {
  formatCurrency, Currency, ModuleContainer, CustomButton, SectionHeader,
  Segmented, InteractiveRow, AlertMessage, SlideUpPanel,
});
