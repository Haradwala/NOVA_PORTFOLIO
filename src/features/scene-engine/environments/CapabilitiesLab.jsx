/**
 * CapabilitiesLab.jsx — "Your Small World" Planetary System
 *
 * CONCEPT:
 * A small glowing digital planet/world (representing Shadab's foundational world)
 * sits at the center, with three genuinely distinct orbiting bodies (moons/satellites)
 * circling it at different radii, speeds, and inclinations:
 *
 *   1. AI & Cognitive Systems (Inner Moon):
 *      Pulsing neural-node surface cluster with synaptic filaments & internal violet energy.
 *   2. Full-Stack Engineering (Middle Moon):
 *      Modular structured grid-like cube lattice with architectural bus rails & luminous teal circuitry.
 *   3. Real-Time 3D & Creative Tech (Outer Moon):
 *      Faceted crystalline wireframe geosphere with gleaming prisms, refractive vertices & rose/amber flare.
 *
 * INTERACTION:
 *   Hover or keyboard focus on a system card in the DOM overlay triggers the corresponding
 *   orbiting body to brighten, pull slightly outward in its orbit, while the other two softly dim.
 *
 * VISUAL COHESION:
 *   - Composed orbital paths with luminous dust particle streams
 *   - 650 background stars providing deep cosmic richness
 *   - Balanced camera framing capturing the entire celestial system in relation to the center
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 1. Cosmic Background Stars ────────────────────────────────────────────────
function CosmicBackground({ count }) {
  const meshRef = useRef();

  const { positions, sizes, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz  = new Float32Array(count);
    const op  = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r     = 5.0 + Math.random() * 25.0;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      pos[i * 3 + 2] = -2.5 - Math.abs(r * Math.cos(phi)) * 1.4;

      const depth = Math.abs(pos[i * 3 + 2]);
      op[i] = Math.max(0.12, 0.65 - depth / 40.0);
      sz[i] = 0.6 + Math.random() * 0.8;
    }
    return { positions: pos, sizes: sz, opacities: op };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize',    new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aOpacity', new THREE.Float32BufferAttribute(opacities, 1));
    return geo;
  }, [positions, sizes, opacities]);

  const vertexShader = `
    attribute float aSize;
    attribute float aOpacity;
    varying float vOpacity;
    uniform float uTime;

    void main() {
      vOpacity = aOpacity * (0.8 + 0.2 * sin(uTime * 1.1 + position.x * 2.9 + position.y * 1.7));
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pSize = aSize * (26.0 / -mv.z);
      gl_PointSize = clamp(pSize, 1.0, 3.8);
      gl_Position  = projectionMatrix * mv;
    }
  `;

  const fragmentShader = `
    varying float vOpacity;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.2, d) * vOpacity;
      gl_FragColor = vec4(0.88, 0.88, 0.98, alpha);
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

// ── 2. Central World ("Shadab's World") ───────────────────────────────────────
function CentralWorld({ reducedMotion }) {
  const globeRef      = useRef();
  const equatorRef    = useRef();
  const atmosphereRef = useRef();

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (globeRef.current) globeRef.current.rotation.y = t * 0.08;
    if (equatorRef.current) equatorRef.current.rotation.z = t * 0.04;
    if (atmosphereRef.current) {
      const s = 1 + Math.sin(t * 1.8) * 0.02;
      atmosphereRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Planetary Dark Body */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[0.78, 36, 36]} />
        <meshStandardMaterial
          color="#0B0820"
          emissive="#2A1252"
          emissiveIntensity={0.65}
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>

      {/* Atmospheric Luminous Outer Envelope */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[0.88, 32, 32]} />
        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Latitude / Longitude Wireframe Grid Shell */}
      <mesh rotation={[Math.PI * 0.1, 0, 0]}>
        <sphereGeometry args={[0.81, 16, 12]} />
        <meshBasicMaterial
          color="#8B5CF6"
          wireframe
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Central Technical Equator Coordinate Ring */}
      <group ref={equatorRef} rotation={[Math.PI * 0.35, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.96, 0.99, 48]} />
          <meshBasicMaterial
            color="#2DD4BF"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Internal core point light */}
      <pointLight color="#EDE9FE" intensity={1.5} distance={7} decay={2} />
    </group>
  );
}

// ── 3. Moon 1: AI & Cognitive Systems (Synaptic / Neural Satellite) ────────────
function NeuralMoon({ isFocused, isDimmed, reducedMotion }) {
  const orbitRef = useRef();
  const moonRef  = useRef();
  const radiusRef = useRef(2.35);

  // Neural surface nodes on the moon
  const nodePositions = useMemo(() => [
    [0.18, 0.12, 0.08],
    [-0.14, 0.16, -0.09],
    [0.12, -0.16, 0.12],
    [-0.15, -0.12, -0.11],
    [0.05, 0.21, 0.0],
    [-0.08, -0.19, 0.09],
  ], []);

  // Interconnecting synaptic lines
  const synapticLines = useMemo(() => {
    const pts = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        pts.push(new THREE.Vector3(...nodePositions[i]));
        pts.push(new THREE.Vector3(...nodePositions[j]));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [nodePositions]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Orbit speed: 0.45 rad/s; inclination: 18 deg
    const speed = reducedMotion ? 0.08 : 0.42;
    const targetRadius = isFocused ? 2.85 : 2.35;
    radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetRadius, 0.08);

    const angle = t * speed;
    const x = Math.cos(angle) * radiusRef.current;
    const z = Math.sin(angle) * radiusRef.current;
    const y = Math.sin(angle * 1.5) * (radiusRef.current * 0.32);

    if (moonRef.current) {
      moonRef.current.position.set(x, y, z);
      moonRef.current.rotation.y = t * 0.6;
      moonRef.current.rotation.x = t * 0.3;
    }
  });

  const opacityMultiplier = isDimmed ? 0.32 : isFocused ? 1.0 : 0.85;

  return (
    <group ref={orbitRef}>
      {/* Elliptical Orbit Track Line */}
      <mesh rotation={[Math.PI * 0.12, 0, Math.PI * 0.05]}>
        <torusGeometry args={[2.35, 0.008, 12, 80]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={isFocused ? 0.75 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* The Neural Satellite Body */}
      <group ref={moonRef}>
        {/* Core glowing sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#A78BFA"
            emissiveIntensity={isFocused ? 2.5 : 1.4}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={opacityMultiplier}
          />
        </mesh>

        {/* Outer Pulsing Halo */}
        <mesh>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshBasicMaterial
            color="#C4B5FD"
            transparent
            opacity={isFocused ? 0.4 : 0.18 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Synaptic Network Shell */}
        <lineSegments geometry={synapticLines}>
          <lineBasicMaterial
            color="#EDE9FE"
            transparent
            opacity={0.65 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Synaptic Nodes */}
        {nodePositions.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial
              color="#EDE9FE"
              transparent
              opacity={0.9 * opacityMultiplier}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}

        <pointLight
          color="#8B5CF6"
          intensity={isFocused ? 1.8 : 0.8}
          distance={5}
          decay={2}
        />
      </group>
    </group>
  );
}

// ── 4. Moon 2: Full-Stack Engineering (Modular / Structured Satellite) ─────────
function ModularMoon({ isFocused, isDimmed, reducedMotion }) {
  const moonRef   = useRef();
  const innerRef  = useRef();
  const radiusRef = useRef(3.55);

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(0.38, 0.38, 0.38), []);
  const cubeEdges = useMemo(() => new THREE.EdgesGeometry(cubeGeo), [cubeGeo]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Orbit speed: 0.30 rad/s; inclination: -24 deg
    const speed = reducedMotion ? 0.06 : 0.30;
    const targetRadius = isFocused ? 4.05 : 3.55;
    radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetRadius, 0.08);

    // Staggered starting phase (+2.1 rad)
    const angle = t * speed + 2.1;
    const x = Math.cos(angle) * radiusRef.current;
    const z = Math.sin(angle) * radiusRef.current;
    const y = -Math.sin(angle * 1.2) * (radiusRef.current * 0.35);

    if (moonRef.current) {
      moonRef.current.position.set(x, y, z);
      moonRef.current.rotation.x = t * 0.35;
      moonRef.current.rotation.y = t * 0.45;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.6;
      innerRef.current.rotation.y = -t * 0.5;
    }
  });

  const opacityMultiplier = isDimmed ? 0.32 : isFocused ? 1.0 : 0.85;

  return (
    <group>
      {/* Elliptical Orbit Track Line */}
      <mesh rotation={[-Math.PI * 0.16, 0, -Math.PI * 0.08]}>
        <torusGeometry args={[3.55, 0.008, 12, 80]} />
        <meshBasicMaterial
          color="#2DD4BF"
          transparent
          opacity={isFocused ? 0.75 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* The Modular Satellite Body */}
      <group ref={moonRef}>
        {/* Outer Rotating Architectural Cage */}
        <lineSegments geometry={cubeEdges}>
          <lineBasicMaterial
            color="#5EEAD4"
            transparent
            opacity={0.85 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Micro-Module Corner Data Bus Vertices */}
        {[
          [-0.19, -0.19, -0.19], [0.19, -0.19, -0.19],
          [-0.19,  0.19, -0.19], [0.19,  0.19, -0.19],
          [-0.19, -0.19,  0.19], [0.19, -0.19,  0.19],
          [-0.19,  0.19,  0.19], [0.19,  0.19,  0.19],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial
              color="#2DD4BF"
              transparent
              opacity={0.9 * opacityMultiplier}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}

        {/* Counter-Rotating Inner Kernel */}
        <group ref={innerRef}>
          <mesh>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial
              color="#2DD4BF"
              emissive="#2DD4BF"
              emissiveIntensity={isFocused ? 2.4 : 1.3}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={opacityMultiplier}
            />
          </mesh>
        </group>

        {/* Soft Teal Halo */}
        <mesh>
          <sphereGeometry args={[0.39, 16, 16]} />
          <meshBasicMaterial
            color="#2DD4BF"
            transparent
            opacity={isFocused ? 0.38 : 0.16 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <pointLight
          color="#2DD4BF"
          intensity={isFocused ? 1.8 : 0.8}
          distance={5}
          decay={2}
        />
      </group>
    </group>
  );
}

// ── 5. Moon 3: Real-Time 3D & Creative Tech (Crystalline Wireframe Satellite) ─
function CrystallineMoon({ isFocused, isDimmed, reducedMotion }) {
  const moonRef   = useRef();
  const ringRef1  = useRef();
  const ringRef2  = useRef();
  const radiusRef = useRef(4.75);

  const icosaGeo   = useMemo(() => new THREE.IcosahedronGeometry(0.24, 0), []);
  const icosaEdges = useMemo(() => new THREE.EdgesGeometry(icosaGeo), [icosaGeo]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Orbit speed: 0.20 rad/s; inclination: 32 deg
    const speed = reducedMotion ? 0.04 : 0.20;
    const targetRadius = isFocused ? 5.25 : 4.75;
    radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetRadius, 0.08);

    // Staggered starting phase (+4.2 rad)
    const angle = t * speed + 4.2;
    const x = Math.cos(angle) * radiusRef.current;
    const z = Math.sin(angle) * radiusRef.current;
    const y = Math.sin(angle * 1.3) * (radiusRef.current * 0.42);

    if (moonRef.current) {
      moonRef.current.position.set(x, y, z);
      moonRef.current.rotation.y = t * 0.5;
      moonRef.current.rotation.z = t * 0.35;
    }
    if (ringRef1.current) ringRef1.current.rotation.x = t * 0.8;
    if (ringRef2.current) ringRef2.current.rotation.y = t * 0.7;
  });

  const opacityMultiplier = isDimmed ? 0.32 : isFocused ? 1.0 : 0.85;

  return (
    <group>
      {/* Elliptical Orbit Track Line */}
      <mesh rotation={[Math.PI * 0.22, 0, Math.PI * 0.12]}>
        <torusGeometry args={[4.75, 0.008, 12, 80]} />
        <meshBasicMaterial
          color="#E8956D"
          transparent
          opacity={isFocused ? 0.75 : 0.20}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* The Crystalline Satellite Body */}
      <group ref={moonRef}>
        {/* Faceted Crystalline Wireframe */}
        <lineSegments geometry={icosaEdges}>
          <lineBasicMaterial
            color="#F2B49A"
            transparent
            opacity={0.88 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Gleaming Core Prismatic Geosphere */}
        <mesh>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color="#E8956D"
            emissive="#E8956D"
            emissiveIntensity={isFocused ? 2.6 : 1.4}
            roughness={0.15}
            metalness={0.9}
            transparent
            opacity={opacityMultiplier}
          />
        </mesh>

        {/* Dual Orthogonal Gyro Rings */}
        <mesh ref={ringRef1}>
          <torusGeometry args={[0.31, 0.008, 12, 36]} />
          <meshBasicMaterial
            color="#E8956D"
            transparent
            opacity={0.55 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={ringRef2}>
          <torusGeometry args={[0.26, 0.008, 12, 36]} />
          <meshBasicMaterial
            color="#EDE9FE"
            transparent
            opacity={0.45 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Soft Rose / Amber Halo */}
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial
            color="#E8956D"
            transparent
            opacity={isFocused ? 0.42 : 0.16 * opacityMultiplier}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <pointLight
          color="#E8956D"
          intensity={isFocused ? 1.8 : 0.8}
          distance={5}
          decay={2}
        />
      </group>
    </group>
  );
}

// ── 6. Main CapabilitiesLab Scene ─────────────────────────────────────────────
export default function CapabilitiesLab({ qualityTier = 'desktop', reducedMotion = false }) {
  const starCount = qualityTier === 'mobile' ? 180 : 650;
  const [activeSystem, setActiveSystem] = useState(null);

  // Listen for hover / focus interactions from the DOM Capabilities cards
  useEffect(() => {
    const onSystemFocus = (e) => {
      setActiveSystem(e.detail?.systemId ?? null);
    };
    window.addEventListener('capabilities-system-focus', onSystemFocus);
    return () => window.removeEventListener('capabilities-system-focus', onSystemFocus);
  }, []);

  return (
    <group position={[0, 0, -1.2]}>
      {/* ── Background & Fog ── */}
      <color attach="background" args={['#05050D']} />
      <fog attach="fog" args={['#07070F', 7, 36]} />

      {/* ── Atmosphere Lighting ── */}
      <ambientLight color="#120c26" intensity={0.55} />

      {/* Key Teal Systems Light */}
      <pointLight position={[0, 6, 3]} color="#2DD4BF" intensity={1.2} distance={18} decay={2} />

      {/* Electric Violet Fill */}
      <pointLight position={[-6, 3, 0]} color="#8B5CF6" intensity={1.0} distance={16} decay={2} />

      {/* Warm Rose Rim */}
      <pointLight position={[6, -2, -3]} color="#E8956D" intensity={0.8} distance={15} decay={2} />

      {/* ── Cosmic Star Field ── */}
      <CosmicBackground count={starCount} />

      {/* ── Central World: "Shadab's World" ── */}
      <CentralWorld reducedMotion={reducedMotion} />

      {/* ── 3 Distinct Orbiting Bodies (Moons) ── */}
      {/* Moon 1: AI & Cognitive Systems */}
      <NeuralMoon
        isFocused={activeSystem === 'ai-cognitive'}
        isDimmed={activeSystem !== null && activeSystem !== 'ai-cognitive'}
        reducedMotion={reducedMotion}
      />

      {/* Moon 2: Full-Stack Engineering */}
      <ModularMoon
        isFocused={activeSystem === 'fullstack-core'}
        isDimmed={activeSystem !== null && activeSystem !== 'fullstack-core'}
        reducedMotion={reducedMotion}
      />

      {/* Moon 3: Real-Time 3D & Creative Tech */}
      <CrystallineMoon
        isFocused={activeSystem === 'creative-3d'}
        isDimmed={activeSystem !== null && activeSystem !== 'creative-3d'}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
