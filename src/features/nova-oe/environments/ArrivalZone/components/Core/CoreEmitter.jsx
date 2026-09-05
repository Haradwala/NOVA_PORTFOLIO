import { useMemo } from 'react';
import * as THREE from 'three';
import { EMITTER_RADIUS } from './constants';

export default function CoreEmitter({ materialRef }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(EMITTER_RADIUS, 0), []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        ref={materialRef}
        color="#cfe7ff"
        emissive="#8fbfff"
        emissiveIntensity={2.2}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
