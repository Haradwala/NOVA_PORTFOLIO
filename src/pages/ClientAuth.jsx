import { useState } from 'react';
import { supabase } from '../lib/supabase';
import UniverseCanvas from '../components/UniverseCanvas';

const inputStyle = {
  width: '100%', padding: '.72rem 1rem', borderRadius: 50,
  background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.22)',
  color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};

export default function ClientAuth({ onAuth }) {
  const [mode,    setMode]    = useState('login'); // 'login' | 'signup'
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [info,    setInfo]    = useState('');

  const handle = async () => {
    setErr(''); setInfo('');
    if (!email.trim() || !pw.trim()) { setErr('Please fill in all fields.'); return; }
    if (mode === 'signup' && !name.trim()) { setErr('Please enter your name.'); return; }
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
        options: { data: { full_name: name.trim() } },
      });
      if (error) { setErr(error.message); setLoading(false); return; }

      if (data.user && !data.session) {
        // Email confirmation required
        setInfo('Check your email to confirm your account, then log in!');
        setMode('login');
        setLoading(false);
        return;
      }

      // Auto-confirmed (email disabled in Supabase settings)
      if (data.session) onAuth(data.session.user, name.trim());

    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(), password: pw,
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      const displayName = data.user.user_metadata?.full_name || email.split('@')[0];
      onAuth(data.user, displayName);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <UniverseCanvas />
      <div style={{
        position: 'relative', zIndex: 5, width: 400,
        background: 'rgba(14,10,35,.94)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,.22)', borderRadius: 24,
        padding: '2.5rem', textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,.55)',
        animation: 'fadeUp .5s ease both',
      }}>
        {/* Logo */}
        <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>✦</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.35rem', color: 'var(--text)', marginBottom: '.3rem' }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1.8rem', lineHeight: 1.6 }}>
          {mode === 'login'
            ? 'Log in to continue your conversation with NOVA'
            : 'Sign up to chat with NOVA and connect with Shadab'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.2rem' }}>
          {mode === 'signup' && (
            <input
              autoFocus
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(139,92,246,.5)'}
              onBlur={e => e.target.style.borderColor='rgba(139,92,246,.22)'}
            />
          )}
          <input
            autoFocus={mode === 'login'}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor='rgba(139,92,246,.5)'}
            onBlur={e => e.target.style.borderColor='rgba(139,92,246,.22)'}
          />
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor='rgba(139,92,246,.5)'}
            onBlur={e => e.target.style.borderColor='rgba(139,92,246,.22)'}
          />
        </div>

        {err && (
          <div style={{ fontSize: '.72rem', color: '#F87171', marginBottom: '.9rem', padding: '.5rem .85rem', background: 'rgba(248,113,113,.08)', borderRadius: 10, border: '1px solid rgba(248,113,113,.2)' }}>
            {err}
          </div>
        )}
        {info && (
          <div style={{ fontSize: '.72rem', color: '#4ADE80', marginBottom: '.9rem', padding: '.5rem .85rem', background: 'rgba(74,222,128,.08)', borderRadius: 10, border: '1px solid rgba(74,222,128,.2)' }}>
            {info}
          </div>
        )}

        <button
          onClick={handle}
          disabled={loading}
          style={{
            width: '100%', padding: '.78rem', borderRadius: 50,
            background: loading ? 'rgba(139,92,246,.3)' : 'linear-gradient(135deg,var(--rose),var(--violet))',
            border: 'none', color: '#fff',
            fontFamily: "'DM Sans',sans-serif", fontSize: '.82rem', fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(139,92,246,.35)',
            transition: 'all .2s',
          }}
        >
          {loading ? '…' : mode === 'login' ? 'Log in ✦' : 'Create account ✦'}
        </button>

        {/* Toggle mode */}
        <div style={{ marginTop: '1.3rem', fontSize: '.72rem', color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); setInfo(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--violet2)', cursor: 'pointer', fontSize: '.72rem', padding: 0 }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* Back to portfolio */}
        <div style={{ marginTop: '.8rem' }}>
          <a href="/" style={{ fontSize: '.65rem', color: 'rgba(90,90,120,.7)', textDecoration: 'none' }}>
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
