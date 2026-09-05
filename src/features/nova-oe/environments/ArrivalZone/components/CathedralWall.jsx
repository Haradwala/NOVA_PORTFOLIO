import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumDark } from '../materials/NeuralTitanium';
import { ribZ, panelZ } from '../constants';

export default function CathedralWall() {
  const g = useMemo(() => ({
    sideWall:   new THREE.BoxGeometry(6, 220, 280),
    wallRib:    new THREE.BoxGeometry(1.5, 220, 8),
    wallPanel:  new THREE.BoxGeometry(1.0, 180, 26),
    galleryDeck: new THREE.BoxGeometry(15, 2.0, 280),
  }), []);

  return (
    <>
      {/* Side walls use Recessed family to hide in darkness */}
      <mesh geometry={g.sideWall} material={matTitaniumDark} position={[-68, 110, -10]} />
      <mesh geometry={g.sideWall} material={matTitaniumDark} position={[68, 110, -10]} />

      {/* Rib columns use Structural */}
      {ribZ.map((z, idx) => (
        <group key={idx}>
          <mesh geometry={g.wallRib} material={matTitanium} position={[-64.8, 110, z - 10]} />
          <mesh geometry={g.wallRib} material={matTitanium} position={[64.8, 110, z - 10]} />
        </group>
      ))}

      {/* Recessed panels use Structural */}
      {panelZ.map((z, idx) => (
        <group key={idx}>
          <mesh geometry={g.wallPanel} material={matTitanium} position={[-66, 110, z - 10]} />
          <mesh geometry={g.wallPanel} material={matTitanium} position={[66, 110, z - 10]} />
        </group>
      ))}

      {/* Gallery decks use Recessed */}
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[-60.5, 25, -10]} />
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[60.5, 25, -10]} />
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[-60.5, 55, -10]} />
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[60.5, 55, -10]} />
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[-60.5, 85, -10]} />
      <mesh geometry={g.galleryDeck} material={matTitaniumDark} position={[60.5, 85, -10]} />
    </>
  );
}
