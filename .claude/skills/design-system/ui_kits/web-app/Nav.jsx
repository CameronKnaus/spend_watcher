/* global React, window */
const { useState: useStateNav } = React;

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'house',      label: 'Dashboard' },
  { id: 'savings',   icon: 'piggy-bank', label: 'Savings' },
  { id: 'recurring', icon: 'history',    label: 'Recurring spending' },
  { id: 'trends',    icon: 'chart-pie',  label: 'Trends' },
  { id: 'trips',     icon: 'plane',      label: 'Trips' },
];

function NavItem({ item, active, expanded, onClick }) {
  const [hover, setHover] = useStateNav(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', columnGap: 12, padding: '0 16px',
        border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative',
        color: hover || active ? 'var(--token-color-text-dark)' : 'var(--token-navigation-color)',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}>
      <span style={{
        '--icon-size': '2.25rem', width: '2.25rem', height: '2.25rem',
        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
        transform: hover ? 'scale(1.2)' : 'scale(1)', transition: 'transform .4s', flexShrink: 0,
      }}>
        {active && (
          <span style={{
            position: 'absolute', width: '50%', height: '50%', borderRadius: '50%',
            background: 'var(--token-button-primary-color)', zIndex: 0,
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1, color: 'inherit' }}>
          <window.Icon name={item.icon} size={22} />
        </span>
      </span>
      <span style={{ fontSize: 20, opacity: expanded ? 1 : 0, transition: 'opacity .3s', pointerEvents: 'none' }}>{item.label}</span>
    </button>
  );
}

function DesktopNav({ page, setPage }) {
  const [expanded, setExpanded] = useStateNav(false);
  return (
    <nav
      onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, height: '100%', zIndex: 5,
        background: 'var(--token-color-background-primary)',
        borderRight: '1px solid var(--token-color-border-tertiary)',
        width: expanded ? 248 : 68, transition: 'width .35s cubic-bezier(.34,1.2,.64,1)',
        overflowX: 'hidden', isolation: 'isolate',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: 28, padding: '16px 0' }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} active={page === item.id} expanded={expanded}
            onClick={() => setPage(item.id)} />
        ))}
      </div>
    </nav>
  );
}

Object.assign(window, { DesktopNav });
