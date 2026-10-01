/**
 * Philosophy.jsx — Engineering Philosophy with Componentry Magnet Lines
 *
 * Implements the Engineering Philosophy section acting as the intentional transition
 * between introduction/about content and the project showcase.
 *
 * Visual Stack:
 *   - Background: Existing subtle stars (CinematicUniverseCanvas at z-index 0)
 *   - Middle: Very subtle Magnet Lines (z-index 1, interactive background effect)
 *   - Foreground: Editorial philosophy typography & 4 core pillars (z-index 10)
 */

import { useState, useEffect, useRef } from 'react';
import MagnetLines from '../components/ui/magnet-lines';
import { registerSection, highlightSection } from '../utils/sectionRegistry';

const PHILOSOPHY_PILLARS = [
  {
    number: '01',
    title: 'INTELLIGENT SOFTWARE & AI',
    statement: 'Autonomy over autocomplete.',
    detail: 'Architecting systems that reason under uncertainty—from local-first agent workflows to full-duplex neural voice environments and tool-augmented reasoning engines.',
    tag: 'AUTONOMOUS CORE',
  },
  {
    number: '02',
    title: 'ENGINEERING SYSTEMS & ARCHITECTURE',
    statement: 'Deterministic by design.',
    detail: 'Eliminating floating-point drift, bounding latency spikes, and enforcing mathematical invariants across financial ledgers, distributed state machines, and event streams.',
    tag: 'ARCHITECTURAL INVARIANTS',
  },
  {
    number: '03',
    title: 'AUTOMATION & OPERATIONAL CORES',
    statement: 'Frictionless operational throughput.',
    detail: 'Replacing fragile manual workflows with hardened autonomous pipelines—from real-time workshop telemetry and OCR extraction to multi-node logistics tracking.',
    tag: 'SYSTEM AUTOMATION',
  },
  {
    number: '04',
    title: 'RELIABLE SOFTWARE & SCALE',
    statement: 'Resilience as a first-order primitive.',
    detail: 'Engineering software that operates predictably in hostile conditions: offline-tolerant data sync, strict type guarantees, ACID compliance, and verifiable audit trails.',
    tag: 'DETERMINISTIC SCALE',
  },
];

export default function Philosophy() {
  const sectionRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    // Register for both 'about' and 'philosophy' so nav links smoothly scroll here
    const unregisterAbout = registerSection('about', sectionRef);
    const unregisterPhil = registerSection('philosophy', sectionRef);

    if (window.__pendingScroll === 'about' || window.__pendingScroll === 'philosophy') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.__pendingHighlight === 'about') {
          window.__pendingHighlight = null;
          highlightSection('about');
        }
      }, 350);
    }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      unregisterAbout?.();
      unregisterPhil?.();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Responsive Magnet Lines parameters
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const gridRows = isMobile ? 5 : isTablet ? 7 : 9;
  const gridCols = isMobile ? 5 : isTablet ? 7 : 9;
  const containerSize = isMobile ? '75vmin' : isTablet ? '65vmin' : '70vmin';
  const lineWidth = isMobile ? '0.3vmin' : '0.35vmin';
  const lineHeight = isMobile ? '2.5vmin' : isTablet ? '3vmin' : '3.5vmin';

  return (
    <section
      id="about"
      data-section="about"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: 'clamp(5rem, 10vw, 8.5rem) 1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* ── MIDDLE LAYER: Componentry Magnet Lines Background Effect ── */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.9,
        }}
        aria-hidden="true"
      >
        <MagnetLines
          rows={gridRows}
          columns={gridCols}
          containerSize={containerSize}
          lineColor="rgba(255, 255, 255, 0.10)"
          lineWidth={lineWidth}
          lineHeight={lineHeight}
          baseAngle={0}
        />
      </div>

      {/* ── FOREGROUND LAYER: Engineering Philosophy Typography & Pillars ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Editorial Section Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ width: 24, height: 1, background: '#A78BFA' }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#A78BFA',
            }}
          >
            ABOUT // ENGINEERING PHILOSOPHY
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
              maxWidth: 720,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Software must be reliable before it is clever, and robust before it is fast.
            My work bridges autonomous AI intelligence, resilient engineering systems, and real-time product architectures.
          </p>
        </div>

        {/* The 4 Core Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {PHILOSOPHY_PILLARS.map((item) => (
            <div
              key={item.number}
              style={{
                background: 'rgba(10, 10, 18, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '1.75rem',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.25s ease, transform 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#A78BFA',
                    letterSpacing: '0.14em',
                    marginBottom: '0.85rem',
                  }}
                >
                  // {item.number} — {item.title}
                </div>

                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#EEEEF5',
                    lineHeight: 1.35,
                    marginBottom: '0.75rem',
                  }}
                >
                  {item.statement}
                </h3>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    color: 'rgba(160, 160, 192, 0.8)',
                    margin: 0,
                  }}
                >
                  {item.detail}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.62rem',
                  color: 'rgba(160, 160, 192, 0.5)',
                  letterSpacing: '0.08em',
                }}
              >
                {item.tag}
              </div>
            </div>
          ))}
        </div>

        {/* Editorial Transition into Work / Project Spiral */}
        <div
          style={{
            background: 'rgba(15, 12, 28, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '2rem 2.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.66rem',
                letterSpacing: '0.16em',
                color: '#A78BFA',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              NEXT // PROJECT SHOWCASE
            </div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#EEEEF5',
              }}
            >
              Selected engineering systems & digital platforms.
            </div>
          </div>

          <button
            onClick={() => {
              const el =
                document.getElementById('section-work') ||
                document.querySelector('[data-section="work"]');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.4rem',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              borderRadius: 50,
              color: '#FFFFFF',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)';
            }}
          >
            <span>CONTINUE TO WORK</span>
            <span>↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
