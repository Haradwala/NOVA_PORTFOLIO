/**
 * Work.jsx
 *
 * Public Work Section & /work Experience.
 * Incorporates the Componentry Spiral 3D Slider for /work.
 *
 * Requirements:
 *   - /work page is minimal:
 *       WORK
 *       Selected projects I've built.
 *       [Componentry Spiral 3D Slider]
 *       Subtle selected project title below the spiral
 *   - No star field, no particles, no constellation lines, no space environment, no grid
 *   - Homepage (/) remains clean and does NOT render the heavy 3D spiral
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Spiral3DSlider from '../components/ui/spiral-3d-slider';
import { PROJECTS_DATA, SPIRAL_PROJECT_SLIDES } from '../data/projectsData';
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

    return () => {
      unregister?.();
    };
  }, []);

  const handleSelectSlide = useCallback(
    (slide) => {
      if (slide?.slug) {
        navigate(`/work/${slide.slug}`);
      }
    },
    [navigate]
  );

  const handleActiveSlideChange = useCallback((slide) => {
    if (slide) {
      setActiveSlide(slide);
    }
  }, []);

  // ── 1. DEDICATED /work PAGE (Componentry Spiral 3D Slider) ──
  if (isWorkPage) {
    return (
      <section
        id="section-work"
        data-section="work"
        ref={sectionRef}
        className="relative z-10 w-full min-h-[calc(100vh-5rem)] bg-black text-white flex flex-col justify-start items-center pt-2 pb-16 px-4"
        style={{ background: '#000000' }}
      >
        {/* Minimal Page Header */}
        <div className="text-center max-w-xl mx-auto mb-2 mt-2 select-none">
          <h1
            style={{
              fontFamily: "'Syne', -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            WORK
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)',
              color: 'rgba(255, 255, 255, 0.55)',
              marginTop: '0.4rem',
              marginBottom: 0,
            }}
          >
            Selected projects I've built.
          </p>
        </div>

        {/* Componentry Spiral 3D Slider Container */}
        <div className="w-full max-w-5xl mx-auto relative">
          <Spiral3DSlider
            items={SPIRAL_PROJECT_SLIDES}
            autoRotate
            autoSpeed={0.13}
            className="min-h-[720px]"
            onSelectSlide={handleSelectSlide}
            onActiveSlideChange={handleActiveSlideChange}
          />

          {/* Selected Project Title (subtle, below spiral) */}
          {activeSlide && (
            <div className="flex flex-col items-center justify-center text-center mt-2 select-none">
              <Link
                to={`/work/${activeSlide.slug}`}
                className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-white/[0.04]"
                style={{ textDecoration: 'none' }}
              >
                <span
                  style={{
                    fontFamily: "'Instrument Sans', 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                    letterSpacing: '-0.01em',
                    background: 'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 55%, #38BDF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {activeSlide.title}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  · {activeSlide.category}
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  className="group-hover:translate-x-0.5 group-hover:text-white"
                >
                  ↗
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── 2. HOMEPAGE (/) WORK SECTION: Minimalist Clean Grid ──
  return (
    <section
      id="section-work"
      data-section="work"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            margin: '0 0 0.5rem 0',
          }}
        >
          SELECTED WORK
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: '0 auto 1.5rem auto',
            maxWidth: 520,
          }}
        >
          Key software systems and digital platforms.
        </p>

        {/* CTA to 3D Spiral on /work */}
        <Link
          to="/work"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: 50,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>EXPLORE 3D SPIRAL NAVIGATOR</span>
          <span>↗</span>
        </Link>
      </div>

      {/* Clean authentic project grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {PROJECTS_DATA.map((p) => (
          <Link
            key={p.slug}
            to={`/work/${p.slug}`}
            style={{
              textDecoration: 'none',
              background: '#0d1017',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '100%', aspectRatio: '1.5', overflow: 'hidden', background: '#07090e' }}>
              <img
                src={`/projects/${p.slug}.svg`}
                alt={p.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.62rem',
                    color: p.color,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  {p.category} · {p.year}
                </div>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.82rem',
                    color: 'rgba(200, 205, 225, 0.7)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {p.overview}
                </p>
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    letterSpacing: '0.08em',
                  }}
                >
                  CASE STUDY
                </span>
                <span style={{ color: p.accentColor, fontSize: '0.85rem' }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
