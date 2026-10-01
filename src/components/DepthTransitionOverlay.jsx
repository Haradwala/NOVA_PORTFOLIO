/**
 * DepthTransitionOverlay.jsx
 *
 * Implements the signature "Depth" experience:
 * Transitioning from PORTFOLIO into ENGINEERING CORE.
 *
 * Visual metaphor:
 *   - Camera pushes through / interface separates into layers
 *   - Foreground portfolio elements move away into the distance
 *   - The hidden engineering systems layer emerges in full fidelity
 *   - Telemetry HUD and system lattice become the focal plane
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpiralSlider from './spiral/SpiralSlider';
import EngineeringCoreScene from './EngineeringCoreScene';
import SystemDeepDiveWorkbench from './SystemDeepDiveWorkbench';
import { ENGINEERING_SYSTEMS } from '../data/engineeringCore';

export default function DepthTransitionOverlay({ isOpen, onClose, initialSystemId = 'finance-manager' }) {
  const [selectedSystemId, setSelectedSystemId] = useState(initialSystemId);
  const [viewMode, setViewMode] = useState('spiral'); // 'spiral' | 'lattice'

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeSystem = ENGINEERING_SYSTEMS.find(s => s.id === selectedSystemId) || ENGINEERING_SYSTEMS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: '#07070F',
            backgroundImage: 'radial-gradient(ellipse 90% 70% at 50% 20%, rgba(139, 92, 246, 0.08) 0%, #07070F 75%)',
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Engineering Core Environment"
        >
          {/* Top Telemetry & Return Bar */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              padding: '1rem 1.5rem',
              borderRadius: 12,
              background: 'rgba(10, 10, 20, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#38BDF8',
                  boxShadow: '0 0 10px #38BDF8',
                }}
              />
              <div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    color: 'rgba(160, 160, 192, 0.6)',
                    textTransform: 'uppercase',
                  }}
                >
                  LAYER: ENGINEERING CORE // ARCHITECTURAL DEPTH
                </span>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#EEEEF5',
                  }}
                >
                  SHADAB HARADWALA — SYSTEMS
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 6,
                color: '#EEEEF5',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <span>←</span>
              <span>EXIT TO PORTFOLIO</span>
              <span style={{ fontSize: '0.58rem', opacity: 0.5 }}>[ESC]</span>
            </button>
          </div>

          {/* Core Content Container */}
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
            {/* Intro Title */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  color: '#38BDF8',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                // REVEALING THE HIDDEN LAYER
              </div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#EEEEF5',
                  margin: '0 0 1rem 0',
                }}
              >
                THE ENGINEERING CORE
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                  color: 'rgba(160, 160, 192, 0.85)',
                  maxWidth: 720,
                  margin: '0 auto',
                  lineHeight: 1.7,
                }}
              >
                Inspect the architectures, mathematical decisions, data flows, and test harnesses
                powering Finance Manager, Trading Intelligence, NOVA AI, and Forge IDE.
              </p>

              {/* View mode toggle */}
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.25rem',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  onClick={() => setViewMode('spiral')}
                  style={{
                    padding: '0.4rem 0.95rem',
                    borderRadius: 6,
                    background: viewMode === 'spiral' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'spiral' ? '#EEEEF5' : 'rgba(160, 160, 192, 0.6)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    fontWeight: viewMode === 'spiral' ? 600 : 400,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ✦ SPIRAL SLIDER
                </button>
                <button
                  onClick={() => setViewMode('lattice')}
                  style={{
                    padding: '0.4rem 0.95rem',
                    borderRadius: 6,
                    background: viewMode === 'lattice' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'lattice' ? '#EEEEF5' : 'rgba(160, 160, 192, 0.6)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    fontWeight: viewMode === 'lattice' ? 600 : 400,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ☍ TOPOLOGY LATTICE
                </button>
              </div>
            </div>

            {/* Primary View: Spiral Slider vs Secondary: Topology Lattice */}
            <div style={{ marginBottom: '3.5rem' }}>
              {viewMode === 'spiral' ? (
                <SpiralSlider
                  activeSystemId={selectedSystemId}
                  onSelectSystem={setSelectedSystemId}
                  onInspectSystem={(sysId) => {
                    setSelectedSystemId(sysId);
                    const el = document.getElementById('overlay-workbench');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              ) : (
                <EngineeringCoreScene
                  activeSystem={selectedSystemId}
                  onSelectSystem={setSelectedSystemId}
                />
              )}
            </div>

            {/* System Deep Dive Workbench */}
            <div id="overlay-workbench">
              <SystemDeepDiveWorkbench
                systemId={selectedSystemId}
                onSelectSystem={setSelectedSystemId}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
