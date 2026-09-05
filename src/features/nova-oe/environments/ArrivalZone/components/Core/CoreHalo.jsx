import { useMemo } from 'react';
import * as THREE from 'three';
import { HALO_RADIUS } from './constants';

export default function CoreHalo({ materialRef }) {
  const geo = useMemo(() => new THREE.TorusGeometry(HALO_RADIUS, 0.05, 8, 64), []);

  return (
    // Slightly offset angle (0.08 rad is ~5 degrees) to convey an engineered alignment
    <mesh geometry={geo} rotation={[0.08, 0.08, 0]}>
      <meshStandardMaterial
        ref={materialRef}
        color="#7e9fcf"
        transparent
        opacity={0.35}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
