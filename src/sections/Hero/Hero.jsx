import { useState, useEffect, useRef } from 'react';
import { useScene } from '../../features/scene-engine/SceneContext';
import MagnetLines from '../../components/ui/magnet-lines';

export default function Hero() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const sectionRef = useRef(null);

  // SceneContext registration for scroll tracking
  const { registerSection } = useScene();
  useEffect(() => {
    registerSection('arrival', sectionRef.current);
    return () => registerSection('arrival', null);
  }, [registerSection]);

  // Window resize listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;

  return (
    <section
      ref={sectionRef}
      id="arrival"
      data-section="arrival"
      style={{
        position: 'relative',
        isolation: 'isolate',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflowX: 'clip',
        paddingTop: isMobile ? '4.5rem' : '5rem',
        paddingBottom: isMobile ? '3rem' : '5rem',
      }}
    >
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(105%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroGridReveal {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes headlineSheen {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scrollPulse {
          0%   { transform: translateY(0); opacity: 0.25; }
          50%  { transform: translateY(6px); opacity: 0.95; }
          100% { transform: translateY(0); opacity: 0.25; }
        }
        .hero-cta-primary:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.32) !important;
          color: #FFFFFF !important;
        }
        .hero-cta-secondary:hover {
          background: rgba(139, 92, 246, 0.12) !important;
          border-color: rgba(167, 139, 250, 0.55) !important;
          color: #DDD6FE !important;
        }
        @media (max-width: 860px) {
          .hero-inner {
            padding: 0 1.5rem !important;
          }
          .hero-name-display {
            font-size: clamp(2.1rem, 8vw, 3.4rem) !important;
            line-height: 0.96 !important;
            white-space: nowrap !important;
          }
          .hero-statement {
            font-size: clamp(1.1rem, 4.5vw, 1.5rem) !important;
          }
          .hero-cta-row {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 280px !important;
          }
          .hero-cta-primary,
          .hero-cta-secondary {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-grid-wrapper,
          .hero-eyebrow,
          .hero-title-line-1,
          .hero-title-line-2,
          .hero-statement-wrapper,
          .hero-copy,
          .hero-cta-row,
          .hero-scroll-cue,
          .hero-scroll-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hero-name-gradient {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── LAYER 1 (z-0): Existing space background (stars etc.) — pointer-events: none ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── LAYER 2 (z-10): MagnetLines decorative interactive layer ── */}
      <div
        aria-hidden="true"
        className="hero-grid-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          overflow: 'hidden',
          animation: 'heroGridReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
        }}
      >
        <MagnetLines
          rows={isMobile ? 12 : isTablet ? 10 : 9}
          columns={isMobile ? 8 : isTablet ? 11 : 14}
          containerSize="100%"
          style={{ width: '100%', height: '100%' }}
          lineWidth={isMobile ? '4.5px' : '5.5px'}
          lineHeight={isMobile ? '38px' : '58px'}
          baseAngle={0}
        />
      </div>

      {/* ── LAYER 2.5 (z-14): Soft dark scrim behind text block for maximum readability ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 14,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 68% 62% at 30% 46%, rgba(5, 5, 12, 0.85) 0%, rgba(5, 5, 12, 0.65) 45%, rgba(5, 5, 12, 0) 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
        }}
      />

      {/* ── LAYER 2.6 (z-16): Subtle edge vignette ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 16,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(3, 3, 8, 0.6) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
        }}
      />

      {/* ── LAYER 2.7 (z-17): Faint cinematic grain overlay (3.5% opacity) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 17,
          pointerEvents: 'none',
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
        }}
      />

      {/* ── LAYER 2.8 (z-18): Subtle bottom edge transition gradient into shared universe ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '24%',
          maxHeight: 220,
          zIndex: 18,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(11, 11, 16, 0.15) 50%, rgba(11, 11, 16, 0.7) 100%)',
        }}
      />

      {/* ── LAYER 3 (z-20): Editorial Typography Content (Staged Reveal) ── */}
      <div
        className="hero-inner"
        style={{
          position: 'relative',
          zIndex: 20,
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 5.5vw, 4.5rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {/* Eyebrow */}
        <div
          className="hero-eyebrow"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.62rem, 1.1vw, 0.74rem)',
            letterSpacing: '0.22em',
            color: 'rgba(196, 181, 253, 0.95)',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
            animation: 'heroFadeIn 0.6s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both',
            opacity: 0,
          }}
        >
          AI ENGINEER&nbsp;·&nbsp;SOFTWARE ENGINEER&nbsp;·&nbsp;SYSTEM BUILDER
        </div>

        {/* Name — fitted completely within viewport with staged mask reveals */}
        <div style={{ marginBottom: '1.35rem' }}>
          <h1
            className="hero-name-display"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.75rem, 6.2vw, 5.2rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: 'var(--text, #EEEEF5)',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Line 1: SHADAB with mask reveal */}
            <div style={{ overflow: 'hidden' }}>
              <div
                className="hero-title-line-1"
                style={{
                  animation:
                    'heroSlideUp 0.75s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
                  opacity: 0,
                }}
              >
                SHADAB
              </div>
            </div>

            {/* Line 2: HARADWALA with mask reveal, smooth extended gradient, and subtle sheen */}
            <div style={{ overflow: 'hidden', marginTop: '0.08em' }}>
              <div
                className="hero-title-line-2"
                style={{
                  animation:
                    'heroSlideUp 0.75s 0.30s cubic-bezier(0.16, 1, 0.3, 1) both',
                  opacity: 0,
                }}
              >
                <span
                  className="hero-name-gradient"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 15%, #C4B5FD 40%, #A78BFA 65%, #38BDF8 90%, #C4B5FD 100%)',
                    backgroundSize: '220% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'headlineSheen 7s ease-in-out infinite',
                    display: 'inline-block',
                  }}
                >
                  HARADWALA
                </span>
              </div>
            </div>
          </h1>
        </div>

        {/* Statement line with mask reveal */}
        <div style={{ overflow: 'hidden', marginBottom: '1.1rem' }}>
          <div
            className="hero-statement-wrapper"
            style={{
              animation:
                'heroSlideUp 0.7s 0.42s cubic-bezier(0.16, 1, 0.3, 1) both',
              opacity: 0,
            }}
          >
            <p
              className="hero-statement"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(1.15rem, 2.3vw, 1.85rem)',
                lineHeight: 1.2,
                letterSpacing: '-0.015em',
                color: '#F4F4F8',
                margin: 0,
                maxWidth: '580px',
              }}
            >
              I BUILD INTELLIGENT<br />SOFTWARE SYSTEMS.
            </p>
          </div>
        </div>

        {/* Supporting Copy */}
        <p
          className="hero-copy"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.88rem, 1.3vw, 1rem)',
            color: 'rgba(160, 160, 192, 0.78)',
            lineHeight: 1.65,
            maxWidth: '460px',
            margin: '0 0 2.4rem 0',
            animation: 'heroFadeIn 0.65s 0.54s ease both',
            opacity: 0,
          }}
        >
          AI systems, financial software, automation, and experimental interfaces.
        </p>

        {/* CTA Buttons */}
        <div
          className="hero-cta-row"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            animation: 'heroFadeIn 0.6s 0.66s ease both',
            opacity: 0,
          }}
        >
          <button
            className="hero-cta-primary"
            onClick={() => {
              const el =
                document.getElementById('section-work') ||
                document.querySelector('[data-section="work"]');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '0.85rem 1.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '4px',
              color: '#EEEEF5',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            VIEW SELECTED WORK
          </button>

          <button
            className="hero-cta-secondary"
            onClick={() => {
              const el =
                document.getElementById('about') ||
                document.querySelector('[data-section="about"]');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '0.85rem 1.85rem',
              background: 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.32)',
              borderRadius: '4px',
              color: 'rgba(167, 139, 250, 0.9)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ABOUT ME
          </button>
        </div>
      </div>

      {/* ── Scroll Indicator: anchored to bottom of hero viewport ── */}
      <div
        className="hero-scroll-cue"
        style={{
          position: 'absolute',
          bottom: '32px',
          left: 'clamp(1.5rem, 5.5vw, 4.5rem)',
          zIndex: 25,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.65rem',
          animation: 'heroFadeIn 0.6s 0.78s ease both',
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.58rem',
            letterSpacing: '0.22em',
            color: 'rgba(238, 238, 245, 0.62)',
            textTransform: 'uppercase',
          }}
        >
          SCROLL TO EXPLORE
        </span>
        <div
          className="hero-scroll-line"
          style={{
            width: 1,
            height: 32,
            background:
              'linear-gradient(to bottom, rgba(167, 139, 250, 0.8), transparent)',
            animation: 'scrollPulse 2.4s ease-in-out infinite',
          }}
        />
      </div>
    </section>
  );
}
