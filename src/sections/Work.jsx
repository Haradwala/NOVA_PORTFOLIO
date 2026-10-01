/**
 * Work.jsx
 *
 * Public Work Section & /work Experience
 * Phase 2 Specification:
 *   WORK
 *         [3D SPIRAL PROJECT NAVIGATOR]
 *   small project navigation hint
 *
 * The 3D Spiral is the hero of the Work page.
 */

import { useRef, useEffect } from 'react';
import SpiralSlider from '../components/spiral/SpiralSlider';
import { registerSection } from '../utils/sectionRegistry';

export default function Work() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const unregister = registerSection('work', sectionRef);
    if (window.__pendingScroll === 'work' || window.__pendingScroll === 'projects') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    return unregister;
  }, []);

  return (
    <section
      id="section-work"
      data-section="work"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(2rem, 5vw, 4rem) 1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Subtle background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(139, 92, 246, 0.04) 0%, rgba(5, 5, 5, 0.98) 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--violet2)',
              marginBottom: '0.5rem',
            }}
          >
            PORTFOLIO NAVIGATOR
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
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
        </div>

        {/* Hero 3D Spiral Project Navigator */}
        <SpiralSlider />
      </div>
    </section>
  );
}
