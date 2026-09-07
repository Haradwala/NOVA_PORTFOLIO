import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumWorn } from '../materials/NeuralTitanium';
import { platRibAngles } from '../constants';
import { environmentRegistry } from '../systems/EnvironmentController';

export default function Platform() {
  const g = useMemo(() => ({
    platBase:   new THREE.CylinderGeometry(20, 20, 0.4, 64),
    platTier2:  new THREE.CylinderGeometry(15, 15, 0.4, 64),
    platTier3:  new THREE.CylinderGeometry(10, 10, 0.4, 64),
    platTop:    new THREE.CylinderGeometry(6, 6, 0.2, 64),
    platGroove: new THREE.CylinderGeometry(5, 5, 0.1, 64),
    platRib:    new THREE.BoxGeometry(1.0, 0.4, 0.8),
  }), []);

  // Locally keep unique material instance and register with EnvironmentController
  const localMatWorn = useMemo(() => matTitaniumWorn.clone(), []);

  return (
    <>
      {/* Structural cylinders */}
      <mesh geometry={g.platBase} material={matTitanium} position={[0, 0.2, 0]} />
      <mesh geometry={g.platTier2} material={matTitanium} position={[0, 0.6, 0]} />
      <mesh geometry={g.platTier3} material={matTitanium} position={[0, 1.0, 0]} />
      <mesh geometry={g.platTop} material={matTitanium} position={[0, 1.3, 0]} />
      <mesh geometry={g.platGroove} material={matTitanium} position={[0, 1.41, 0]} />

      {/* Highlight ribs */}
      {platRibAngles.map((a, i) => (
        <mesh
          key={i}
          geometry={g.platRib}
          position={[Math.cos(a) * 20.0, 0.2, Math.sin(a) * 20.0]}
          rotation={[0, -a, 0]}
        >
          <primitive
            object={localMatWorn}
            attach="material"
            ref={(el) => {
              if (el) environmentRegistry.platformMat = el;
            }}
          />
        </mesh>
      ))}
    </>
  );
}
