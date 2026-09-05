/**
 * DiagnosticsPanel.jsx
 * Right AI Diagnostics Card Overlay for the NOVA Operating Environment.
 */

import { motion, AnimatePresence } from 'framer-motion';

export default function DiagnosticsPanel({ visible }) {
  const stats = [
    { label: 'Neural Networks', val: '100%' },
    { label: 'Systems',         val: '100%' },
    { label: 'Autonomy',        val: '98%' },
    { label: 'Learning',        val: '100%' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute', right: '5rem', top: '30%', width: '20rem',
            background: 'rgba(6, 8, 20, 0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px',
            padding: '2.0rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.6rem',
            pointerEvents: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: '0.85rem', letterSpacing: '0.15em', color: '#a5b4fc',
              textTransform: 'uppercase', margin: 0,
            }}>
              NOVA CORE
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'rgba(160, 180, 220, 0.45)' }}>⊙</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4ade80' }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
              letterSpacing: '0.18em', color: '#4ade80', textTransform: 'uppercase', fontWeight: 600,
            }}>
              STATUS: ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '0.4rem' }}>
            {stats.map((st, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem',
                  letterSpacing: '0.12em', color: 'rgba(180, 195, 225, 0.5)', textTransform: 'uppercase',
                }}>
                  {st.label}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem',
                  letterSpacing: '0.08em', color: '#EEEEF5', fontWeight: 600,
                }}>
                  {st.val}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem',
              letterSpacing: '0.12em', color: 'rgba(180, 195, 225, 0.5)', textTransform: 'uppercase',
            }}>
              Core Temp
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem',
              letterSpacing: '0.08em', color: '#EEEEF5', fontWeight: 600,
            }}>
              37.2°C
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
