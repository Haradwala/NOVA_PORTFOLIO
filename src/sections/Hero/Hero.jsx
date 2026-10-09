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
        overflow: 'hidden',
        overflowX: 'clip',
        maxWidth: '100%',
        paddingTop: '6rem',
        paddingBottom: '4.5rem',
      }}
    >
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
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
            font-size: clamp(2rem, 7.8vw, 3.4rem) !important;
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
        className="hero-magnet-lines-field"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          overflow: 'hidden',
          color: '#FFFFFF',
          opacity: 0.35,
          maskImage:
            'radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0.25) 0%, black 60%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0.25) 0%, black 60%)',
        }}
      >
        <MagnetLines
          rows={isMobile ? 12 : isTablet ? 10 : 9}
          columns={isMobile ? 8 : isTablet ? 11 : 14}
          containerSize="100%"
          style={{ width: '100%', height: '100%' }}
          lineColor="currentColor"
          lineWidth={isMobile ? '4.5px' : '5.5px'}
          lineHeight={isMobile ? '38px' : '58px'}
          baseAngle={0}
        />
      </div>

      {/* ── LAYER 3 (z-20): Hero text, buttons, nav content ── */}
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
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.62rem, 1.1vw, 0.74rem)',
            letterSpacing: '0.22em',
            color: 'rgba(167, 139, 250, 0.85)',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
            animation: 'heroFadeIn 0.6s 0.1s ease both',
            opacity: 0,
          }}
        >
          AI ENGINEER&nbsp;·&nbsp;SOFTWARE ENGINEER&nbsp;·&nbsp;SYSTEM BUILDER
        </div>

        {/* Name — fitted completely within viewport */}
        <div
          style={{
            animation: 'heroFadeUp 0.7s 0.25s ease both',
            opacity: 0,
            marginBottom: '1.35rem',
          }}
        >
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
            SHADAB<br />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 52%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HARADWALA
            </span>
          </h1>
        </div>

        {/* Statement line */}
        <div
          style={{
            animation: 'heroFadeUp 0.6s 0.45s ease both',
            opacity: 0,
            marginBottom: '1.1rem',
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

        {/* Supporting Copy */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.88rem, 1.3vw, 1rem)',
            color: 'rgba(160, 160, 192, 0.78)',
            lineHeight: 1.65,
            maxWidth: '460px',
            margin: '0 0 2.4rem 0',
            animation: 'heroFadeIn 0.6s 0.65s ease both',
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
            animation: 'heroFadeIn 0.5s 0.8s ease both',
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

        {/* Scroll Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginTop: '3.5rem',
            animation: 'heroFadeIn 0.5s 1.1s ease both',
            opacity: 0,
          }}
        >
          <div
            style={{
              width: 1,
              height: 30,
              background:
                'linear-gradient(to bottom, transparent, rgba(139,92,246,0.45))',
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              color: 'rgba(139, 92, 246, 0.45)',
              textTransform: 'uppercase',
            }}
          >
            SCROLL TO EXPLORE
          </span>
        </div>
      </div>
    </section>
  );
}
