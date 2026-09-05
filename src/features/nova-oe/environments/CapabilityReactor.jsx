/**
 * CapabilityReactor.jsx — Scene 3: The Monolith
 *
 * Narrative:
 *   Capabilities are not a list. They are a structure — permanent, singular,
 *   and larger than you can fully perceive. The monolith has no visible top.
 *   You cannot comprehend it in its entirety from any single position.
 *   This is deliberate. Mastery resists being summarized.
 *
 *   The cold light from directly above illuminates only the top face — the
 *   rest recedes into void. You see what it chooses to reveal.
 *
 *   The circular moat of electric blue at the base marks the boundary:
 *   approach is welcomed, but you do not touch what you do not understand.
 *
 *   Four satellite forms orbit in silence — subdomains of mastery:
 *   AI Systems, Brand Identity, Product Design, Motion Architecture.
 *
 * Architecture:
 *   Single black monolith: 4.5 × 100 × 3 units, rotating at 0.03 rad/sec.
 *   Emissive moat ring: radius 10, barely visible electric blue.
 *   4 satellite dodecahedra at radius 16, different heights.
 *   Single spotlight from 120 units above — cold, narrow, precise.
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('capability').position;

// ─── Materials ────────────────────────────────────────────────────────────────

const matMonolith = new THREE.MeshStandardMaterial({
  color:     '#010105',
  metalness: 1.0,
  roughness: 0.0,
});

const matMoat = new THREE.MeshBasicMaterial({
  color:       CP.iceBlue,
  transparent: true,
  opacity:     0.18,
  depthWrite:  false,
  blending:    THREE.AdditiveBlending,
});

const matSatellite = new THREE.MeshStandardMaterial({
  color:     CP.ghost,
  metalness: 0.95,
  roughness: 0.06,
  emissive:  new THREE.Color(CP.iceBlue),
  emissiveIntensity: 0.04,
});

const matOrbitRing = new THREE.MeshBasicMaterial({
  color:       '#102040',
  transparent: true,
  opacity:     0.25,
  wireframe:   true,
  depthWrite:  false,
  blending:    THREE.AdditiveBlending,
});

// ─── The Monolith ─────────────────────────────────────────────────────────────
// One object. Rotates slowly. Has no visible top.

function Monolith() {
  const ref = useRef();
  const geo = useMemo(() => new THREE.BoxGeometry(4.5, 100, 3), []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.028;
  });

  return <mesh ref={ref} position={[0, 50, 0]} geometry={geo} material={matMonolith} />;
}

// ─── Orbital Satellites ───────────────────────────────────────────────────────
// 4 subdomains of mastery — each at a unique orbital height.
// They orbit together, but they are not identical.

const SATELLITE_CONFIG = [
  { radius: 16, speed: 0.04,  height: 8,  phase: 0,              size: 0.55 },
  { radius: 16, speed: 0.04,  height: 14, phase: Math.PI / 2,    size: 0.45 },
  { radius: 16, speed: 0.04,  height: 10, phase: Math.PI,        size: 0.6  },
  { radius: 16, speed: 0.04,  height: 6,  phase: Math.PI * 1.5,  size: 0.42 },
];

function Satellite({ radius, speed, height, phase, size }) {
  const ref = useRef();
  const geo = useMemo(() => new THREE.DodecahedronGeometry(size, 0), [size]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.set(Math.cos(t) * radius, height, Math.sin(t) * radius);
    ref.current.rotation.y += 0.012;
    ref.current.rotation.x += 0.007;
  });

  return <mesh ref={ref} geometry={geo} material={matSatellite} />;
}

// ─── Moat Ring ────────────────────────────────────────────────────────────────
// The boundary. Approach is welcomed; transgression is not.

function MoatRing() {
  const ref = useRef();
  const geo = useMemo(() => new THREE.TorusGeometry(10, 0.05, 8, 128), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.14 + 0.06 * Math.sin(clock.elapsedTime * 0.35);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}
      geometry={geo} material={matMoat} />
  );
}

// ─── Orbital Ring Path ────────────────────────────────────────────────────────
function OrbitPath() {
  const geo = useMemo(() => new THREE.TorusGeometry(16, 0.02, 6, 120), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 9, 0]}
      geometry={geo} material={matOrbitRing} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CapabilityReactor() {
  // Floor plane
  const geoFloor = useMemo(() => new THREE.CircleGeometry(60, 64), []);
  const matFloor = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#020208', metalness: 0.9, roughness: 0.15,
  }), []);

  const spotTarget = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(0, 50, 0);
    return t;
  }, []);

  return (
    <group position={POS}>
      <primitive object={spotTarget} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}
        geometry={geoFloor} material={matFloor} />

      {/* The Monolith — the only thing that matters */}
      <Monolith />

      {/* The moat — approach but do not cross */}
      <MoatRing />
      <OrbitPath />

      {/* 4 satellites — subdomains of mastery */}
      {SATELLITE_CONFIG.map((cfg, i) => (
        <Satellite key={i} {...cfg} />
      ))}

      {/* Single cold light from directly above */}
      <spotLight
        target={spotTarget}
        position={[0, 130, 0]}
        color={CP.coldWhite}
        intensity={7}
        angle={0.04}
        penumbra={0.6}
        distance={160}
        decay={1.0}
      />

      {/* Faint electric blue from the moat */}
      <pointLight position={[0, 0.5, 0]} color={CP.iceBlue}
        intensity={0.35} distance={20} decay={2} />
    </group>
  );
}
