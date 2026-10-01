/**
 * WorkProjectPage.jsx
 *
 * Public route component for /work/:project
 * Phase 1 clean placeholder & case study bridge.
 */

import { useParams, Link } from 'react-router-dom';
import { CASE_STUDIES } from '../components/ProjectDeepDive';

export default function WorkProjectPage() {
  const { project: projectId } = useParams();
  const caseStudy = CASE_STUDIES[projectId];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(5rem, 10vw, 7.5rem) 1.5rem',
        maxWidth: 960,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
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
          ← Back to Work
        </Link>
      </div>

      {caseStudy ? (
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--violet2)',
              marginBottom: '0.75rem',
            }}
          >
            {caseStudy.tag}
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 1.5rem 0',
              lineHeight: 1.1,
            }}
          >
            {caseStudy.title}
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
              lineHeight: 1.7,
              color: 'rgba(200, 200, 220, 0.9)',
              marginBottom: '2.5rem',
              maxWidth: 720,
            }}
          >
            {caseStudy.overview}
          </p>

          <div
            style={{
              padding: '1.75rem',
              borderRadius: 12,
              background: 'rgba(14, 10, 35, 0.55)',
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
              Architectural Challenge
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(200, 200, 220, 0.85)',
                margin: 0,
              }}
            >
              {caseStudy.challenge}
            </p>
          </div>

          {caseStudy.tech && (
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
                Technologies & Architecture
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {caseStudy.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 4,
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
      ) : (
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.75rem',
            }}
          >
            Project Case Study
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 1.25rem 0',
              textTransform: 'capitalize',
            }}
          >
            {projectId ? projectId.replace(/-/g, ' ') : 'Project'}
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1rem',
              color: 'var(--muted)',
              lineHeight: 1.7,
            }}
          >
            Case study overview and architecture documentation are being compiled for Phase 2.
          </p>
        </div>
      )}
    </div>
  );
}
