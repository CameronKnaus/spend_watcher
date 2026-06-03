/* global React, window */
// Inline-SVG icon component backed by assets/icons.js (window.SW_ICON_PATHS).
function Icon({ name, size = 18, color = 'currentColor', style }) {
  const d = (window.SW_ICON_PATHS && window.SW_ICON_PATHS[name]) || (window.SW_ICON_PATHS && window.SW_ICON_PATHS['dollar-sign']);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true"
      focusable="false" style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={d} />
    </svg>
  );
}

// Spend category id -> { icon key, color }. Colors are the canonical category tokens.
const SPEND_CATEGORY = {
  HOUSING:        { icon: 'house',        color: '#577590' },
  GROCERIES:      { icon: 'cart',         color: '#82aa46' },
  RESTAURANTS:    { icon: 'utensils',     color: '#ff8442' },
  TRANSPORTATION: { icon: 'train',        color: '#e5ad04' },
  ENTERTAINMENT:  { icon: 'film',         color: '#de2682' },
  UTILITIES:      { icon: 'bolt',         color: '#2ba1d4' },
  HEALTH:         { icon: 'heart-pulse',  color: '#a30015' },
  CLOTHING:       { icon: 'shirt',        color: '#cebe79' },
  TRAVEL:         { icon: 'plane',        color: '#49c165' },
  FUEL:           { icon: 'gas-pump',     color: '#b77b43' },
  OTHER:          { icon: 'dollar-sign',  color: '#776871' },
};

const ACCOUNT_CATEGORY = {
  CHECKING:  { icon: 'building-columns', color: '#4884bc', label: 'Checking' },
  SAVINGS:   { icon: 'piggy-bank',       color: '#f20d2b', label: 'Savings' },
  INVESTING: { icon: 'arrow-trend-up',   color: '#84b63a', label: 'Investment' },
  BONDS:     { icon: 'receipt',          color: '#e87217', label: 'Bonds' },
};

// Rounded-square category chip with the glyph knocked out near-white.
function CategoryIcon({ category, size = 36, account = false }) {
  const map = account ? ACCOUNT_CATEGORY : SPEND_CATEGORY;
  const meta = map[category] || SPEND_CATEGORY.OTHER;
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--radius-md)',
      background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: 'var(--token-color-category-icon)',
    }}>
      <Icon name={meta.icon} size={size * 0.55} color="#f8fbfc" />
    </div>
  );
}

Object.assign(window, { Icon, CategoryIcon, SPEND_CATEGORY, ACCOUNT_CATEGORY });
