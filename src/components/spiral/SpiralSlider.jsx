/**
 * SpiralSlider.jsx
 *
 * 3D Spiral Project Navigator Component
 * Phase 2 Public Work Experience:
 *   PROJECTS → 3D SPIRAL NAVIGATOR → SELECT PROJECT → /work/:project
 *
 * Supports:
 *   - Dragging, wheel, touch swipe, keyboard arrow navigation
 *   - Direct click-to-navigate to /work/:project
 *   - Reduced-motion and non-WebGL accessible fallback grid
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SpiralScene from './SpiralScene';
import { PROJECTS_DATA } from '../../data/projectsData';

export default function SpiralSlider() {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(PROJECTS_DATA[0]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion (Section 23)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const handleSelectProject = useCallback(
    (project) => {
      if (!project || !project.slug) return;
      navigate(`/work/${project.slug}`);
    },
    [navigate]
  );

  // Non-3D Accessible Fallback (Section 23)
  if (prefersReducedMotion) {
    return (
      <div style={{ maxWidth: 1040, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Accessible Project Directory
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PROJECTS_DATA.map((proj) => (
            <div
              key={proj.slug}
              onClick={() => handleSelectProject(proj)}
              style={{
                background: '#0d1017',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  color: proj.color,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {proj.category} · {proj.year}
              </div>
              <h3
                style={{
                  fontFamily: "'Instrument Sans', 'Syne', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {proj.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem',
                  color: 'rgba(200, 205, 225, 0.75)',
                  lineHeight: 1.5,
                  margin: '0 0 1rem 0',
                }}
              >
                {proj.overview}
              </p>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.68rem',
                  color: proj.accentColor,
                  letterSpacing: '0.08em',
                }}
              >
                EXPLORE CASE STUDY →
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* 3D Helix Canvas Container */}
      <SpiralScene
        activeProjectSlug={activeProject.slug}
        onActiveProjectChange={setActiveProject}
        onSelectProject={handleSelectProject}
      />

      {/* Minimal Navigator Controls & Navigation Hint (Section 19) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem',
          padding: '0 0.75rem',
        }}
      >
        {/* Active Project Title with direct link to /work/:project */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => handleSelectProject(activeProject)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'Instrument Sans', 'Syne', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: 0,
            }}
          >
            <span>{activeProject.title}</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                color: activeProject.color,
                letterSpacing: '0.08em',
                border: `1px solid ${activeProject.color}40`,
                borderRadius: 4,
                padding: '0.15rem 0.45rem',
              }}
            >
              {activeProject.category}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>↗</span>
          </button>
        </div>

        {/* Small Project Navigation Hint (Section 19) */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span>Drag · Wheel · Arrow Keys to browse</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Click panel to open</span>
        </div>
      </div>

      {/* 8 Direct Project Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1.25rem',
          padding: '0.5rem 0',
        }}
      >
        {PROJECTS_DATA.map((proj) => {
          const isSelected = activeProject.slug === proj.slug;
          return (
            <button
              key={proj.slug}
              onClick={() => setActiveProject(proj)}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? `1px solid ${proj.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                fontWeight: isSelected ? 600 : 400,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                borderRadius: 20,
                transition: 'all 0.15s ease',
              }}
            >
              {proj.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
