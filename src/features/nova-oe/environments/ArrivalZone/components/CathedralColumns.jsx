import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumWorn } from '../materials/NeuralTitanium';
import { primaryPillarZ, secondaryPillarZ } from '../constants';

export default function CathedralColumns() {
  const g = useMemo(() => ({
    pillarMain:  new THREE.BoxGeometry(2.2, 240, 2.2),
    pillarRib:   new THREE.BoxGeometry(0.6, 240, 2.8),
    pillarBase:  new THREE.BoxGeometry(3.5, 10, 3.5),
    pillarBand:  new THREE.BoxGeometry(2.5, 1.8, 2.5),
    horizGirder: new THREE.BoxGeometry(1.5, 1.5, 110),
    horizLink:   new THREE.BoxGeometry(10, 1.5, 1.5),
  }), []);

  return (
    <>
      {/* Primary Cathedral Pillars (X = ±48, Y = 120) */}
      {primaryPillarZ.map((z, idx) => (
        <group key={idx}>
          {/* Left primary pillars */}
          <group position={[-48, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarRib} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, -60, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 60, 0]} />
          </group>
          {/* Right primary pillars */}
          <group position={[48, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarRib} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, -60, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 60, 0]} />
          </group>
        </group>
      ))}

      {/* Stepped corridor columns: Closer pillars (X = ±38) */}
      {[-15, 25].map((z, idx) => (
        <group key={idx}>
          <group position={[-38, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarRib} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
          </group>
          <group position={[38, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarRib} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
          </group>
        </group>
      ))}

      {/* Secondary Column Rows (X = ±58, recessed towards wall) */}
      {secondaryPillarZ.map((z, idx) => (
        <group key={idx}>
          {/* Left secondary pillars */}
          <group position={[-58, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
          </group>
          {/* Right secondary pillars */}
          <group position={[58, 120, z]}>
            <mesh geometry={g.pillarMain} material={matTitanium} />
            <mesh geometry={g.pillarBase} material={matTitanium} position={[0, -115, 0]} />
            <mesh geometry={g.pillarBand} material={matTitaniumWorn} position={[0, 0, 0]} />
          </group>

          {/* Elevated Cross-connectors */}
          <mesh geometry={g.horizLink} material={matTitanium} position={[-53, 40, z]} />
          <mesh geometry={g.horizLink} material={matTitanium} position={[53, 40, z]} />
        </group>
      ))}

      {/* Elevated Longitudinal Parallax Girders (Y = 40) */}
      <mesh geometry={g.horizGirder} material={matTitanium} position={[-48, 40, -10]} />
      <mesh geometry={g.horizGirder} material={matTitanium} position={[48, 40, -10]} />
    </>
  );
}
