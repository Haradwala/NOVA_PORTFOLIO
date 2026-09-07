/**
 * CommunicationBridge.jsx — Scene 7: The Threshold
 *
 * Narrative:
 *   Every environment has led here. This is where NOVA meets the world —
 *   where Shadab's inner world opens to yours. Not dramatically. Quietly.
 *
 *   There are no walls. There is no ceiling. There is a platform and there
 *   is infinity. The desk surface is the workspace: simple, flat, warm.
 *   It glows from within — NOVA is awake, present, and waiting.
 *
 *   The void beyond the platform edge is not empty — it is potential.
 *   Everything that has not yet been built exists there, waiting to be
 *   brought into being through collaboration.
 *
 *   The thin blue ring at the platform edge is the boundary between
 *   Shadab's world and yours. You have crossed it by arriving here.
 *
 *   NOVA does not speak first. NOVA waits.
 *   The desk is ready. What do you need?
 *
 * Architecture:
 *   Circular platform: radius 18, very thin (0.3 units), dark stone.
 *   Single pedestal at center: cylinder, radius 0.4, height 1.2.
 *   Desk surface: thin box (5 × 0.08 × 2.8), warm amber glow from within.
 *   Platform edge ring: torus, radius 18, cold blue emissive.
 *   Beyond: absolute void + stars (WorldAtmosphere provides this).
 *   No walls. No ceiling. Just the platform and everything possible.
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('terminal').position;

// ─── Materials ────────────────────────────────────────────────────────────────

const matPlatform = new THREE.MeshStandardMaterial({
  color:     '#040408',
  metalness: 0.92,
  roughness: 0.10,
});

const matPedestal = new THREE.MeshStandardMaterial({
  color:     CP.ghost,
  metalness: 0.95,
  roughness: 0.05,
});

const matDesk = new THREE.MeshStandardMaterial({
  color:     '#0a0808',
  metalness: 0.85,
  roughness: 0.06,
  emissive:  new THREE.Color(CP.amber),
  emissiveIntensity: 0.15,
});

const matEdgeRing = new THREE.MeshBasicMaterial({
  color:      CP.iceBlue,
  transparent: true,
  opacity:    0.35,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
});

// ─── Desk Surface ─────────────────────────────────────────────────────────────
// The workspace. Glows from within. NOVA is present.

function DeskSurface() {
  const ref = useRef();
  const geo = useMemo(() => new THREE.BoxGeometry(5, 0.08, 2.8), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Breathing glow — NOVA is alive, not frozen
    ref.current.material.emissiveIntensity =
      0.12 + 0.06 * Math.sin(clock.elapsedTime * 0.5);
  });

  return (
    <group position={[0, 1.28, 0]}>
      <mesh ref={ref} geometry={geo} material={matDesk} />
      {/* Desk warm glow upward */}
      <pointLight position={[0, 0.3, 0]} color={CP.amber}
        intensity={1.8} distance={10} decay={2} />
    </group>
  );
}

// ─── Platform ─────────────────────────────────────────────────────────────────

function Platform() {
  const geo      = useMemo(() => new THREE.CylinderGeometry(18, 18, 0.28, 80), []);
  const geoEdge  = useMemo(() => new THREE.TorusGeometry(18, 0.06, 8, 160), []);
  const geoPed   = useMemo(() => new THREE.CylinderGeometry(0.4, 0.5, 1.2, 24), []);

  return (
    <>
      {/* Platform disc */}
      <mesh position={[0, 0, 0]} geometry={geo} material={matPlatform} />
      {/* Cold blue edge ring — the boundary between worlds */}
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}
        geometry={geoEdge} material={matEdgeRing} />
      {/* Pedestal */}
      <mesh position={[0, 0.74, 0]} geometry={geoPed} material={matPedestal} />
    </>
  );
}

// ─── Void Perspective Lines ────────────────────────────────────────────────────
// Very faint convergence lines toward infinity — suggests depth beyond the platform.

function VoidLines() {
  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color:      CP.iceBlue,
    transparent: true,
    opacity:    0.08,
    blending:   THREE.AdditiveBlending,
  }), []);

  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const verts = [];
    // 8 lines from platform edge to infinity
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 18;
      const z = Math.sin(angle) * 18;
      verts.push(x, 0, z,   x * 20, 0, z * 20);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geometry;
  }, []);

  return <lineSegments geometry={lines} material={mat} />;
}

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
// A slow expanding ring from the platform center — NOVA's signal, outward.

function PulseRing() {
  const ref   = useRef();
  const scale = useRef(0);
  const geo   = useMemo(() => new THREE.TorusGeometry(1, 0.02, 8, 80), []);
  const mat   = useMemo(() => new THREE.MeshBasicMaterial({
    color: CP.iceBlue, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    scale.current += delta * 2.2;
    if (scale.current > 16) scale.current = 0;
    const s = scale.current;
    ref.current.scale.setScalar(s);
    ref.current.material.opacity = 0.5 * Math.max(0, 1 - s / 16);
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}
      geometry={geo} material={mat} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunicationBridge() {
  return (
    <group position={POS}>
      <Platform />
      <DeskSurface />
      <VoidLines />
      <PulseRing />

      {/* Cool blue from below platform — cold space light */}
      <pointLight position={[0, -5, 0]} color={CP.iceBlue}
        intensity={0.35} distance={25} decay={2} />

      {/* Very faint overall platform fill */}
      <pointLight position={[0, 8, 0]} color="#202040"
        intensity={0.15} distance={30} decay={2} />
    </group>
  );
}
