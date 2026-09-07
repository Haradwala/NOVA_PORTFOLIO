import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitaniumWorn } from '../../materials/NeuralTitanium';
import { CORE_RADIUS } from './constants';

export default function CoreShell() {
  const panels = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      // 6 segmented curved shields with mechanical gaps
      const phiStart = i * ((2 * Math.PI) / 6) + Math.PI / 24;
      const phiLength = ((2 * Math.PI) / 6) - Math.PI / 12;
      return new THREE.SphereGeometry(
        CORE_RADIUS,
        16,
        16,
        phiStart,
        phiLength,
        Math.PI / 6,
        (2 * Math.PI) / 3
      );
    });
  }, []);

  return (
    <>
      {panels.map((geo, idx) => (
        <mesh key={idx} geometry={geo} material={matTitaniumWorn} />
      ))}
    </>
  );
}
