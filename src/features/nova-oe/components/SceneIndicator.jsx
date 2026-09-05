/**
 * SceneIndicator.jsx
 * Bottom Right Scene Indicator Overlay for the NOVA Operating Environment.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { HUD_CONFIG } from '../engine/WorldConfig';

export default function SceneIndicator({ activeSceneId }) {
  const labelObj = HUD_CONFIG.sceneLabels.find(l => l.id === activeSceneId);
  if (!labelObj || activeSceneId === 'arrival') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={labelObj.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: '3rem', right: '4rem',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem',
          pointerEvents: 'none', userSelect: 'none',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
          letterSpacing: '0.2em', color: 'rgba(160, 180, 220, 0.45)',
          textTransform: 'uppercase',
        }}>
          Current Module
        </div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700,
          fontSize: '1.1rem', letterSpacing: '0.05em', color: '#EEEEF5',
        }}>
          {labelObj.label}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
          letterSpacing: '0.15em', color: '#a5b4fc',
          textTransform: 'uppercase',
        }}>
          {labelObj.sub}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
