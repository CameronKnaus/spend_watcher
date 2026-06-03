/* global React, window */
const { useState: useStateAuth } = React;

function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useStateAuth(false);
  const [username, setUsername] = useStateAuth('alex.river');
  const [password, setPassword] = useStateAuth('••••••••');
  const inputStyle = {
    border: 'none', borderBottom: '1px solid var(--token-color-border-secondary)', width: '100%',
    display: 'block', textAlign: 'center', fontSize: 16, background: 'transparent',
    color: 'var(--token-color-text-standard)', padding: '6px 0', marginBottom: 16, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { fontWeight: 500, display: 'block', fontSize: 13, paddingBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px', background: 'var(--token-color-background-secondary)' }}>
      <div style={{
        background: 'var(--token-color-background-primary)', padding: '24px 16px',
        border: '1px solid var(--token-color-border-secondary)', borderRadius: 16,
        margin: '80px auto auto', width: '100%', maxWidth: 375,
        boxShadow: 'var(--token-background-secondary-elevation-medium)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid var(--token-color-border-secondary)' }}>
          <img src="../../assets/spendwatcher-logo.png" width="48" height="48" style={{ borderRadius: 12 }} alt="" />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--theme-color-primary-500)' }}>Welcome to SpendWatcher</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>{isRegistering ? 'Register' : 'Login'}</div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          {isRegistering && (<><label style={labelStyle}>Email address</label><input style={inputStyle} placeholder="Email address" defaultValue="alex@example.com" /></>)}
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 16, padding: '16px 0' }}>
            <window.CustomButton variant="secondary" layout="full-width" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Back to login' : 'Register'}
            </window.CustomButton>
            <window.CustomButton variant="primary" layout="full-width" onClick={onLogin}>Submit</window.CustomButton>
          </div>
        </form>
      </div>
      <div style={{ marginTop: 18, fontSize: 12, color: 'var(--token-color-text-subdued)' }}>Personal spending and savings tracker</div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
