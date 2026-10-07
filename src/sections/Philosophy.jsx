/**
 * Philosophy.jsx — Engineering Philosophy
 *
 * Editorial layout: minimal, premium, quiet.
 * Componentry MagnetLines used as a barely-visible right-side accent.
 * NO dashboard cards. NO big card backgrounds.
 *
 * Layout:
 *   Left column: Section label → headline → body
 *   Right accent: Magnet Lines (decorative, non-dominant)
 *   Below: 4 editorial pillar rows (text-only, no card shells)
 */

import { useState, useEffect, useRef } from 'react';
import { registerSection, highlightSection } from '../utils/sectionRegistry';

const PHILOSOPHY_PILLARS = [
  {
    number: '01',
    statement: 'Autonomy over autocomplete.',
    detail:
      'Architecting systems that reason under uncertainty—from local-first agent workflows to full-duplex neural voice environments.',
  },
  {
    number: '02',
    statement: 'Deterministic by design.',
    detail:
      'Eliminating floating-point drift, bounding latency, and enforcing mathematical invariants across financial ledgers and distributed state machines.',
  },
  {
    number: '03',
    statement: 'Frictionless operational throughput.',
    detail:
      'Replacing fragile manual workflows with hardened autonomous pipelines—from real-time telemetry to multi-node logistics tracking.',
  },
  {
    number: '04',
    statement: 'Resilience as a first-order primitive.',
    detail:
      'Engineering software that operates predictably in hostile conditions: offline-tolerant sync, strict types, ACID compliance, verifiable audit trails.',
  },
];

export default function Philosophy() {
  const sectionRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
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

  const isMobile = windowWidth < 768;

  return (
    <section
      id="about"
      data-section="about"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: 'clamp(5rem, 10vw, 9rem) 1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >

      {/* ── Foreground Content ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 820 }}>

        {/* Section tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2.25rem',
          }}
        >
          <div style={{ width: 20, height: 1, background: '#A78BFA' }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.66rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#A78BFA',
            }}
          >
            02 // ENGINEERING PHILOSOPHY
          </span>
        </div>

        {/* Main Headline */}
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.6rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#EEEEF5',
            margin: '0 0 1.5rem 0',
          }}
        >
          I BUILD SYSTEMS,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 60%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NOT JUST INTERFACES.
          </span>
        </h2>

        {/* Lead Paragraph */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.96rem, 1.6vw, 1.1rem)',
            color: 'rgba(160, 160, 192, 0.8)',
            maxWidth: 680,
            lineHeight: 1.75,
            margin: '0 0 4rem 0',
          }}
        >
          Software must be reliable before it is clever, and robust before it is fast.
          My work bridges autonomous AI intelligence, resilient engineering systems, and real-time product architectures.
        </p>

        {/* Philosophy Pillars — editorial rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {PHILOSOPHY_PILLARS.map((item, i) => (
            <div
              key={item.number}
              style={{
                display: 'grid',
                gridTemplateColumns: '3rem 1fr',
                gap: '1.25rem',
                alignItems: 'start',
                padding: '1.5rem 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                borderBottom: i === PHILOSOPHY_PILLARS.length - 1
                  ? '1px solid rgba(255, 255, 255, 0.07)'
                  : 'none',
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.66rem',
                  color: 'rgba(167, 139, 250, 0.55)',
                  letterSpacing: '0.1em',
                  paddingTop: '0.2rem',
                  userSelect: 'none',
                }}
              >
                {item.number}
              </span>

              {/* Content */}
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
                    color: '#EEEEF5',
                    marginBottom: '0.35rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.statement}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.87rem',
                    lineHeight: 1.65,
                    color: 'rgba(150, 150, 185, 0.72)',
                    maxWidth: 580,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
