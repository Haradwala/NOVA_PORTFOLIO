/**
 * CinematicUniverseCanvas.jsx — Phase 1: Shared Background WebGL Canvas
 *
 * Architecture & pointer-events contract:
 * ─────────────────────────────────────────────────────────────────────────────
 *  z-index: 0  → this canvas (environment background, pointer-events: none)
 *  z-index: 1  → vignette / CSS overlay divs
 *  z-index: 5  → NOVA Core Canvas (its own R3F context, inside Hero section)
 *  z-index: 5+ → all React UI overlays (nodes, chat panel, nav, etc.)
 *
 *  CRITICAL: This canvas must NEVER intercept mouse or touch events.
 *  It is decorated with pointer-events: none at both the wrapper div AND the
 *  R3F canvas element. Any future environment that needs interactivity should
 *  use invisible HTML overlay elements positioned above z-index 5.
 *
 * Renders:
 *  1. ArrivalObservatory when activeScene === 'arrival' (or while not scrolled)
 *  2. CameraController for the environment push-in entrance
 *  3. WebGL context-loss fallback: hides canvas and shows a CSS-only gradient
 *
 * Particle budgets (total across all environments, target ≤ 1000 per environment):
 *  - Desktop: 800 stars
 *  - Mobile:  220 stars
 *
 * This canvas does NOT merge with the NOVA Core Canvas.
 * Two separate canvases are used intentionally — merging would require
 * refactoring NovaCoreV2's camera/shader/state system, which is out of scope.
 */

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useScene } from './SceneContext';
import CameraController from './CameraController';
import ArrivalObservatory from './environments/ArrivalObservatory';
import IdentityChamber from './environments/IdentityChamber';
import CapabilitiesLab from './environments/CapabilitiesLab';

// CSS-only fallback gradient for when WebGL is unavailable
function WebGLFallback() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 65%), #07070F',
    }} />
  );
}

export default function CinematicUniverseCanvas() {
  const { qualityTier, reducedMotion, activeScene } = useScene();
  const canvasRef    = useRef(null);
  const [webGLOk, setWebGLOk] = useState(true);

  // ── WebGL context-loss handling ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Quick WebGL support probe
    try {
      const probe = document.createElement('canvas');
      const ctx   = probe.getContext('webgl') || probe.getContext('experimental-webgl');
      if (!ctx) { setWebGLOk(false); return; }
    } catch {
      setWebGLOk(false);
      return;
    }

    const onLost = () => setWebGLOk(false);
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, []);

  if (!webGLOk) return <WebGLFallback />;

  // Quality tier → pixel ratio cap
  const dprRange = qualityTier === 'mobile'
    ? [1, 1]
    : [1, Math.min(window.devicePixelRatio, 2)];

  return (
    /*
     * Wrapper div:
     *  - position: fixed so it covers the full viewport behind all content
     *  - z-index: 0 — sits below everything including the Core Canvas (z:5)
     *  - pointer-events: none — MUST NOT intercept clicks for Core nodes or chat
     *  - tabIndex: -1 / aria-hidden: true — excluded from focus/screen-reader
     */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        ref={canvasRef}
        camera={{ fov: 55, near: 0.1, far: 80, position: [0, 0.5, 5.8] }}
        gl={{
          antialias: qualityTier !== 'mobile',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={dprRange}
        style={{
          width: '100%',
          height: '100%',
          // Belt-and-suspenders pointer-events on the actual canvas element
          pointerEvents: 'none',
          display: 'block',
        }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        {/* Camera controller: entrance push-in → settles at rest, no idle drift */}
        <CameraController reducedMotion={reducedMotion} />

        {/* Scene environments */}
        {(activeScene === 'arrival' || activeScene === undefined) && (
          <ArrivalObservatory
            qualityTier={qualityTier}
            reducedMotion={reducedMotion}
          />
        )}
        {activeScene === 'identity' && (
          <IdentityChamber
            qualityTier={qualityTier}
            reducedMotion={reducedMotion}
          />
        )}
        {activeScene === 'capabilities' && (
          <CapabilitiesLab
            qualityTier={qualityTier}
            reducedMotion={reducedMotion}
          />
        )}
      </Canvas>
    </div>
  );
}
