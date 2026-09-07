/**
 * WorldAtmosphere.jsx
 * Minimal atmosphere — stripped to what the narrative needs.
 *
 * What remains and why:
 *   Starfield: The void between environments must feel infinite, not empty.
 *   Sparse dust: Proves light exists by floating in it.
 *   Dense fog: Limits visibility — the world reveals itself at walking pace.
 *
 * What was removed:
 *   Nebula clouds: decoration without story.
 *   Heavy dust: hid the architecture in visual noise.
 *   Multiple scatter effects: competed with scene lighting.
 */

import { useRef, useMemo }    from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE              from 'three';
import { ATMOSPHERE_CONFIG }  from '../engine/WorldConfig';

// ─── Starfield ─────────────────────────────────────────────────────────────────
// Stars are sparse and dim — silence, not spectacle.

function Starfield() {
  const ref   = useRef();
  const count = ATMOSPHERE_CONFIG.starCount;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 180 + Math.random() * 340;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 130;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  const material = useMemo(() => new THREE.PointsMaterial({
    color:           0xb0c8e8,
    size:            0.7,
    sizeAttenuation: true,
    transparent:     true,
    opacity:         0.55,
    depthWrite:      false,
    blending:        THREE.AdditiveBlending,
  }), []);

  // Imperceptibly slow drift — the universe breathes
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.0008;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

// ─── World Dust ────────────────────────────────────────────────────────────────
// Just enough particles to make the light beams inside each scene visible.
// They don't move dramatically — they drift.

function WorldDust() {
  const ref   = useRef();
  const count = ATMOSPHERE_CONFIG.dustCount;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 260 - 130;
      vel[i * 3]     = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => new THREE.PointsMaterial({
    color:           0x6070a0,
    size:            0.12,
    sizeAttenuation: true,
    transparent:     true,
    opacity:         0.22,
    depthWrite:      false,
    blending:        THREE.AdditiveBlending,
  }), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      p.array[i * 3]     += velocities[i * 3]     * delta * 60;
      p.array[i * 3 + 1] += velocities[i * 3 + 1] * delta * 60;
    }
    p.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

// ─── Scene Fog ────────────────────────────────────────────────────────────────
// Dense exponential fog. The world reveals itself at walking pace.
// You cannot see what's ahead — only what you're inside.

function SceneFog() {
  const { scene } = useThree();
  useMemo(() => {
    scene.fog = new THREE.FogExp2(
      ATMOSPHERE_CONFIG.fogColor,
      ATMOSPHERE_CONFIG.fogDensity,
    );
  }, [scene]);
  return null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function WorldAtmosphere() {
  return (
    <>
      <SceneFog />
      <Starfield />
      <WorldDust />
    </>
  );
}
