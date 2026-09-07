import { useMemo } from 'react';
import * as THREE from 'three';
import { SHELL_RADIUS } from './constants';

export default function EnergyShell({ meshRef }) {
  const geo = useMemo(() => new THREE.SphereGeometry(SHELL_RADIUS, 32, 32), []);

  return (
    <mesh ref={meshRef} geometry={geo}>
      <meshPhysicalMaterial
        color="#8fbfff"
        transmission={0.92}
        thickness={0.30}
        opacity={0.14}
        ior={1.6}
        transparent
        roughness={0.15}
        metalness={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}
