import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumWorn } from '../materials/NeuralTitanium';
import { environmentRegistry } from '../systems/EnvironmentController';

export default function Portal() {
  const g = useMemo(() => ({
    portalOuterPost:  new THREE.BoxGeometry(2.5, 38, 5),
    portalOuterLint:  new THREE.BoxGeometry(20, 2.5, 5),
    portalOuterButt:  new THREE.BoxGeometry(3, 22, 10),
    portalBracket:    new THREE.BoxGeometry(1.5, 8, 1.5),

    portalMidPost:    new THREE.BoxGeometry(2, 28, 4),
    portalMidLint:    new THREE.BoxGeometry(14, 2, 4),

    portalInnerPost:  new THREE.BoxGeometry(1.5, 18, 3),
    portalInnerLint:  new THREE.BoxGeometry(10, 1.5, 3),
  }), []);

  // Locally keep unique material instance and register with EnvironmentController
  const localMatWorn = useMemo(() => matTitaniumWorn.clone(), []);

  return (
    <>
      {/* Outer Arch Layer (Highlight) */}
      <mesh geometry={g.portalOuterPost} position={[-10, 19, -55]}>
        <primitive object={localMatWorn} attach="material" ref={(el) => { if (el) environmentRegistry.portalMat = el; }} />
      </mesh>
      <mesh geometry={g.portalOuterPost} position={[10, 19, -55]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      <mesh geometry={g.portalOuterLint} position={[0, 38, -55]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      
      {/* Buttresses & brackets (Structural) */}
      <mesh geometry={g.portalOuterButt} material={matTitanium} position={[-13.5, 11, -55]} />
      <mesh geometry={g.portalOuterButt} material={matTitanium} position={[13.5, 11, -55]} />
      <mesh geometry={g.portalBracket} material={matTitanium} position={[-8.5, 33.5, -55]} rotation={[0, 0, Math.PI / 4]} />
      <mesh geometry={g.portalBracket} material={matTitanium} position={[8.5, 33.5, -55]} rotation={[0, 0, -Math.PI / 4]} />

      {/* Middle Arch Layer (Highlight) */}
      <mesh geometry={g.portalMidPost} position={[-7, 14, -59]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      <mesh geometry={g.portalMidPost} position={[7, 14, -59]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      <mesh geometry={g.portalMidLint} position={[0, 28, -59]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>

      {/* Inner Arch Layer (Highlight) */}
      <mesh geometry={g.portalInnerPost} position={[-5, 9, -63]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      <mesh geometry={g.portalInnerPost} position={[5, 9, -63]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
      <mesh geometry={g.portalInnerLint} position={[0, 18, -63]}>
        <primitive object={localMatWorn} attach="material" />
      </mesh>
    </>
  );
}
