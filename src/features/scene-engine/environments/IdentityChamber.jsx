/**
 * IdentityChamber.jsx — Phase 3: Identity Scene Environment
 *
 * Visual direction: Architectural identity chamber.
 * Features:
 *   - Tall vertical light columns flanking the space symmetrically
 *   - Dark floor plane with subtle structural grid lines and coordinate ticks
 *   - Soft central spotlight illuminating the identity space
 *   - Atmospheric rising particulate dust
 *   - Strict particle budget: 200 desktop, 60 mobile
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Symmetrical Vertical Light Columns ────────────────────────────────────────
function LightColumns({ count = 6 }) {
  const groupRef = useRef();

  // Column positions flanking the chamber: pairs at X: ±2.8, ±4.6, ±6.8, Z staggered
  const columns = useMemo(() => [
    { pos: [-2.8, 0, -2.5], height: 14, radius: 0.04, color: '#8B5CF6', opacity: 0.35 },
    { pos: [ 2.8, 0, -2.5], height: 14, radius: 0.04, color: '#8B5CF6', opacity: 0.35 },
    { pos: [-4.6, 0, -4.5], height: 16, radius: 0.05, color: '#A78BFA', opacity: 0.28 },
    { pos: [ 4.6, 0, -4.5], height: 16, radius: 0.05, color: '#A78BFA', opacity: 0.28 },
    { pos: [-6.8, 0, -7.0], height: 18, radius: 0.06, color: '#E8956D', opacity: 0.22 },
    { pos: [ 6.8, 0, -7.0], height: 18, radius: 0.06, color: '#E8956D', opacity: 0.22 },
  ], []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Very subtle breathing oscillation on column light intensity
    groupRef.current.children.forEach((child, i) => {
      if (child.material) {
        child.material.opacity = columns[i].opacity * (0.88 + 0.12 * Math.sin(t * 0.8 + i * 0.9));
      }
    });
  });

  return (
    <group ref={groupRef}>
      {columns.map((col, idx) => (
        <mesh key={idx} position={col.pos}>
          <cylinderGeometry args={[col.radius, col.radius * 1.2, col.height, 16]} />
          <meshBasicMaterial
            color={col.color}
            transparent
            opacity={col.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Dark Architectural Floor Plane ───────────────────────────────────────────
function FloorGrid() {
  const gridMat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#8B5CF6',
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Generate clean coordinate grid lines
  const lineGeometry = useMemo(() => {
    const points = [];
    const size = 16;
    const step = 1.6;
    const y = -1.8;

    for (let x = -size / 2; x <= size / 2; x += step) {
      points.push(new THREE.Vector3(x, y, -size / 2));
      points.push(new THREE.Vector3(x, y, size / 2));
    }
    for (let z = -size / 2; z <= size / 2; z += step) {
      points.push(new THREE.Vector3(-size / 2, y, z));
      points.push(new THREE.Vector3(size / 2, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group>
      {/* Dark physical floor slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.82, -2]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial
          color="#040308"
          metalness={0.7}
          roughness={0.8}
        />
      </mesh>

      {/* Grid coordinate lines */}
      <lineSegments geometry={lineGeometry} material={gridMat} />

      {/* Central ground glow patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, -1.5]}>
        <circleGeometry args={[3.5, 32]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── Floating Particulate Dust (Atmospheric Motes) ──────────────────────────────
function ChamberParticles({ count = 180 }) {
  const pointsRef = useRef();

  const { positions, opacities, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const op  = new Float32Array(count);
    const sp  = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16.0;
      pos[i * 3 + 1] = -1.8 + Math.random() * 8.0;
      pos[i * 3 + 2] = -8.0 + Math.random() * 10.0;

      op[i] = 0.15 + Math.random() * 0.45;
      sp[i] = 0.15 + Math.random() * 0.35;
    }
    return { positions: pos, opacities: op, speeds: sp };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aOpacity', new THREE.Float32BufferAttribute(opacities, 1));
    return geo;
  }, [positions, opacities]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.04,
    color: new THREE.Color('#EDE9FE'),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * speeds[i];
      if (y > 6.2) y = -1.8;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ── Main Identity Chamber Component ───────────────────────────────────────────
export default function IdentityChamber({ qualityTier = 'desktop', reducedMotion = false }) {
  const particleCount = qualityTier === 'mobile' ? 60 : 180;

  return (
    <group>
      {/* Soft distance fog */}
      <fog attach="fog" args={['#05050D', 5, 26]} />

      {/* Atmospheric lighting */}
      <ambientLight color="#161028" intensity={0.65} />

      {/* Soft central spotlight illuminating the identity pedestal / center */}
      <spotLight
        position={[0, 7.5, 1.5]}
        target-position={[0, -1.0, -1.5]}
        color="#EDE9FE"
        intensity={1.4}
        angle={0.55}
        penumbra={0.9}
        decay={1.8}
        distance={22}
      />

      {/* Subtle warm rose accent fill */}
      <pointLight
        position={[-3.5, 1.2, -3.0]}
        color="#E8956D"
        intensity={0.45}
        distance={14}
        decay={2}
      />

      {/* Electric violet floor fill */}
      <pointLight
        position={[3.5, -0.5, -2.5]}
        color="#8B5CF6"
        intensity={0.55}
        distance={12}
        decay={2}
      />

      {/* Vertical architectural light columns */}
      <LightColumns count={qualityTier === 'mobile' ? 4 : 6} />

      {/* Dark floor grid */}
      <FloorGrid />

      {/* Ambient rising particulate dust */}
      {!reducedMotion && <ChamberParticles count={particleCount} />}
    </group>
  );
}
