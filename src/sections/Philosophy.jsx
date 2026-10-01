/**
 * Philosophy.jsx — Section 02: Systems Engineering Philosophy
 *
 * "I don't just build interfaces. I build systems."
 *
 * Communicates the foundational worldview:
 * The visible frontend layer is only an entry point into the resilient
 * distributed, quantitative, and autonomous systems operating behind it.
 */

import { PHILOSOPHY_POINTS } from '../data/engineeringCore';

export default function Philosophy({ onEnterCore }) {
  return (
    <section
      id="philosophy"
      data-section="philosophy"
      style={{
        padding: 'clamp(5rem, 10vw, 8.5rem) 1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Editorial Section Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ width: 24, height: 1, background: 'var(--violet2)' }} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--violet2)',
          }}
        >
          02 // ENGINEERING PHILOSOPHY
        </span>
      </div>

      {/* Main Philosophy Headline */}
      <div style={{ marginBottom: '3.5rem' }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 5.5vw, 4.4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#EEEEF5',
            margin: '0 0 1.25rem 0',
            maxWidth: 900,
          }}
        >
          I DON'T JUST BUILD INTERFACES.<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 60%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            I BUILD SYSTEMS.
          </span>
        </h2>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: 'rgba(160, 160, 192, 0.85)',
            maxWidth: 680,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          The surface of software is visual. The foundation of software is architectural invariants,
          numerical correctness, latency bounds, and causal state transitions.
        </p>
      </div>

      {/* The 3 Core Pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem',
        }}
      >
        {PHILOSOPHY_POINTS.map((item) => (
          <div
            key={item.number}
            style={{
              background: 'rgba(15, 15, 25, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '2rem',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--violet2)',
                  letterSpacing: '0.14em',
                  marginBottom: '1rem',
                }}
              >
                // {item.number} — {item.title}
              </div>

              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '1.18rem',
                  fontWeight: 700,
                  color: '#EEEEF5',
                  lineHeight: 1.35,
                  marginBottom: '1rem',
                }}
              >
                {item.statement}
              </h3>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: 'rgba(160, 160, 192, 0.75)',
                  margin: 0,
                }}
              >
                {item.detail}
              </p>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.62rem',
                color: 'rgba(160, 160, 192, 0.5)',
                letterSpacing: '0.08em',
              }}
            >
              ARCHITECTURAL PRINCIPLE
            </div>
          </div>
        ))}
      </div>

      {/* Visual System Depth Diagram Callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 16,
          padding: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.66rem',
              letterSpacing: '0.16em',
              color: 'var(--violet2)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            DUAL-LAYER ARCHITECTURE
          </div>
          <h4
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#EEEEF5',
              marginBottom: '0.75rem',
            }}
          >
            Ready to explore what lies behind the visible portfolio?
          </h4>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: 'rgba(200, 200, 220, 0.8)',
              margin: 0,
            }}
          >
            Transition into the Engineering Core to inspect the financial ledger engine, quantitative
            trading algorithms, NOVA AI pipelines, and the Forge IDE OS.
          </p>
        </div>

        <button
          onClick={onEnterCore}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(56, 189, 248, 0.25) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.5)',
            borderRadius: 6,
            color: '#FFFFFF',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.3)';
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
          ENTER THE ENGINEERING CORE →
        </button>
      </div>
    </section>
  );
}
