/**
 * ProjectVault.jsx — Scene 4: The Vault
 *
 * Narrative:
 *   Projects don't disappear when they're done. In NOVA's memory, they
 *   become permanent — artifacts preserved in their own gravity fields.
 *   This is where Shadab's work lives after it's been released into the world.
 *
 *   Each artifact has its own light source — warm amber rising from below.
 *   The light comes from inside the artifact, not from above.
 *   The work illuminates its own context.
 *
 *   40+ units of void separate the artifacts. The space between them is
 *   not empty — it holds the weight of what came between these projects.
 *   Time. Growth. Failure. Iteration.
 *
 *   The visitor must travel through the void to reach each artifact.
 *   You cannot see all four from any single position.
 *
 * Architecture:
 *   4 floating artifacts at [±22, varied Y, ±22 from center] — a diamond.
 *   Each has a unique geometric form (brand, organic, systematic, cyclical).
 *   Each has one amber pointLight beneath it.
 *   Floor: dark stone, barely visible.
 *   Ceiling: non-existent.
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('projects').position;

// ─── Materials ────────────────────────────────────────────────────────────────

const matArtifactBase = (emissiveColor, intensity) => new THREE.MeshStandardMaterial({
  color:     CP.ghost,
  metalness: 0.95,
  roughness: 0.05,
  emissive:  new THREE.Color(emissiveColor),
  emissiveIntensity: intensity,
});

const matFloor = new THREE.MeshStandardMaterial({
  color: '#030408', metalness: 0.82, roughness: 0.25,
});

// ─── Individual Artifact Forms ────────────────────────────────────────────────
// Each geometry chosen for narrative reason:
//   NOVA (living interface)   → OctahedronGeometry: cognitive architecture
//   FORGE (local-first)       → BoxGeometry: modular, local-first engine
//   Petal n Pins (commerce)   → TorusGeometry: live commerce platform
//   NOVA Desktop (automation) → IcosahedronGeometry: desktop automation & vision

const ARTIFACTS = [
  {
    label:    'NOVA — Operating Environment',
    pos:      [-22, 8, -15],
    geometry: () => new THREE.OctahedronGeometry(2.2, 0),
    emissive: '#8b5820',
    lightColor: '#b87333',
    lightIntensity: 1.8,
    rotSpeed: [0.025, 0.018, 0],
  },
  {
    label:    'FORGE — Local-First Platform',
    pos:      [22, 11, -15],
    geometry: () => new THREE.BoxGeometry(3.2, 3.2, 3.2),
    emissive: '#103a20',
    lightColor: '#2a8a50',
    lightIntensity: 1.6,
    rotSpeed: [0.015, 0.03, 0.01],
  },
  {
    label:    'Petal n Pins — E-Commerce',
    pos:      [-22, 7, -35],
    geometry: () => new THREE.TorusGeometry(1.8, 0.55, 16, 80),
    emissive: '#1a1040',
    lightColor: '#6050c0',
    lightIntensity: 1.6,
    rotSpeed: [0.02, 0.025, 0.005],
  },
  {
    label:    'NOVA Desktop — Automation Assistant',
    pos:      [22, 9, -35],
    geometry: () => new THREE.IcosahedronGeometry(2.0, 1),
    emissive: '#301040',
    lightColor: '#9060d0',
    lightIntensity: 1.5,
    rotSpeed: [0.03, 0.015, 0.02],
  },
];

// ─── Single Artifact ──────────────────────────────────────────────────────────

function Artifact({ pos, geometry: makeGeo, emissive, lightColor, lightIntensity, rotSpeed }) {
  const ref   = useRef();
  const mat   = useMemo(() => matArtifactBase(emissive, 0.08), [emissive]);
  const geo   = useMemo(makeGeo, []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    // Float gently — not identically
    ref.current.position.y = pos[1] + Math.sin(t * 0.25 + phase) * 0.8;
    ref.current.rotation.x += delta * rotSpeed[0];
    ref.current.rotation.y += delta * rotSpeed[1];
    ref.current.rotation.z += delta * rotSpeed[2];
    // Breathe emissive
    ref.current.material.emissiveIntensity = 0.06 + 0.04 * Math.sin(t * 0.35 + phase);
  });

  return (
    <group>
      <mesh ref={ref} position={pos} geometry={geo} material={mat} />
      {/* Light comes from within the work — the project illuminates itself */}
      <pointLight
        position={[pos[0], pos[1] - 3.5, pos[2]]}
        color={lightColor}
        intensity={lightIntensity}
        distance={18}
        decay={2}
      />
    </group>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectVault() {
  const geoFloor = useMemo(() => new THREE.PlaneGeometry(120, 80), []);

  return (
    <group position={POS}>
      {/* Floor — dark stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}
        geometry={geoFloor} material={matFloor} />

      {/* 4 artifacts — each in its own gravity */}
      {ARTIFACTS.map((a, i) => (
        <Artifact key={i} {...a} />
      ))}

      {/* Very faint overall scene fill — the vault is not completely blind */}
      <pointLight position={[0, 20, -25]} color={CP.deepAmber}
        intensity={0.15} distance={50} decay={1.5} />
    </group>
  );
}
