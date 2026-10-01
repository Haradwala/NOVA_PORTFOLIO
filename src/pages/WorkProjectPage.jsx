/**
 * WorkProjectPage.jsx
 *
 * Public route component for /work/:project
 * Renders authentic case study and architecture overview for any of the 8 projects.
 */

import { useParams, Link } from 'react-router-dom';
import { PROJECTS_DATA } from '../data/projectsData';
import { CASE_STUDIES } from '../components/ProjectDeepDive';

export default function WorkProjectPage() {
  const { project: projectSlug } = useParams();

  // Find project in authoritative collection
  const project = PROJECTS_DATA.find((p) => p.slug === projectSlug || p.id === projectSlug);
  const caseStudy = CASE_STUDIES[projectSlug] || {};

  // Resolved metadata
  const title = project?.title || caseStudy?.title || (projectSlug ? projectSlug.replace(/-/g, ' ') : 'Project');
  const tag = project?.tag || caseStudy?.tag || 'Portfolio Project · 2026';
  const color = project?.color || caseStudy?.accent || '#8B5CF6';
  const accentColor = project?.accentColor || '#A78BFA';
  const overview = project?.overview || caseStudy?.overview || 'Comprehensive case study and system architecture details.';
  const challenge = project?.challenge || caseStudy?.challenge || 'Maintaining low latency, strict data integrity, and high-performance user experience.';
  const technologies = project?.technologies || caseStudy?.tech || ['React', 'TypeScript', 'Node.js'];
  const year = project?.year || '2026';
  const status = project?.status || 'Active';
  const metrics = caseStudy?.metrics || [
    { val: 'Production', lbl: 'Target' },
    { val: '60fps', lbl: 'Interactive' },
    { val: year, lbl: 'Release' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(5rem, 8vw, 7rem) 1.5rem',
        maxWidth: 960,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Back button */}
      <div style={{ marginBottom: '2.5rem' }}>
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
            color: 'var(--violet2)',
            textDecoration: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: 6,
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          ← Back to Spiral Navigator
        </Link>
      </div>

      {/* Project Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: accentColor,
            marginBottom: '0.75rem',
          }}
        >
          <span>{tag}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: '#EEEEEE' }}>{status}</span>
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 1.25rem 0',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
            lineHeight: 1.7,
            color: 'rgba(210, 215, 235, 0.9)',
            marginBottom: '2.5rem',
            maxWidth: 760,
          }}
        >
          {overview}
        </p>

        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.lbl}
              style={{
                padding: '1.25rem',
                borderRadius: 10,
                background: 'rgba(20, 22, 32, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Sans', 'Syne', sans-serif",
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: color,
                  marginBottom: '0.25rem',
                }}
              >
                {m.val}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.62rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(200, 200, 220, 0.6)',
                }}
              >
                {m.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Challenge Section */}
        <div
          style={{
            padding: '1.75rem',
            borderRadius: 12,
            background: 'rgba(14, 16, 26, 0.75)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.14em',
              color: 'var(--rose)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Engineering Challenge
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(215, 220, 240, 0.88)',
              margin: 0,
            }}
          >
            {challenge}
          </p>
        </div>

        {/* Technologies Grid */}
        {technologies && technologies.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.85rem',
              }}
            >
              Technologies & Infrastructure
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {technologies.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    padding: '0.35rem 0.8rem',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#EEEEF5',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
