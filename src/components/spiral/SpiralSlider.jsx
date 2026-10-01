/**
 * SpiralSlider.jsx
 *
 * Simple, elegant 3D spiral slider component.
 * Acts as a visual navigation component leading to the project deep-dive below.
 */

import { useState, useEffect, useCallback } from 'react';
import SpiralScene from './SpiralScene';
import { SPIRAL_CONFIG } from './spiralConfig';

export default function SpiralSlider({
  activeSystemId,
  onSelectSystem,
  onInspectSystem,
}) {
  const initialDest =
    SPIRAL_CONFIG.destinations.find((d) => d.systemId === activeSystemId) ||
    SPIRAL_CONFIG.destinations[0];

  const [activePanelIndex, setActivePanelIndex] = useState(initialDest.panelIndex);

  // Sync if external activeSystemId changes
  useEffect(() => {
    if (!activeSystemId) return;
    const matched = SPIRAL_CONFIG.destinations.find((d) => d.systemId === activeSystemId);
    if (matched && matched.panelIndex !== activePanelIndex) {
      setActivePanelIndex(matched.panelIndex);
    }
  }, [activeSystemId]);

  // Active destination
  const activeDest =
    SPIRAL_CONFIG.destinations.find((d) => d.panelIndex === activePanelIndex) ||
    SPIRAL_CONFIG.destinations.reduce((prev, curr) =>
      Math.abs(curr.panelIndex - activePanelIndex) < Math.abs(prev.panelIndex - activePanelIndex) ? curr : prev
    );

  const handleSelectDestination = useCallback(
    (dest) => {
      setActivePanelIndex(dest.panelIndex);
      if (dest.systemId && onSelectSystem) {
        onSelectSystem(dest.systemId);
      }
    },
    [onSelectSystem]
  );

  // Keyboard navigation: Arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        const dests = SPIRAL_CONFIG.destinations;
        const currIdx = dests.findIndex((d) => d.panelIndex === activeDest.panelIndex);
        const nextIdx = (currIdx + 1) % dests.length;
        handleSelectDestination(dests[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const dests = SPIRAL_CONFIG.destinations;
        const currIdx = dests.findIndex((d) => d.panelIndex === activeDest.panelIndex);
        const prevIdx = (currIdx - 1 + dests.length) % dests.length;
        handleSelectDestination(dests[prevIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDest, handleSelectDestination]);

  const handleOpenDetail = () => {
    if (activeDest && activeDest.systemId) {
      if (onSelectSystem) onSelectSystem(activeDest.systemId);
      if (onInspectSystem) onInspectSystem(activeDest.systemId);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* 3D Helix Scene */}
      <SpiralScene
        activePanelIndex={activePanelIndex}
        onActivePanelChange={setActivePanelIndex}
        onSelectDestination={handleSelectDestination}
      />

      {/* Minimal Footer: Active Panel Label & Direct Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1.25rem',
          padding: '0 0.5rem',
        }}
      >
        {/* Active System Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleOpenDetail}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: 0,
            }}
          >
            <span>{activeDest.label}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>↓</span>
          </button>
        </div>

        {/* 4 Clean System Selectors */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {SPIRAL_CONFIG.destinations.map((dest) => {
            const isSelected = activeDest.id === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 600 : 400,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  padding: '0.2rem 0',
                  borderBottom: isSelected ? '1px solid #FFFFFF' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {dest.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
