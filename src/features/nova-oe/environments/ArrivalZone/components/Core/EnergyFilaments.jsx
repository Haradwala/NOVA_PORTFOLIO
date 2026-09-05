import { useMemo } from 'react';
import * as THREE from 'three';
import { FILAMENT_COUNT } from './constants';

export default function EnergyFilaments({ matRefs }) {
  // Memoized deterministic geometry generation based on index sinusoids
  const geometries = useMemo(() => {
    return Array.from({ length: FILAMENT_COUNT }).map((_, i) => {
      const theta = (i * 2 * Math.PI) / FILAMENT_COUNT;
      const offsetFactor = Math.sin(i * 1.7) * 0.25;
      const phi = (i % 4) * (Math.PI / 8) + Math.PI / 4 + offsetFactor;
      
      const start = new THREE.Vector3().setFromSphericalCoords(1.4, phi, theta);
      const end = new THREE.Vector3().setFromSphericalCoords(
        2.8,
        phi + 0.3 + offsetFactor,
        theta + 0.5 + Math.cos(i * 2.3) * 0.2
      );
      
      const mid = new THREE.Vector3()
        .setFromSphericalCoords(2.1, phi + 0.15 + offsetFactor * 0.5, theta + 0.25 + Math.cos(i * 2.3) * 0.1)
        .add(new THREE.Vector3(0, 0.12 * Math.sin(i * 3.1), 0));
        
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const points = curve.getPoints(16);
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  return (
    <>
      {geometries.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial
            ref={(el) => {
              if (el) matRefs.current[idx] = el;
            }}
            color="#7fb5ff"
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </>
  );
}
