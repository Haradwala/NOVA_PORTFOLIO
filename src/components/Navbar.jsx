import { useLocation } from 'react-router-dom';
import { useWarpTransition } from '../hooks/useWarpTransition';

const LINKS = [
  { label: 'About',   path: '/about'   },
  { label: 'Work',    path: '/work'    },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar({ onAskNova }) {
  const { warpTo }   = useWarpTransition();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.2rem 3.5rem',
      background: 'rgba(7,7,15,.88)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(139,92,246,.12)',
    }}>
      {/* Logo */}
      <button onClick={() => warpTo('/')} style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem',
        color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        Shadab<span style={{ color: 'var(--rose)' }}>.</span>
      </button>

      <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0 }}>
        {LINKS.map(({ label, path }) => {
          const active = pathname === path;
          return (
            <li key={path}>
              <button
                onClick={() => warpTo(path)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase',
                  transition: 'color .2s',
                  borderBottom: active ? '1px solid var(--rose)' : '1px solid transparent',
                  paddingBottom: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = active ? 'var(--text)' : 'var(--muted)'}
              >{label}</button>
            </li>
          );
        })}

        {/* Client Portal */}
        <li>
          <button onClick={() => warpTo('/chat')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '.68rem', letterSpacing: '.14em',
            textTransform: 'uppercase', transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color='var(--teal)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
          >Client Portal</button>
        </li>

        {/* Admin link */}
        <li>
          <button onClick={() => warpTo('/admin')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '.68rem', letterSpacing: '.14em',
            textTransform: 'uppercase', transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >Admin</button>
        </li>

        {/* Ask NOVA */}
        <li>
          <button onClick={onAskNova} style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.5rem 1.2rem', borderRadius: 50,
            background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)',
            color: 'var(--violet2)', fontSize: '.68rem', letterSpacing: '.1em',
            textTransform: 'uppercase', transition: 'all .2s', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,.22)'; e.currentTarget.style.boxShadow='0 0 20px rgba(139,92,246,.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(139,92,246,.12)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80', animation: 'pulse 2s infinite' }} />
            Ask NOVA
          </button>
        </li>
      </ul>
    </nav>
  );
}
