/**
 * TimelineCorridor.jsx — Scene 5: The Canyon
 *
 * Narrative:
 *   Time carved these walls. Every horizontal stratum is a phase of Shadab's
 *   career — student, apprentice, designer, builder — deposited layer by layer
 *   over ten years. You cannot see where the canyon begins or ends.
 *   Only the present moment is visible.
 *
 *   Four strata bands mark the career phases, barely illuminated with amber:
 *     Layer 0 (ground level)  → High School Dual Diploma (Rank 1), AEI 2023–2024
 *     Layer 1 (18 units up)   → Web Dev Instructor & PM, Edu-Champs 3.0 (2024)
 *     Layer 2 (36 units up)   → Student Coordinator, Tech Smart / AEI 2024–Present
 *     Layer 3 (54 units up)   → B.E. Computer Science, GTU 2024–2028
 *
 *   A bridge structure crosses at the height of the career transition
 *   (the moment Shadab crossed from learner to full-stack AI builder).
 *
 *   At the far end: a faint amber horizon glow — the future, not yet reached.
 *
 * Architecture:
 *   Two canyon walls, 200 units tall, 300 units deep, angled inward slightly.
 *   4 horizontal amber emissive bands at strata heights.
 *   One bridge at Y=54, Z=-30 (center of the corridor).
 *   Horizon glow plane at Z=-120.
 *   Floor: stone with faint grid.
 */

import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import * as THREE          from 'three';
import { CP }              from '../engine/WorldConfig';
import { WorldRegistry }   from '../engine/WorldRegistry';

const POS = WorldRegistry.get('timeline').position;

// ─── Strata Bands ─────────────────────────────────────────────────────────────
// Each band = one career phase, carved into the rock.

const STRATA = [
  { y: 0.1,  label: '2023–2024', color: CP.deepAmber, opacity: 0.25 },
  { y: 18,   label: '2024',      color: CP.amber,     opacity: 0.20 },
  { y: 36,   label: '2024–Now',  color: CP.amber,     opacity: 0.28 },
  { y: 54,   label: '2024–2028', color: '#e0a050',    opacity: 0.35 },
];

// ─── Materials ────────────────────────────────────────────────────────────────

const matCanyonWall = new THREE.MeshStandardMaterial({
  color:     '#060408',
  metalness: 0.4,
  roughness: 0.85,
});

const matFloor = new THREE.MeshStandardMaterial({
  color: '#040308', metalness: 0.5, roughness: 0.7,
});

const matBridge = new THREE.MeshStandardMaterial({
  color:     CP.ghost,
  metalness: 0.9,
  roughness: 0.12,
});

// ─── Canyon Walls ─────────────────────────────────────────────────────────────

function CanyonWalls() {
  const geoWall = useMemo(() => new THREE.BoxGeometry(3, 200, 300), []);

  return (
    <>
      {/* Left wall — angled slightly inward at top */}
      <mesh position={[-28, 100, -50]} rotation={[0, 0, 0.015]}
        geometry={geoWall} material={matCanyonWall} />
      {/* Right wall */}
      <mesh position={[28, 100, -50]} rotation={[0, 0, -0.015]}
        geometry={geoWall} material={matCanyonWall} />
    </>
  );
}

// ─── Strata Layers ────────────────────────────────────────────────────────────

function StrataLayers() {
  return (
    <>
      {STRATA.map(({ y, color, opacity }, i) => {
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending:   THREE.AdditiveBlending,
          side:       THREE.DoubleSide,
        });
        const geo = new THREE.BoxGeometry(60, 0.08, 300);
        return (
          <mesh key={i} position={[0, y, -50]} geometry={geo} material={mat} />
        );
      })}
    </>
  );
}

// ─── Career Bridge ────────────────────────────────────────────────────────────
// The crossing: the moment Shadab transitioned from designer to builder.
// It spans the canyon at height 54 — the present career phase.

function CareerBridge() {
  const geoSpan   = useMemo(() => new THREE.BoxGeometry(56, 0.4, 4), []);
  const geoPost   = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 6, 8), []);
  const geoRail   = useMemo(() => new THREE.BoxGeometry(56, 0.15, 0.15), []);

  return (
    <group position={[0, 54, -30]}>
      {/* Main span */}
      <mesh geometry={geoSpan} material={matBridge} />
      {/* Posts */}
      {[-24, -12, 0, 12, 24].map((x, i) => (
        <mesh key={i} position={[x, 3, 0]} geometry={geoPost} material={matBridge} />
      ))}
      {/* Rails */}
      <mesh position={[0, 5.8, 1.8]} geometry={geoRail} material={matBridge} />
      <mesh position={[0, 5.8, -1.8]} geometry={geoRail} material={matBridge} />
      {/* Bridge light — warm amber, the turning point glows */}
      <pointLight color={CP.amber} intensity={1.2} distance={20} decay={2} position={[0, 1, 0]} />
    </group>
  );
}

// ─── Horizon Glow ─────────────────────────────────────────────────────────────
// The future — warm, undefined, not yet reached.

function HorizonGlow() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.opacity = 0.06 + 0.03 * Math.sin(clock.elapsedTime * 0.18);
  });
  const geo = useMemo(() => new THREE.PlaneGeometry(80, 40), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: CP.amber, transparent: true, opacity: 0.08,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  return <mesh ref={ref} position={[0, 20, -148]} geometry={geo} material={mat} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TimelineCorridor() {
  const geoFloor = useMemo(() => new THREE.PlaneGeometry(60, 300), []);

  return (
    <group position={POS}>
      {/* Canyon floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]}
        geometry={geoFloor} material={matFloor} />

      <CanyonWalls />
      <StrataLayers />
      <CareerBridge />
      <HorizonGlow />

      {/* Ambient canyon light — cold light from the sky above */}
      <pointLight position={[0, 80, -50]} color="#b0c0d8"
        intensity={0.3} distance={120} decay={1.5} />

      {/* Floor glow — traces your path */}
      <pointLight position={[0, 0.5, 0]} color={CP.deepAmber}
        intensity={0.4} distance={30} decay={2} />
    </group>
  );
}
