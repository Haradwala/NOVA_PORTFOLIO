import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitaniumDark } from '../materials/NeuralTitanium';

export default function BackgroundCity() {
  const g = useMemo(() => ({
    skyNear:     new THREE.BoxGeometry(12, 110, 12),
    skyMid:      new THREE.BoxGeometry(16, 150, 16),
    skyFar:      new THREE.BoxGeometry(20, 200, 20),
    skyBackWall: new THREE.BoxGeometry(58, 220, 6),
    skyCol:      new THREE.BoxGeometry(3.0, 140, 3.0),
  }), []);

  return (
    <>
      {/* Backdrop slot walls (Recessed) */}
      <mesh geometry={g.skyBackWall} material={matTitaniumDark} position={[-44, 110, -80]} />
      <mesh geometry={g.skyBackWall} material={matTitaniumDark} position={[44, 110, -80]} />

      {/* Receding vertical columns behind the portal (Recessed) */}
      <mesh geometry={g.skyCol} material={matTitaniumDark} position={[-16, 70, -85]} />
      <mesh geometry={g.skyCol} material={matTitaniumDark} position={[16, 70, -85]} />
      <mesh geometry={g.skyCol} material={matTitaniumDark} position={[-22, 70, -110]} />
      <mesh geometry={g.skyCol} material={matTitaniumDark} position={[22, 70, -110]} />

      {/* Background monolith silhouette towers (Recessed) */}
      <mesh geometry={g.skyNear} material={matTitaniumDark} position={[-18, 55, -90]} />
      <mesh geometry={g.skyNear} material={matTitaniumDark} position={[18, 55, -90]} />
      <mesh geometry={g.skyMid} material={matTitaniumDark} position={[-34, 70, -115]} />
      <mesh geometry={g.skyMid} material={matTitaniumDark} position={[34, 70, -115]} />
      <mesh geometry={g.skyFar} material={matTitaniumDark} position={[-50, 90, -140]} />
      <mesh geometry={g.skyFar} material={matTitaniumDark} position={[50, 90, -140]} />
    </>
  );
}
