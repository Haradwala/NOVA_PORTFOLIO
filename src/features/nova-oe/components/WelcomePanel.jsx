/**
 * WelcomePanel.jsx
 * Left Welcome Panel Overlay for the NOVA Operating Environment.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { worldTimeline } from '../engine/WorldTimeline';

export default function WelcomePanel({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: '5rem', top: '32%', width: '28rem',
            display: 'flex', flexDirection: 'column', gap: '1.8rem',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
              letterSpacing: '0.3em', color: 'rgba(160, 180, 220, 0.5)',
              textTransform: 'uppercase', fontWeight: 600,
            }}>
              WELCOME TO
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: '4.5rem', lineHeight: '1.05', letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', margin: 0,
            }}>
              NOVA
            </h1>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem',
              letterSpacing: '0.22em', color: 'rgba(140, 165, 230, 0.55)',
              textTransform: 'uppercase', marginTop: '0.4rem',
            }}>
              AI OPERATING ENVIRONMENT
            </div>
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
            lineHeight: '1.6', color: 'rgba(180, 195, 225, 0.65)',
            letterSpacing: '0.02em', margin: 0,
          }}>
            I build intelligent systems and digital experiences that bridge the gap between human imagination and artificial intelligence.
          </p>

          <div>
            <button
              onClick={() => worldTimeline.seekTo(0.18)}
              style={{
                background: 'transparent', border: '1px solid rgba(165, 180, 252, 0.35)',
                borderRadius: '24px', padding: '0.75rem 2.0rem',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem',
                letterSpacing: '0.18em', color: '#a5b4fc', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                cursor: 'pointer', transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(165, 180, 252, 0.08)';
                e.target.style.borderColor = '#a5b4fc';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(165, 180, 252, 0.35)';
              }}
            >
              ENTER NOVA
              <span>→</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
