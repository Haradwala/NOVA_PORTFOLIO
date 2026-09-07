import { useMemo } from 'react';
import * as THREE from 'three';
import { HALO_RADIUS_A, HALO_RADIUS_B, HALO_RADIUS_C } from './constants';

export default function OrbitalHalo({ ringRefs }) {
  const geometries = useMemo(() => ({
    ringA: new THREE.TorusGeometry(HALO_RADIUS_A, 0.03, 8, 64),
    ringB: new THREE.TorusGeometry(HALO_RADIUS_B, 0.03, 8, 64),
    ringC: new THREE.TorusGeometry(HALO_RADIUS_C, 0.03, 8, 64),
  }), []);

  // Shared material to save memory, as they are not individually animated in material props
  const mat = useMemo(() => (
    <meshStandardMaterial
      color="#7e9fcf"
      transparent
      opacity={0.3}
      metalness={0.7}
      roughness={0.3}
    />
  ), []);

  return (
    <>
      {/* Ring A (Radii: 2.6, Tilt: 0°, Y-offset: +0.08) */}
      <mesh
        ref={(el) => {
          if (el) ringRefs.current[0] = el;
        }}
        geometry={geometries.ringA}
        rotation={[0, 0, 0]}
        position={[0, 0.08, 0]}
      >
        {mat}
      </mesh>

      {/* Ring B (Radii: 2.9, Tilt: 35°, Y-offset: 0) */}
      <mesh
        ref={(el) => {
          if (el) ringRefs.current[1] = el;
        }}
        geometry={geometries.ringB}
        rotation={[(35 * Math.PI) / 180, 0, 0]}
        position={[0, 0, 0]}
      >
        {mat}
      </mesh>

      {/* Ring C (Radii: 3.2, Tilt: -42°, Y-offset: -0.08) */}
      <mesh
        ref={(el) => {
          if (el) ringRefs.current[2] = el;
        }}
        geometry={geometries.ringC}
        rotation={[(-42 * Math.PI) / 180, 0, 0]}
        position={[0, -0.08, 0]}
      >
        {mat}
      </mesh>
    </>
  );
}
