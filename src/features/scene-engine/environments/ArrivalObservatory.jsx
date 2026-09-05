/**
 * ArrivalObservatory.jsx — Phase 2: Arrival / Hero Environment
 *
 * A deep-space observatory environment rendered as an R3F scene.
 * This renders BEHIND the NOVA Core (which has its own separate Canvas at higher z-index).
 *
 * Design language:
 *   - Deep near-black void (#07070F base, fog #05050D)
 *   - Sparse depth-sorted cosmic dust / starfield with subtle twinkling
 *   - Two concentric architectural observatory rings — subtle, distant, slowly rotating
 *   - Soft violet (#8B5CF6) ambient and cool-white (#EDE9FE) key point lighting
 *   - Restrained rose (#E8956D) and teal (#2DD4BF) accent fill lights
 *   - Atmospheric distance fog
 *   - Quality scaling: 800 stars on desktop, 200 on mobile
 *
 * This component is placed inside CinematicUniverseCanvas which is:
 *   position: fixed, z-index: 0, pointer-events: none
 * The NOVA Core Canvas sits at z-index: 5 (relative inside the Hero section).
 * All Hero UI overlays sit at z-index ≥ 5.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Particle field (cosmic dust / stars) ──────────────────────────────────────
function StarField({ count }) {
  const meshRef = useRef();

  const { positions, sizes, opacities } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const sz   = new Float32Array(count);
    const op   = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere around the camera, skewed deeper on Z
      const r     = 4.0 + Math.random() * 28.0;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55; // flatten Y
      // Push behind scene origin so stars form a true deep cosmic background
      pos[i * 3 + 2] = -2.0 - Math.abs(r * Math.cos(phi)) * 1.4;

      // Depth-sorted opacity: farther = dimmer, closer = crisp luminous points
      const depth = Math.abs(pos[i * 3 + 2]);
      op[i]  = Math.max(0.12, 0.65 - depth / 45.0);
      sz[i]  = 0.6 + Math.random() * 0.8;
    }
    return { positions: pos, sizes: sz, opacities: op };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',  new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize',     new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aOpacity',  new THREE.Float32BufferAttribute(opacities, 1));
    return geo;
  }, [positions, sizes, opacities]);

  // Vertex: crisp point sizing with depth attenuation and clamp to prevent blurry blobs
  const vertexShader = `
    attribute float aSize;
    attribute float aOpacity;
    varying float vOpacity;
    uniform float uTime;

    void main() {
      vOpacity = aOpacity * (0.75 + 0.25 * sin(uTime * 1.2 + position.x * 3.7 + position.y * 2.1));
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pSize = aSize * (24.0 / -mv.z);
      gl_PointSize = clamp(pSize, 1.0, 3.8);
      gl_Position  = projectionMatrix * mv;
    }
  `;

  // Fragment: crisp stellar pinpricks with tight 1px anti-aliased edge (no fuzzy halo)
  const fragmentShader = `
    varying float vOpacity;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.25, d) * vOpacity;
      gl_FragColor = vec4(0.88, 0.86, 0.98, alpha); // cool-lavender white
    }
  `;

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Observatory ring — a thin torus with subtle rotation ──────────────────────
function ObservatoryRing({ radius, tubeRadius, rotationSpeed, tilt, color, opacity }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 6, 120]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.85}
        metalness={0.45}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Main Arrival Observatory component ────────────────────────────────────────
export default function ArrivalObservatory({ qualityTier, reducedMotion }) {
  const starCount = qualityTier === 'mobile' ? 220 : 800;

  // Ring rotation speeds — zero on reduced-motion
  const ringSpeed1 = reducedMotion ? 0 : 0.012;
  const ringSpeed2 = reducedMotion ? 0 : -0.007;

  return (
    <>
      {/* ── Scene fog and background colour ── */}
      <color attach="background" args={['#05050D']} />
      <fog attach="fog" args={['#07070F', 22, 55]} />

      {/* ── Ambient fill — deep violet ── */}
      <ambientLight color="#200d3a" intensity={0.35} />

      {/* ── Key light — soft cool-white from above-front ── */}
      <pointLight
        position={[0, 6, 4]}
        color="#EDE9FE"
        intensity={1.8}
        distance={22}
        decay={2}
      />

      {/* ── Violet accent fill — left ── */}
      <pointLight
        position={[-8, 2, -3]}
        color="#8B5CF6"
        intensity={0.9}
        distance={18}
        decay={2}
      />

      {/* ── Rose accent fill — right (very restrained) ── */}
      <pointLight
        position={[8, -1, -5]}
        color="#E8956D"
        intensity={0.32}
        distance={14}
        decay={2.5}
      />

      {/* ── Teal back-fill — creates depth separation ── */}
      <pointLight
        position={[0, -3, -12]}
        color="#2DD4BF"
        intensity={0.22}
        distance={16}
        decay={2}
      />

      {/* ── Cosmic star field ── */}
      <StarField count={starCount} />

      {/* ── Observatory rings — distant architectural structures ── */}
      {/* Inner ring — closer, tilted, violet-tinted */}
      <ObservatoryRing
        radius={3.6}
        tubeRadius={0.012}
        rotationSpeed={ringSpeed1}
        tilt={Math.PI * 0.08}
        color="#A78BFA"
        opacity={0.18}
      />

      {/* Outer ring — further back, flatter, cool-white */}
      <ObservatoryRing
        radius={5.4}
        tubeRadius={0.008}
        rotationSpeed={ringSpeed2}
        tilt={Math.PI * 0.04}
        color="#C4B5FD"
        opacity={0.10}
      />

      {/* Far ring — barely visible, sense of scale */}
      <ObservatoryRing
        radius={9.2}
        tubeRadius={0.005}
        rotationSpeed={reducedMotion ? 0 : 0.003}
        tilt={Math.PI * 0.02}
        color="#818CF8"
        opacity={0.055}
      />
    </>
  );
}
