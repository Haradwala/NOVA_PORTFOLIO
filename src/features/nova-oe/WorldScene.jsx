/**
 * WorldScene.jsx
 *
 * Configures the static ancient AI temple scene.
 * Omitted: Engine ticks, animations, particles, custom atmosphere, post-processing.
 * Rendered: Static camera, 4 lighting roles, Neural Titanium architecture.
 *
 * STRICT BUILD ORDER PHASE 1F: Visual Hierarchy & Readability Pass
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import ArrivalZone from './environments/ArrivalZone/ArrivalZone';
import { environmentRegistry } from './environments/ArrivalZone/systems/EnvironmentController';

function StaticCamera() {
  const { camera } = useThree();

  useEffect(() => {
    // Locked camera coordinates for the monumental architectural composition
    camera.position.set(0, 8.5, 56.0);
    camera.lookAt(0, 2.5, -15.0);
  }, [camera]);

  return null;
}

export default function WorldScene() {
  const spotTargetRef = useRef();

  return (
    <>
      {/* ── Static Camera ── */}
      <StaticCamera />

      {/* ── Background & Fog (Atmospheric perspective) ── */}
      <color attach="background" args={['#04060c']} />
      <fog
        ref={(el) => {
          if (el) environmentRegistry.fog = el;
        }}
        attach="fog"
        args={['#04060c', 55, 170]}
      />

      {/* Target for key spotlight */}
      <object3D ref={spotTargetRef} position={[0, -1, 0]} />

      {/* ── 1. Hemisphere Fill (Prevents crushed shadows with subtle ambient bounce) ── */}
      <hemisphereLight
        ref={(el) => {
          if (el) environmentRegistry.hemiLight = el;
        }}
        args={['#20283f', '#050608', 0.15]}
      />

      {/* ── 2. Key Architectural Shaft (vertical spotlight shaft framing the center) ── */}
      {spotTargetRef.current && (
        <spotLight
          position={[0, 110, 0]}
          target={spotTargetRef.current}
          color="#7e9fcf"
          intensity={15.0}
          angle={0.42}
          penumbra={1.0}
          decay={1.2}
          distance={160}
        />
      )}

      {/* ── 3. Portal Fill (separates the portal from background skyline) ── */}
      <directionalLight
        position={[0, 15, -55]}
        color="#8aa0c5"
        intensity={3.2}
      />

      {/* ── 4. Rim Separation (edge definitions and column readability) ── */}
      <directionalLight
        position={[50, 75, -70]}
        color="#a5c2f8"
        intensity={4.2}
      />

      {/* ── Temple Architecture ── */}
      <ArrivalZone />
    </>
  );
}
