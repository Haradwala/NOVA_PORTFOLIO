import { memo } from 'react';

export const PreviewCard = memo(function PreviewCard({ preview, onOpen }) {
  if (!preview) return null;
  const { data } = preview;

  return (
    <div
      style={{
        marginTop: '12px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(167, 139, 250, 0.25)',
        borderRadius: '10px',
        padding: '0.85rem',
        animation: 'fadeSlideUp 0.4s ease both',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Category Tag */}
      {data.category && (
        <span style={{
          fontSize: '0.52rem',
          letterSpacing: '0.08rem',
          textTransform: 'uppercase',
          color: 'var(--rose)',
          background: 'rgba(232, 149, 109, 0.08)',
          padding: '2px 8px',
          borderRadius: '50px',
          fontWeight: 'bold',
          display: 'inline-block',
          marginBottom: '8px'
        }}>
          {data.category}
        </span>
      )}

      {/* Tech stack badges */}
      {data.tech && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {data.tech.map(t => (
            <span key={t} style={{
              fontSize: '0.55rem',
              color: 'rgba(235, 235, 245, 0.7)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Features list */}
      {data.features && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
          {data.features.map(f => (
            <div key={f} style={{ fontSize: '0.68rem', color: 'rgba(235, 235, 245, 0.65)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#2DD4BF' }}>✔</span> {f}
            </div>
          ))}
        </div>
      )}

      {/* Categories for Skills toolkits */}
      {data.categories && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {data.categories.map(c => (
            <div key={c.name} style={{ fontSize: '0.68rem', color: 'rgba(235, 235, 245, 0.65)' }}>
              <strong style={{ color: 'var(--text)' }}>{c.name}:</strong> {c.techs.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Case Study alert */}
      {data.caseStudy && (
        <div style={{
          fontSize: '0.62rem',
          lineHeight: '1.4',
          color: 'rgba(232, 149, 109, 0.85)',
          background: 'rgba(232, 149, 109, 0.04)',
          borderLeft: '2.5px solid var(--rose)',
          padding: '6px 8px',
          borderRadius: '2px 6px 6px 2px',
          marginBottom: '12px',
          textAlign: 'left'
        }}>
          <strong>Insight:</strong> {data.caseStudy.title} &mdash; {data.caseStudy.solution}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onOpen(data.route, data.name)}
        style={{
          width: '100%',
          padding: '0.45rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(45, 212, 191, 0.15))',
          border: '1px solid rgba(167, 139, 250, 0.25)',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.55)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.28), rgba(45, 212, 191, 0.28))';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.25)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(45, 212, 191, 0.15))';
        }}
      >
        Launch Environment Node
      </button>
    </div>
  );
});
