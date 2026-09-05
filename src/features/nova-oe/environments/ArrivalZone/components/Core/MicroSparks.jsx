import { useMemo } from 'react';
import * as THREE from 'three';
import { SPARK_COUNT } from './constants';

// Seeded deterministic properties generated exactly once on module load
export const sparkSeeds = Array.from({ length: SPARK_COUNT }).map((_, i) => {
  const theta = (i * 2 * Math.PI) / SPARK_COUNT;
  const phi = (i % 6) * (Math.PI / 10) + Math.PI / 5;
  const dist = 0.8 + (i % 5) * 0.54; // cleanly distributed inside SPARK_BOUND_RADIUS (3.5)

  const basePos = new THREE.Vector3().setFromSphericalCoords(dist, phi, theta);
  
  // Elliptical orbital parameters (Pass 4: max displacement 0.30 units)
  const radiusX = 0.10 + (i % 3) * 0.08;
  const radiusY = 0.05 + (i % 4) * 0.06;
  const radiusZ = 0.10 + (i % 3) * 0.08;
  
  const phase = i * 1.57;
  const speed = 0.3 + (i % 3) * 0.2; // slow drift speed multiplier

  return {
    basePos,
    radiusX,
    radiusY,
    radiusZ,
    phase,
    speed,
  };
});

export default function MicroSparks({ sparksRef }) {
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(SPARK_COUNT * 3);
    sparkSeeds.forEach((spark, i) => {
      arr[i * 3] = spark.basePos.x;
      arr[i * 3 + 1] = spark.basePos.y;
      arr[i * 3 + 2] = spark.basePos.z;
    });
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry ref={sparksRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8fbfff"
        size={0.065}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
