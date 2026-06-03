/* global React, window */
const { useState: useStateApp } = React;

// ---------- Log expense form (inside SlideUpPanel) ----------
function LogExpenseForm({ initial, onClose }) {
  const cats = window.CATEGORIES;
  const [category, setCategory] = useStateApp(initial ? initial.category : 'RESTAURANTS');
  const [amount, setAmount] = useStateApp(initial ? Math.abs(initial.amount).toFixed(2) : '');
  const [note, setNote] = useStateApp(initial ? initial.name : '');
  const field = { border: 'none', borderBottom: '1px solid var(--token-color-border-secondary)', width: '100%', fontSize: 16, padding: '8px 0', background: 'transparent', outline: 'none', fontFamily: 'inherit', color: 'var(--token-color-text-standard)' };
  const label = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, marginTop: 14 };
  return (
    <div>
      <label style={{ ...label, marginTop: 0 }}>Amount</label>
      <input style={field} placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
      <label style={label}>Category</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
        {cats.filter(c => c.type !== 'fixed').map(c => {
          const active = category === c.id;
          const color = window.SPEND_CATEGORY[c.id] ? window.SPEND_CATEGORY[c.id].color : '#778e97';
          return (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 'var(--radius-pill)',
              border: `1px solid ${active ? color : 'var(--theme-color-neutral-600)'}`,
              background: active ? color + '20' : 'var(--token-color-background-primary)',
              color: active ? 'var(--token-color-text-dark)' : 'var(--token-color-text-subdued)',
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />{c.label}
            </button>
          );
        })}
      </div>
      <label style={label}>Notes</label>
      <input style={field} placeholder="About your expense" value={note} onChange={(e) => setNote(e.target.value)} />
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <window.CustomButton variant="secondary" layout="full-width" onClick={onClose}>Cancel</window.CustomButton>
        <window.CustomButton variant="primary" layout="full-width" onClick={onClose}>{initial ? 'Confirm change' : 'Submit'}</window.CustomButton>
      </div>
      {initial && (
        <button onClick={onClose} style={{ width: '100%', marginTop: 14, border: 'none', background: 'transparent', color: 'var(--token-color-semantic-danger)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <window.Icon name="trash" size={14} color="var(--token-color-semantic-danger)" /> Permanently delete this expense
        </button>
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', background: 'var(--token-color-background-primary)',
      borderBottom: '1px solid var(--token-color-border-tertiary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="../../assets/spendwatcher-logo.png" width="30" height="30" style={{ borderRadius: 7 }} alt="" />
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--theme-color-primary-500)' }}>SpendWatcher</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--token-color-text-subdued)' }}>Last sync · Oct 14, 9:42 AM</span>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--theme-color-primary-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>AR</div>
      </div>
    </header>
  );
}

function App() {
  const [authed, setAuthed] = useStateApp(false);
  const [page, setPage] = useStateApp('dashboard');
  const [logOpen, setLogOpen] = useStateApp(false);
  const [editTxn, setEditTxn] = useStateApp(null);

  if (!authed) return <window.AuthScreen onLogin={() => setAuthed(true)} />;

  const placeholder = (title) => (
    <div style={{ paddingBottom: 64 }}>
      <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 16px' }}>{title}</h1>
      <window.ModuleContainer elevation="low" padding="40px 24px">
        <div style={{ textAlign: 'center', color: 'var(--token-color-text-subdued)' }}>
          This screen isn't part of the kit yet. Explore Dashboard, Savings, and Trends.
        </div>
      </window.ModuleContainer>
    </div>
  );

  return (
    <div style={{ background: 'var(--token-color-background-secondary)', minHeight: '100vh' }}>
      <window.DesktopNav page={page} setPage={setPage} />
      <div style={{ paddingLeft: 68 }}>
        <TopBar />
        <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 24px 0' }}>
          {page === 'dashboard' && <window.DashboardPage onLogExpense={() => { setEditTxn(null); setLogOpen(true); }} onSelectTxn={(t) => { setEditTxn(typeof t === 'object' ? t : null); setLogOpen(true); }} />}
          {page === 'savings' && <window.SavingsPage />}
          {page === 'trends' && <window.TrendsPage />}
          {page === 'recurring' && placeholder('Recurring spending')}
          {page === 'trips' && placeholder('My trips')}
        </main>
      </div>
      <window.SlideUpPanel isOpen={logOpen} title={editTxn ? 'Edit expense' : 'New expense'} onClose={() => setLogOpen(false)}>
        {logOpen && <LogExpenseForm initial={editTxn} onClose={() => setLogOpen(false)} />}
      </window.SlideUpPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
