/**
 * IdentityHall.jsx — Scene 2: The Corridor
 *
 * Narrative:
 *   Shadab's identity is not a bio page. It's a walk through accumulated
 *   choices. This corridor extends in both directions to infinity — because
 *   identity has no clean beginning and no final destination.
 *
 *   The amber thread on the floor is continuous from The Gate. It was always
 *   here. The 12 recessed niches (6 per side) are each a year, a role,
 *   a discipline — dark and quiet, waiting to be noticed.
 *
 *   At the center: a slowly rotating dodecahedron. 12 faces for 12 core skills.
 *   Thin, geometric, turning — it represents the structure beneath the work.
 *
 *   The ceiling does not exist. What's above is unknown, always.
 *
 * Architecture:
 *   Two parallel walls, 80 units tall, stretching ±200 in Z.
 *   6 recessed niches per wall (cold blue point lights, dim).
 *   A central dodecahedron on a thin pedestal.
 *   Single amber wash from far behind (simulating the Gate's light following you).
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('identity').position;

// ─── Materials ────────────────────────────────────────────────────────────────

const matWall = new THREE.MeshStandardMaterial({
  color:     '#040608',
  metalness: 0.92,
  roughness: 0.12,
});

const matFloor = new THREE.MeshStandardMaterial({
  color:     '#030508',
  metalness: 0.85,
  roughness: 0.22,
});

const matNiche = new THREE.MeshStandardMaterial({
  color:     '#020308',
  metalness: 0.6,
  roughness: 0.5,
});

const matCore = new THREE.MeshStandardMaterial({
  color:     CP.ghost,
  metalness: 0.98,
  roughness: 0.04,
  emissive:  new THREE.Color(CP.iceBlue),
  emissiveIntensity: 0.06,
});

const matPedestal = new THREE.MeshStandardMaterial({
  color:     '#050810',
  metalness: 0.9,
  roughness: 0.08,
});

const matAmberThread = new THREE.MeshBasicMaterial({
  color:      CP.amber,
  transparent: true,
  opacity:    0.55,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
});

const matNicheLight = new THREE.MeshBasicMaterial({
  color:      CP.iceBlue,
  transparent: true,
  opacity:    0.12,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
});

// ─── Corridor Walls with Niches ───────────────────────────────────────────────
// 6 niches per side — each is a year, a role, a discipline.

const NICHE_Z = [-60, -40, -20, 0, 20, 40];

function CorridorWalls() {
  const geoWall  = useMemo(() => new THREE.BoxGeometry(2.5, 80, 400), []);
  const geoNiche = useMemo(() => new THREE.BoxGeometry(1.5, 8, 4), []);
  const geoGlow  = useMemo(() => new THREE.PlaneGeometry(3, 7), []);

  return (
    <>
      {/* Left wall */}
      <mesh position={[-9, 40, 0]} geometry={geoWall} material={matWall} />
      {/* Right wall */}
      <mesh position={[9, 40, 0]} geometry={geoWall} material={matWall} />

      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 400]} />
        <primitive object={matFloor} />
      </mesh>

      {/* Niches + subtle cold glow */}
      {NICHE_Z.map((z, i) => (
        <group key={i}>
          <mesh position={[-10.2, 8, z]} geometry={geoNiche} material={matNiche} />
          <mesh position={[10.2, 8, z]} geometry={geoNiche} material={matNiche} />
          <mesh position={[-9.9, 8, z]} rotation={[0, Math.PI / 2, 0]}
            geometry={geoGlow} material={matNicheLight} />
          <mesh position={[9.9, 8, z]} rotation={[0, -Math.PI / 2, 0]}
            geometry={geoGlow} material={matNicheLight} />
          <pointLight position={[-10.5, 8, z]} color={CP.iceBlue}
            intensity={0.18} distance={6} decay={2} />
          <pointLight position={[10.5, 8, z]} color={CP.iceBlue}
            intensity={0.18} distance={6} decay={2} />
        </group>
      ))}
    </>
  );
}

// ─── Identity Core ────────────────────────────────────────────────────────────
// Dodecahedron: 12 faces = 12 core disciplines.
// The structure beneath all of Shadab's work.

function IdentityCore() {
  const ref = useRef();
  const geo = useMemo(() => new THREE.DodecahedronGeometry(1.6, 0), []);
  const geoPedestal = useMemo(() => new THREE.CylinderGeometry(0.08, 0.12, 1.8, 8), []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.055;
    ref.current.rotation.x += delta * 0.018;
    const t = state.clock.elapsedTime;
    ref.current.material.emissiveIntensity = 0.05 + 0.03 * Math.sin(t * 0.4);
  });

  return (
    <group position={[0, 3, 0]}>
      <mesh position={[0, -2.3, 0]} geometry={geoPedestal} material={matPedestal} />
      <mesh ref={ref} position={[0, 0, 0]} geometry={geo} material={matCore} />
      {/* Soft cold light from the core — identity radiates faintly */}
      <pointLight color={CP.iceBlue} intensity={0.6} distance={12} decay={2} />
    </group>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IdentityHall() {
  const geoAmberLine = useMemo(() => new THREE.BoxGeometry(0.05, 0.012, 400), []);

  // Spotlight target on core
  const spotTarget = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(0, 3, 0);
    return t;
  }, []);

  return (
    <group position={POS}>
      <primitive object={spotTarget} />

      <CorridorWalls />
      <IdentityCore />

      {/* The amber thread — continuous from The Gate */}
      <mesh position={[0, 0.01, 0]} geometry={geoAmberLine}
        material={matAmberThread} />

      {/* One light from far above — cold, like space */}
      <spotLight
        target={spotTarget}
        position={[0, 80, 0]}
        color={CP.coldWhite}
        intensity={3.5}
        angle={0.08}
        penumbra={0.85}
        distance={100}
        decay={1.2}
      />

      {/* Warm amber from behind — the Gate's light follows you */}
      <pointLight
        position={[0, 3, 50]}
        color={CP.amber}
        intensity={0.55}
        distance={80}
        decay={1.8}
      />
    </group>
  );
}
