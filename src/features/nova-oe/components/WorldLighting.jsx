/**
 * WorldLighting.jsx
 * Global lighting for the NOVA Operating Environment.
 *
 * Philosophy: near-total darkness. Each scene provides its own single
 * dramatic light source. This file only keeps:
 *   1. Hemisphere ambient (barely perceptible — preserves deep-space void)
 *   2. Landmark point lights (soft zone fills, driven by WorldDirector)
 *
 * What was removed:
 *   The directional key/rim/fill rig — it created flat, even illumination.
 *   Flat illumination is the opposite of cinematic.
 *   Volume cones — decoration without narrative.
 */

import { useRef }   from 'react';
import { useFrame } from '@react-three/fiber';
import { LIGHTING_CONFIG, ATMOSPHERE_CONFIG } from '../engine/WorldConfig';
import { WorldDirector } from '../engine/WorldDirector';

// ─── Hemisphere Ambient ────────────────────────────────────────────────────────
// Sky: near-black cold blue. Ground: absolute black.
// This is the minimum light needed to distinguish void from geometry.

function AmbientBase() {
  return (
    <>
      <hemisphereLight
        args={['#060818', '#000002', ATMOSPHERE_CONFIG.ambientIntensity]}
      />
    </>
  );
}

// ─── Landmark Point Light ──────────────────────────────────────────────────────
// Soft fill around each scene center. Intensity driven by WorldDirector
// so lights fade as the camera approaches and departs each location.

function LandmarkLight({ index, config }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const state = WorldDirector.lightStates[index];
    if (state) ref.current.intensity = state.currentIntensity;
  });

  return (
    <pointLight
      ref={ref}
      color={config.color}
      intensity={0}
      distance={config.distance}
      decay={2}
      position={config.position}
    />
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function WorldLighting() {
  return (
    <>
      <AmbientBase />
      {LIGHTING_CONFIG.landmarkLights.map((cfg, i) => (
        <LandmarkLight key={i} index={i} config={cfg} />
      ))}
    </>
  );
}
