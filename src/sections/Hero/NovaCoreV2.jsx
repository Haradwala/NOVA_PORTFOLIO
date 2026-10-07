import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { NOVASceneV3 } from '../../features/nova-v3/components/NOVASceneV3';
import { useNOVAV3 } from '../../features/nova-v3/hooks/useNOVAV3';
import { useVoiceHalo } from './useVoiceHalo';

/** State-driven styling for the compact core wrapper */
const CORE_STATE_STYLES = {
  idle: {
    ring: 'rgba(167, 139, 250, 0.12)',
    glow: '0 0 35px rgba(139, 92, 246, 0.16)',
    cursor: 'pointer',
    scale: 'scale(1)',
  },
  hover: {
    ring: 'rgba(167, 139, 250, 0.38)',
    glow: '0 0 55px rgba(167, 139, 250, 0.3), 0 0 90px rgba(56, 189, 248, 0.18)',
    cursor: 'pointer',
    scale: 'scale(1.04)',
  },
  listening: {
    ring: 'rgba(232, 149, 109, 0.45)',
    glow: '0 0 55px rgba(232, 149, 109, 0.4), 0 0 90px rgba(232, 149, 109, 0.18)',
    cursor: 'pointer',
    scale: 'scale(1.03)',
  },
  thinking: {
    ring: 'rgba(45, 212, 191, 0.38)',
    glow: '0 0 50px rgba(45, 212, 191, 0.3), 0 0 80px rgba(139, 92, 246, 0.18)',
    cursor: 'pointer',
    scale: 'scale(0.99)',
  },
  speaking: {
    ring: 'rgba(56, 189, 248, 0.45)',
    glow: '0 0 65px rgba(45, 212, 191, 0.4), 0 0 100px rgba(56, 189, 248, 0.22)',
    cursor: 'pointer',
    scale: 'scale(1.03)',
  },
};

/** Expanding pulse ring that fires when entering listening state */
function PulseRing({ active }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '-8px',
        borderRadius: '50%',
        border: '1.5px solid rgba(232, 149, 109, 0.45)',
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        animation: active ? 'compactNovaPulseRing 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}

export default function NovaCoreV2({
  duplexState = 'idle',
  onCoreClick,
  size = 240,
  isActive = false,
  className = '',
  style = {},
}) {
  const [hovered, setHovered] = useState(false);
  const visualKey = hovered && duplexState === 'idle' ? 'hover' : duplexState;
  const stateStyle = CORE_STATE_STYLES[visualKey] || CORE_STATE_STYLES.idle;

  const { stateRef, setState, setVoiceAmplitude } = useNOVAV3();

  // Voice halo hook links duplex state to the 3D sphere shaders & vertex noise
  useVoiceHalo({
    duplexState,
    setState,
    setVoiceAmplitude,
  });

  return (
    <>
      <style>{`
        @keyframes compactNovaPulseRing {
          0%   { transform: scale(0.92); opacity: 0.85; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes compactNovaBreath {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.02); }
        }
      `}</style>

      <div
        className={`compact-nova-container ${className}`}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {/* Ambient background soft glow */}
        <div
          style={{
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: '50%',
            background: duplexState === 'listening'
              ? 'radial-gradient(circle, rgba(232,149,109,0.16) 0%, rgba(232,149,109,0) 70%)'
              : duplexState === 'speaking'
              ? 'radial-gradient(circle, rgba(45,212,191,0.16) 0%, rgba(56,189,248,0) 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(56,189,248,0.05) 45%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
            animation: 'compactNovaBreath 6s ease-in-out infinite',
            transition: 'background 0.5s ease',
          }}
        />

        {/* ── Clickable Core Orb ── */}
        <div
          onClick={onCoreClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          role={onCoreClick ? 'button' : undefined}
          tabIndex={onCoreClick ? 0 : undefined}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onCoreClick) {
              e.preventDefault();
              onCoreClick();
            }
          }}
          aria-label="Interact with NOVA"
          style={{
            position: 'relative',
            zIndex: 3,
            width: size,
            height: size,
            cursor: stateStyle.cursor,
            transform: `${stateStyle.scale} ${isActive ? 'scale(1.06)' : ''}`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.35s ease',
            filter: `drop-shadow(${stateStyle.glow.replace(/box-shadow:|;/g, '')})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pulse ring when listening */}
          <PulseRing active={duplexState === 'listening'} />

          {/* Interactive thin border halo ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: `1px solid ${stateStyle.ring}`,
              pointerEvents: 'none',
              transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
              boxShadow: hovered
                ? '0 0 20px rgba(167, 139, 250, 0.2)'
                : 'none',
            }}
          />

          {/* Three.js Canvas */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            <Canvas
              camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 3.6] }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1]}
            >
              <NOVASceneV3 novaRef={stateRef} />
            </Canvas>
          </div>
        </div>
      </div>
    </>
  );
}
