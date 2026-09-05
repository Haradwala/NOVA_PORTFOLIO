import { useMemo } from 'react';
import * as THREE from 'three';
import { LIGHT_INTENSITY, LIGHT_DISTANCE, AURA_RADIUS } from './constants';

export default function CoreGlow({ lightRef, materialRef }) {
  const geo = useMemo(() => new THREE.SphereGeometry(AURA_RADIUS, 16, 16), []);

  return (
    <>
      {/* Local point light representing consciousness glow */}
      <pointLight
        ref={lightRef}
        color="#8fbfff"
        intensity={LIGHT_INTENSITY}
        distance={LIGHT_DISTANCE}
        decay={2}
      />

      {/* Atmospheric translucent aura shell */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={materialRef}
          color="#8fbfff"
          transparent
          opacity={0.06}
          emissive="#8fbfff"
          emissiveIntensity={0.2}
          toneMapped={false}
          side={THREE.BackSide}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </>
  );
}
