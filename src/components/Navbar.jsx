import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWarpTransition } from '../hooks/useWarpTransition';
import { scrollToSection } from '../utils/sectionRegistry';

const NAV_ITEMS = [
  { label: 'WORK',    sectionId: 'work',    path: '/work' },
  { label: 'ABOUT',   sectionId: 'about',   path: '/about' },
  { label: 'CONTACT', sectionId: 'contact', path: '/contact' },
];

export default function Navbar({ onAskNova }) {
  const { warpTo }   = useWarpTransition();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('arrival');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Track active section on scroll when on home page
  useEffect(() => {
    if (pathname !== '/') return;

    const handleScroll = () => {
      const sections = ['work', 'about', 'contact'];
      const scrollY = window.scrollY + 250;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]) || document.getElementById(`section-${sections[i]}`) || document.querySelector(`[data-section="${sections[i]}"]`);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i]);
          return;
        }
      }
      setActiveSection('arrival');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNavClick = (item) => {
    setMenuOpen(false);
    if (pathname === '/') {
      const scrolled = scrollToSection(item.sectionId);
      if (!scrolled) {
        const el = document.getElementById(item.sectionId) || document.getElementById(`section-${item.sectionId}`) || document.querySelector(`[data-section="${item.sectionId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.__pendingScroll = item.sectionId;
      warpTo('/');
    }
  };

  const renderAskNova = (className) => (
    <button
      onClick={onAskNova}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.5rem',
        padding: '.45rem 1.1rem',
        borderRadius: 50,
        background: 'rgba(139,92,246,.12)',
        border: '1px solid rgba(139,92,246,.32)',
        color: 'var(--violet2)',
        fontSize: '.66rem',
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        transition: 'all .2s ease',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(139,92,246,.25)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,.35)';
        e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(139,92,246,.12)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(139,92,246,.32)';
      }}
    >
      ASK NOVA
    </button>
  );

  return (
    <nav
      className="nav-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 3rem',
        background: 'rgba(7, 7, 15, 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nav-container {
          padding-top: calc(0.9rem + env(safe-area-inset-top)) !important;
          padding-left: calc(2.5rem + env(safe-area-inset-left)) !important;
          padding-right: calc(2.5rem + env(safe-area-inset-right)) !important;
        }
        @media (max-width: 1024px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-container { 
            padding-top: calc(0.8rem + env(safe-area-inset-top)) !important;
            padding-left: calc(1.25rem + env(safe-area-inset-left)) !important;
            padding-right: calc(1.25rem + env(safe-area-inset-right)) !important;
            padding-bottom: 0.8rem !important;
          }
          .desktop-ask-nova { display: none !important; }
          .mobile-ask-nova { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu-overlay { display: none !important; }
          .mobile-ask-nova { display: none !important; }
        }
      `}</style>

      {/* Brand Wordmark */}
      <button
        onClick={() => {
          setMenuOpen(false);
          if (pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            warpTo('/');
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: 0,
        }}
      >
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: '1.15rem',
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}>
          SHADAB
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          color: 'var(--rose)',
          padding: '2px 7px',
          borderRadius: 4,
          background: 'rgba(232,149,109,0.1)',
          border: '1px solid rgba(232,149,109,0.25)',
        }}>
          // NOVA
        </span>
      </button>

      {/* Desktop Links: WORK, ABOUT, CONTACT */}
      <ul
        className="nav-links"
        style={{
          display: 'flex',
          gap: '1.8rem',
          listStyle: 'none',
          alignItems: 'center',
          margin: 0,
          padding: 0,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && activeSection === item.sectionId);
          return (
            <li key={item.sectionId}>
              <button
                onClick={() => handleNavClick(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  fontSize: '.68rem',
                  letterSpacing: '.14em',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  transition: 'all .2s ease',
                  padding: '4px 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                {isActive && (
                  <span style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--rose)',
                    boxShadow: '0 0 6px var(--rose)',
                    display: 'inline-block',
                  }} />
                )}
                {item.label}
              </button>
            </li>
          );
        })}

        {/* Separator */}
        <div style={{ width: 1, height: 16, background: 'rgba(139,92,246,0.25)', margin: '0 0.2rem' }} />

        {/* Ask NOVA Button */}
        <li>
          {renderAskNova("desktop-ask-nova")}
        </li>
      </ul>

      {/* Mobile Actions Container */}
      <div style={{ display: 'none', alignItems: 'center', gap: '0.6rem' }} className="mobile-menu-btn">
        {renderAskNova("mobile-ask-nova")}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={(e) => {
            if (!e.target.closest('button')) {
              setMenuOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(7, 7, 15, 0.97)',
            backdropFilter: 'blur(28px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 499,
            paddingTop: 'calc(4rem + env(safe-area-inset-top))',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
            animation: 'fadeIn 0.25s ease both',
          }}
        >
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: 0, margin: 0, width: '100%' }}>
            {NAV_ITEMS.map((item) => (
              <li key={item.sectionId} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => handleNavClick(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: '1.1rem',
                    letterSpacing: '.16em',
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                    padding: '10px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
