import { useState, useEffect } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const renderAskNova = (className) => (
    <button onClick={onAskNova} className={className} style={{
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
  );

  return (
    <nav className="nav-container" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.2rem 3.5rem',
      background: 'rgba(7,7,15,.88)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(139,92,246,.12)',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nav-container {
          padding-top: calc(1.2rem + env(safe-area-inset-top)) !important;
          padding-left: calc(3.5rem + env(safe-area-inset-left)) !important;
          padding-right: calc(3.5rem + env(safe-area-inset-right)) !important;
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-container { 
            padding-top: calc(1rem + env(safe-area-inset-top)) !important;
            padding-left: calc(1.5rem + env(safe-area-inset-left)) !important;
            padding-right: calc(1.5rem + env(safe-area-inset-right)) !important;
            padding-bottom: 1rem !important;
          }
          .desktop-ask-nova { display: none !important; }
          .mobile-ask-nova { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu-overlay { display: none !important; }
          .mobile-ask-nova { display: none !important; }
        }
      `}</style>

      {/* Logo */}
      <button onClick={() => { setMenuOpen(false); warpTo('/'); }} style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem',
        color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer',
        minHeight: '44px', display: 'flex', alignItems: 'center',
      }}>
        Shadab<span style={{ color: 'var(--rose)' }}>.</span>
      </button>

      <ul className="nav-links" style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0 }}>
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
          {renderAskNova("desktop-ask-nova")}
        </li>
      </ul>

      {/* Mobile Actions Container */}
      <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="mobile-menu-btn">
        {renderAskNova("mobile-ask-nova")}
        <button onClick={() => setMenuOpen(o => !o)} style={{
          background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '44px', height: '44px',
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" 
          onClick={(e) => {
            if (!e.target.closest('button')) {
              setMenuOpen(false);
            }
          }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(7, 7, 15, 0.96)', backdropFilter: 'blur(25px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 499,
            paddingTop: 'calc(4rem + env(safe-area-inset-top))',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
            animation: 'fadeIn 0.25s ease both',
          }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: 0, margin: 0, width: '100%' }}>
            {LINKS.map(({ label, path }) => {
              const active = pathname === path;
              return (
                <li key={path} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setMenuOpen(false); warpTo(path); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: active ? 'var(--text)' : 'var(--muted)',
                      fontSize: '1rem', letterSpacing: '.14em', textTransform: 'uppercase',
                      borderBottom: active ? '1px solid var(--rose)' : '1px solid transparent',
                      paddingBottom: 2,
                      minHeight: '44px',
                      padding: '10px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >{label}</button>
                </li>
              );
            })}
            <li style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { setMenuOpen(false); warpTo('/chat'); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '1rem', letterSpacing: '.14em',
                textTransform: 'uppercase',
                minHeight: '44px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>Client Portal</button>
            </li>
            <li style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { setMenuOpen(false); warpTo('/admin'); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '1rem', letterSpacing: '.14em',
                textTransform: 'uppercase',
                minHeight: '44px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>Admin</button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
