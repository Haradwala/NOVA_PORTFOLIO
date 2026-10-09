/**
 * Philosophy.jsx — Engineering Philosophy
 *
 * Editorial layout: minimal, premium, quiet.
 * 2-column layout on desktop (~7/5 ratio):
 *   Left column: Section label → Headline → Body paragraph
 *   Right column: 4 editorial pillar items (statement + detail)
 *
 * Starfield canvas shines through continuously from the shared background.
 */

import { useState, useEffect, useRef } from 'react';
import { registerSection, highlightSection } from '../utils/sectionRegistry';
import { useScene } from '../features/scene-engine/SceneContext';

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
  const [inView, setInView] = useState(false);

  // SceneContext registration for universe starfield continuity
  const { registerSection: registerSceneSection } = useScene();
  useEffect(() => {
    registerSceneSection?.('philosophy', sectionRef.current);
    return () => registerSceneSection?.('philosophy', null);
  }, [registerSceneSection]);

  // Section registry for navigation
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

  // IntersectionObserver for 1-time scroll entrance reveal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isMobile = windowWidth < 768;

  return (
    <section
      id="about"
      data-section="about"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 10,
        background: 'transparent',
        paddingTop: isMobile ? '0.35rem' : 'clamp(1.25rem, 2.5vh, 2rem)',
        paddingBottom: 'clamp(4rem, 8vw, 7rem)',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        maxWidth: 1240,
        margin: '0 auto',
        overflowX: 'clip',
      }}
    >
      <style>{`
        .phil-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .phil-reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .phil-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ── Thin Divider fading out at both ends above the section label ── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.08) 80%, transparent 100%)',
          marginBottom: isMobile ? '0.85rem' : '1.75rem',
        }}
      />

      {/* ── Two-Column Layout (Desktop ~7/5, collapsing on mobile/tablet) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1.25fr 1fr' : '1fr',
          gap: isDesktop ? 'clamp(3rem, 5.5vw, 5rem)' : '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT COLUMN: Label, Headline, Paragraph ── */}
        <div>
          {/* Section tag */}
          <div
            className={`phil-reveal ${inView ? 'in-view' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.75rem',
              transitionDelay: '0ms',
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

          {/* Main Headline (56-72% of Hero name size) */}
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 3.8vw, 3.35rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#EEEEF5',
              margin: '0 0 1.5rem 0',
            }}
          >
            <div
              className={`phil-reveal ${inView ? 'in-view' : ''}`}
              style={{ transitionDelay: '100ms' }}
            >
              I BUILD SYSTEMS,
            </div>
            <div
              className={`phil-reveal ${inView ? 'in-view' : ''}`}
              style={{ transitionDelay: '200ms', marginTop: '0.15em' }}
            >
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 60%, #38BDF8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
              >
                NOT JUST INTERFACES.
              </span>
            </div>
          </h2>

          {/* Lead Paragraph */}
          <p
            className={`phil-reveal ${inView ? 'in-view' : ''}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
              color: 'rgba(215, 215, 235, 0.88)',
              maxWidth: '60ch',
              lineHeight: 1.7,
              margin: 0,
              transitionDelay: '300ms',
            }}
          >
            Software must be reliable before it is clever, and robust before it is fast.
            My work bridges autonomous AI intelligence, resilient engineering systems, and real-time product architectures.
          </p>
        </div>

        {/* ── RIGHT COLUMN: Editorial Pillar Rows ── */}
        <div
          className={`phil-reveal ${inView ? 'in-view' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            transitionDelay: '400ms',
          }}
        >
          {PHILOSOPHY_PILLARS.map((item, i) => (
            <div
              key={item.number}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.5rem 1fr',
                gap: '1rem',
                alignItems: 'start',
                padding: '1.25rem 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                borderBottom:
                  i === PHILOSOPHY_PILLARS.length - 1
                    ? '1px solid rgba(255, 255, 255, 0.07)'
                    : 'none',
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.66rem',
                  color: 'rgba(167, 139, 250, 0.65)',
                  letterSpacing: '0.1em',
                  paddingTop: '0.2rem',
                  userSelect: 'none',
                }}
              >
                {item.number}
              </span>

              {/* Statement & Detail */}
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
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
                    lineHeight: 1.6,
                    color: 'rgba(175, 175, 205, 0.78)',
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
