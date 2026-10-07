/**
 * Work.jsx
 *
 * Canonical project navigator using Componentry Spiral 3D Slider.
 * Renders on both homepage (/) and /work — same component, no duplication.
 *
 * Homepage flow:
 *   Hero → [Work / Spiral Navigator] → Philosophy → Contact
 *
 * /work route: full-page standalone spiral with minimal header.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Spiral3DSlider from '../components/ui/spiral-3d-slider';
import { SPIRAL_PROJECT_SLIDES } from '../data/projectsData';
import { registerSection } from '../utils/sectionRegistry';

export default function Work() {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionRef = useRef(null);
  const isWorkPage = location.pathname === '/work';

  const [activeSlide, setActiveSlide] = useState(SPIRAL_PROJECT_SLIDES[0]);

  useEffect(() => {
    const unregister = registerSection('work', sectionRef);
    if (window.__pendingScroll === 'work' || window.__pendingScroll === 'projects') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    return () => { unregister?.(); };
  }, []);

  const handleSelectSlide = useCallback((slide) => {
    if (slide?.slug) navigate(`/work/${slide.slug}`);
  }, [navigate]);

  const handleActiveSlideChange = useCallback((slide) => {
    if (slide) setActiveSlide(slide);
  }, []);

  // ── /work STANDALONE PAGE ──
  if (isWorkPage) {
    return (
      <section
        id="section-work"
        data-section="work"
        ref={sectionRef}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: 'calc(100vh - 5rem)',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '2rem',
          paddingBottom: '4rem',
        }}
      >
        {/* Minimal header */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.0,
            }}
          >
            WORK
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(0.82rem, 1.3vw, 0.96rem)',
              color: 'rgba(255, 255, 255, 0.45)',
              marginTop: '0.35rem',
              marginBottom: 0,
            }}
          >
            Selected projects I've built.
          </p>
        </div>

        <SpiralContainer
          activeSlide={activeSlide}
          onSelectSlide={handleSelectSlide}
          onActiveSlideChange={handleActiveSlideChange}
          className="min-h-[720px] sm:min-h-[780px] lg:min-h-[820px]"
        />
      </section>
    );
  }

  // ── HOMEPAGE (/) WORK SECTION ── Spiral is the canonical navigator
  return (
    <section
      id="section-work"
      data-section="work"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        background: 'transparent',
      }}
    >
      {/* Section label */}
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
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
            03 // SELECTED WORK
          </span>
          <div style={{ width: 20, height: 1, background: '#A78BFA' }} />
        </div>

        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          PROJECTS
        </h2>
      </div>

      <SpiralContainer
        activeSlide={activeSlide}
        onSelectSlide={handleSelectSlide}
        onActiveSlideChange={handleActiveSlideChange}
        className="min-h-[700px] sm:min-h-[760px] lg:min-h-[800px]"
      />
    </section>
  );
}

/**
 * Shared Spiral container — renders Componentry Spiral3DSlider
 * with active project label below.
 */
function SpiralContainer({ activeSlide, onSelectSlide, onActiveSlideChange, className }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 'min(92vw, 1380px)',
        margin: '0 auto',
        position: 'relative',
        background: 'transparent',
      }}
    >
      <Spiral3DSlider
        items={SPIRAL_PROJECT_SLIDES}
        autoRotate
        autoSpeed={0.13}
        cardWidth={380}
        cardAspectRatio={1.5}
        radius={340}
        verticalGap={92}
        className={className}
        onSelectSlide={onSelectSlide}
        onActiveSlideChange={onActiveSlideChange}
      />

      {activeSlide && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            padding: '0.4rem 0',
          }}
        >
          <Link
            to={`/work/${activeSlide.slug}`}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 55%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {activeSlide.title}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              · {activeSlide.category}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>↗</span>
          </Link>
        </div>
      )}
    </div>
  );
}
