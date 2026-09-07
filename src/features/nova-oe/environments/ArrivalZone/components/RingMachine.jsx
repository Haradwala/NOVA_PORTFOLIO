import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumWorn } from '../materials/NeuralTitanium';
import { environmentRegistry } from '../systems/EnvironmentController';

export default function RingMachine() {
  const g = useMemo(() => ({
    // Outer suspended ring tube radius reduced to 0.8 to act as a framing ellipse (Phase 1F specs)
    ringOuter:  new THREE.TorusGeometry(32, 0.8, 16, 100),
    ringLower:  new THREE.TorusGeometry(20.5, 0.2, 8, 64),
    ringPylon:  new THREE.BoxGeometry(3.0, 30, 3.0),
    ringStrut:  new THREE.BoxGeometry(6, 1.2, 1.2),
  }), []);

  // Locally keep unique material instance and register with EnvironmentController
  const localMatWorn = useMemo(() => matTitaniumWorn.clone(), []);

  return (
    <>
      {/* Suspended Mechanical Ring (Highlight) */}
      <mesh geometry={g.ringOuter} rotation={[-Math.PI / 2, 0, 0]} position={[0, 12.5, 0]}>
        <primitive object={localMatWorn} attach="material" ref={(el) => { if (el) environmentRegistry.ringMat = el; }} />
      </mesh>

      {/* Support pylons & struts holding the suspended ring (Structural) */}
      <mesh geometry={g.ringPylon} material={matTitanium} position={[-38, 15, -12]} />
      <mesh geometry={g.ringPylon} material={matTitanium} position={[38, 15, -12]} />
      <mesh geometry={g.ringPylon} material={matTitanium} position={[-38, 15, 12]} />
      <mesh geometry={g.ringPylon} material={matTitanium} position={[38, 15, 12]} />
      
      <mesh geometry={g.ringStrut} material={matTitanium} position={[-35, 12.5, -12]} />
      <mesh geometry={g.ringStrut} material={matTitanium} position={[35, 12.5, -12]} />
      <mesh geometry={g.ringStrut} material={matTitanium} position={[-35, 12.5, 12]} />
      <mesh geometry={g.ringStrut} material={matTitanium} position={[35, 12.5, 12]} />

      {/* Lower Platform Ring (Highlight) */}
      <mesh geometry={g.ringLower} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, 0]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
    </>
  );
}
