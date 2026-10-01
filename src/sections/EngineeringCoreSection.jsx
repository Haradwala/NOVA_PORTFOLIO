/**
 * EngineeringCoreSection.jsx
 *
 * Sections 04 & 05 of the Master Architecture:
 * 04 — DISCOVER: THE ENGINEERING CORE
 *      Centerpiece: Spiral Slider (Physical mechanical spine)
 *      Secondary view: System Lattice (Network topology view)
 * 05 — SYSTEM DEEP DIVE WORKBENCH (Interactive architectural inspector & telemetry)
 */

import { useState } from 'react';
import SpiralSlider from '../components/spiral/SpiralSlider';
import EngineeringCoreScene from '../components/EngineeringCoreScene';
import SystemDeepDiveWorkbench from '../components/SystemDeepDiveWorkbench';

export default function EngineeringCoreSection({ initialSystemId = 'finance-manager' }) {
  const [selectedSystemId, setSelectedSystemId] = useState(initialSystemId);
  const [viewMode, setViewMode] = useState('spiral'); // 'spiral' | 'lattice'

  const handleSelectSystem = (sysId) => {
    setSelectedSystemId(sysId);
  };

  const handleInspectSystem = (sysId) => {
    setSelectedSystemId(sysId);
    // Smooth scroll down to workbench
    const workbenchEl = document.getElementById('system-deep-dive');
    if (workbenchEl) {
      workbenchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="engineering-core"
      data-section="engineering-core"
      style={{
        padding: 'clamp(5rem, 10vw, 8.5rem) 1.5rem',
        maxWidth: 1300,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── 04 // ENGINEERING CORE ── */}
      <div style={{ marginBottom: '4rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 24, height: 1, background: '#38BDF8' }} />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#38BDF8',
              }}
            >
              04 // ENGINEERING SYSTEMS
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 840, marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontFamily: "'Instrument Sans', 'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: '0 0 0.85rem 0',
            }}
          >
            SYSTEMS I BUILD.
          </h2>

          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Drag to rotate and screw through the 3D spiral. Select a system to inspect its architecture.
          </p>
        </div>

        {/* The 3D Spiral Slider */}
        <SpiralSlider
          activeSystemId={selectedSystemId}
          onSelectSystem={handleSelectSystem}
          onInspectSystem={handleInspectSystem}
        />
      </div>

      {/* ── 05 // SYSTEM DEEP DIVE WORKBENCH ── */}
      <div id="system-deep-dive" style={{ paddingTop: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ width: 24, height: 1, background: 'var(--violet2)' }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--violet2)',
            }}
          >
            05 // SYSTEM ARCHITECTURE & DECISION WORKBENCH
          </span>
        </div>

        <SystemDeepDiveWorkbench
          systemId={selectedSystemId}
          onSelectSystem={setSelectedSystemId}
        />
      </div>
    </section>
  );
}
