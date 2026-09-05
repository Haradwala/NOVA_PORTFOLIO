import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitaniumDark } from '../materials/NeuralTitanium';
import { primaryPillarZ } from '../constants';

export default function Ceiling() {
  const g = useMemo(() => ({
    ceilBeam: new THREE.BoxGeometry(24, 2.5, 2.5),
  }), []);

  return (
    <>
      {primaryPillarZ.map((z, idx) => (
        <group key={idx}>
          {/* Left ceiling beams use Recessed to fade into shadows */}
          <mesh geometry={g.ceilBeam} material={matTitaniumDark} position={[-36, 238, z]} />
          {/* Right ceiling beams use Recessed */}
          <mesh geometry={g.ceilBeam} material={matTitaniumDark} position={[36, 238, z]} />
        </group>
      ))}
    </>
  );
}
