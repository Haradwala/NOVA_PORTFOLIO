/**
 * TopNavigation.jsx
 * Header Navigation Overlay for the NOVA Operating Environment.
 */

import { worldTimeline } from '../engine/WorldTimeline';

const NAV_ITEMS = ['Home', 'About', 'Skills', 'Projects', 'Experience', 'Contact'];
const NAV_TARGETS = [0.00, 0.18, 0.32, 0.46, 0.60, 0.74];

const getActiveNavIndex = (sceneId) => {
  switch (sceneId) {
    case 'arrival':    return 0;
    case 'identity':   return 1;
    case 'capability': return 2;
    case 'projects':   return 3;
    case 'timeline':   return 4;
    case 'archive':
    case 'terminal':   return 5;
    default:           return 0;
  }
};

export default function TopNavigation({ activeSceneId }) {
  const activeIdx = getActiveNavIndex(activeSceneId);

  return (
    <div style={{
      position: 'absolute', top: '2.5rem', left: '4rem', right: '4rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      pointerEvents: 'auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: '1.25rem', letterSpacing: '0.08em',
          background: 'linear-gradient(135deg, #d8e8ff 0%, #8090ff 60%, #e8956d 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          NOVA
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
          letterSpacing: '0.18em', color: 'rgba(140, 165, 230, 0.45)',
          textTransform: 'uppercase',
        }}>
          AI Operating Environment
        </div>
      </div>

      <div style={{
        display: 'flex', gap: '2.5rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem',
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        {NAV_ITEMS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => worldTimeline.seekTo(NAV_TARGETS[idx])}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: idx === activeIdx ? '#EEEEF5' : 'rgba(160, 180, 220, 0.45)',
              textDecoration: 'none', transition: 'color 0.25s ease',
              fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={{
        background: 'rgba(8, 12, 28, 0.45)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px',
        padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#4ade80', boxShadow: '0 0 8px #4ade80',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
            letterSpacing: '0.15em', color: '#4ade80', textTransform: 'uppercase', fontWeight: 700,
          }}>
            SYSTEM ONLINE
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.45rem',
            letterSpacing: '0.12em', color: 'rgba(160, 180, 220, 0.35)',
          }}>
            v2.0.0 | STABLE
          </div>
        </div>
      </div>
    </div>
  );
}
