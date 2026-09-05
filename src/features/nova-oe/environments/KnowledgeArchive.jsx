/**
 * KnowledgeArchive.jsx — Scene 6: The Chamber
 *
 * Narrative:
 *   NOVA was trained on everything Shadab learned. Design systems.
 *   AI architectures. Typography. Brand language. Motion theory.
 *   Product thinking. Code. All of it lives here — preserved,
 *   indexed, and endlessly cross-referenced.
 *
 *   The Chamber is a perfect cylinder. It has no exits other than
 *   where you entered. Knowledge accumulates — it doesn't escape.
 *
 *   Five tiers of recessed arches rise up the curved wall — five domains:
 *     Tier 1 (lowest)  → Design craft
 *     Tier 2           → Brand & identity
 *     Tier 3           → AI & machine learning
 *     Tier 4           → Product systems
 *     Tier 5 (highest) → Architecture & strategy
 *
 *   The central beam ascends from the floor to an invisible ceiling.
 *   It is NOVA's processing thread — always ascending, never arriving.
 *   Particles rise along it slowly: individual pieces of knowledge,
 *   perpetually reviewed.
 *
 * Architecture:
 *   Cylinder shell: radius 50, height 220, open top.
 *   5 tiers of arches at heights 20, 50, 80, 110, 140.
 *   Central beam: thin cylinder, radius 0.15, height 220, gold emissive.
 *   Ascending particles: 120 points rising along the beam.
 *   One point light at beam base — warm gold.
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('archive').position;

// ─── Materials ────────────────────────────────────────────────────────────────

const matChamberWall = new THREE.MeshStandardMaterial({
  color:     '#040308',
  metalness: 0.5,
  roughness: 0.75,
  side:      THREE.BackSide,  // render inside of the cylinder
});

const matFloor = new THREE.MeshStandardMaterial({
  color: '#030206', metalness: 0.7, roughness: 0.4,
});

const matBeam = new THREE.MeshBasicMaterial({
  color:      CP.gold,
  transparent: true,
  opacity:    0.28,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
});

const matBeamOuter = new THREE.MeshBasicMaterial({
  color:      CP.amber,
  transparent: true,
  opacity:    0.05,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
  side:       THREE.DoubleSide,
});

const matArchRing = new THREE.MeshStandardMaterial({
  color:     '#050408',
  metalness: 0.7,
  roughness: 0.4,
});

const matArchEmissive = new THREE.MeshBasicMaterial({
  color:      CP.gold,
  transparent: true,
  opacity:    0.08,
  depthWrite: false,
  blending:   THREE.AdditiveBlending,
});

const matParticle = new THREE.PointsMaterial({
  color:           0xd0a050,
  size:            0.09,
  sizeAttenuation: true,
  transparent:     true,
  opacity:         0.55,
  depthWrite:      false,
  blending:        THREE.AdditiveBlending,
});

// ─── Chamber Shell ────────────────────────────────────────────────────────────

function ChamberShell() {
  const geo  = useMemo(() => new THREE.CylinderGeometry(50, 50, 220, 64, 1, true), []);
  const geoF = useMemo(() => new THREE.CircleGeometry(50, 64), []);
  return (
    <>
      <mesh position={[0, 110, 0]} geometry={geo} material={matChamberWall} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}
        geometry={geoF} material={matFloor} />
    </>
  );
}

// ─── Arch Tiers ───────────────────────────────────────────────────────────────
// 5 tiers × 8 arches = 40 knowledge domains, arranged in rising rings.

const TIER_HEIGHTS = [22, 50, 80, 110, 142];
const ARCH_COUNT   = 8;
const geoArchFrame = new THREE.BoxGeometry(5, 12, 0.4);
const geoArchGlow  = new THREE.PlaneGeometry(4.2, 10.5);

function ArchTiers() {
  return (
    <>
      {TIER_HEIGHTS.map((y, ti) => (
        <group key={ti} position={[0, y, 0]}>
          {Array.from({ length: ARCH_COUNT }).map((_, ai) => {
            const angle  = (ai / ARCH_COUNT) * Math.PI * 2;
            const radius = 46;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return (
              <group key={ai} position={[x, 0, z]} rotation={[0, -angle, 0]}>
                <mesh geometry={geoArchFrame} material={matArchRing} />
                <mesh position={[0, 0, 0.3]}
                  geometry={geoArchGlow} material={matArchEmissive} />
              </group>
            );
          })}
        </group>
      ))}
    </>
  );
}

// ─── Knowledge Beam ───────────────────────────────────────────────────────────
// The ascending thread. Knowledge is always processing.

function KnowledgeBeam() {
  const geoBeam  = useMemo(() => new THREE.CylinderGeometry(0.12, 0.12, 220, 8), []);
  const geoOuter = useMemo(() => new THREE.CylinderGeometry(1.5, 2, 220, 8, 1, true), []);
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.opacity = 0.22 + 0.08 * Math.sin(clock.elapsedTime * 0.3);
  });

  return (
    <group position={[0, 110, 0]}>
      <mesh ref={ref} geometry={geoBeam} material={matBeam} />
      <mesh geometry={geoOuter} material={matBeamOuter} />
    </group>
  );
}

// ─── Ascending Particles ──────────────────────────────────────────────────────
// Individual pieces of knowledge, perpetually reviewed.

function KnowledgeParticles() {
  const ref   = useRef();
  const COUNT = 120;

  const geo = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r     = Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.random() * 200;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      p.array[i * 3 + 1] += delta * 1.8;
      if (p.array[i * 3 + 1] > 200) p.array[i * 3 + 1] = 0;
    }
    p.needsUpdate = true;
  });

  return <points ref={ref} geometry={geo} material={matParticle} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnowledgeArchive() {
  return (
    <group position={POS}>
      <ChamberShell />
      <ArchTiers />
      <KnowledgeBeam />
      <KnowledgeParticles />

      {/* Warm gold from the beam base */}
      <pointLight position={[0, 1, 0]} color={CP.gold}
        intensity={1.4} distance={30} decay={1.8} />
      {/* Faint top glow — the ceiling none can see */}
      <pointLight position={[0, 210, 0]} color={CP.gold}
        intensity={0.5} distance={60} decay={2} />
    </group>
  );
}
