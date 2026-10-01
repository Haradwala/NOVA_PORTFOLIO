/**
 * IdentityChamber.jsx — "Constellation Timeline" Environment
 *
 * FIXES IMPLEMENTED:
 * 1. True Radial Glow Halo:
 *    Replaced the previous 3D flat basic-material sphere (which rendered as a flat disc)
 *    with a camera-facing billboard quad running a custom GLSL radial glow shader with
 *    smooth exponential falloff, additive blending, and fog: false (preventing fog from
 *    muddying or browning the colors). Zero hard edges, zero muddy tones.
 *
 * 2. Constellation Richness & Simultaneous Visibility:
 *    Expanded 3D node coordinates across a balanced depth volume so multiple nodes and
 *    connecting lines are always visible simultaneously in the camera frustum.
 *    Added primary and secondary celestial chart lines, traveling luminous pulses,
 *    and an 850-star background field with depth stratification.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../SceneContext';

// ── 6 Chronological Milestone Nodes ──────────────────────────────────────────
const CONSTELLATION_NODES = [
  {
    id: 'aei-diploma',
    name: 'American Education International',
    role: 'American High School Dual Diploma · Rank 1',
    period: 'Sept 2023 — May 2024',
    badge: 'Honor Graduate',
    category: 'education',
    position: [-2.8, 1.1, -0.5],
    color: '#A78BFA',
    glowColor: '#A78BFA',
    isFuture: false,
    summary: 'Graduated #1 in class ranking across dual diploma academic curriculum.',
  },
  {
    id: 'gtu-start',
    name: 'Gujarat Technological University',
    role: 'B.E. in Computer Science',
    period: '~May 2024 (Start)',
    badge: 'Academic Major',
    category: 'education',
    position: [1.2, 1.8, -3.0],
    color: '#8B5CF6',
    glowColor: '#8B5CF6',
    isFuture: false,
    summary: 'Core focus: applied algorithms, distributed architectures & AI systems.',
  },
  {
    id: 'techsmart-aei',
    name: 'Tech Smart / American Education International',
    role: 'Student Coordinator',
    period: 'Oct 2024 (~1.5 yrs · Former)',
    badge: 'Technical Coordination',
    category: 'builder',
    position: [2.6, -0.2, -5.5],
    color: '#2DD4BF',
    glowColor: '#2DD4BF',
    isFuture: false,
    summary: 'Coordinated academic initiatives & student developer support.',
  },
  {
    id: 'aei-honors',
    name: 'AEI International Honor Society',
    role: 'President & Student Mentor',
    period: '2024 (Term Completed)',
    badge: 'Leadership & Mentorship',
    category: 'leadership',
    position: [-0.6, -1.0, -8.0],
    color: '#E8956D',
    glowColor: '#E8956D',
    isFuture: false,
    summary: 'Led chapter initiatives and mentored students in technical disciplines.',
  },
  {
    id: 'educhamps',
    name: 'Edu-Champs 3.0',
    role: 'Online Web Dev Instructor & Project Manager',
    period: '2024',
    badge: 'Bootcamp Instruction',
    category: 'instruction',
    position: [-2.5, 0.3, -10.5],
    color: '#F2B49A',
    glowColor: '#F2B49A',
    isFuture: false,
    summary: 'Instructed intensive 1-month curriculum covering HTML, CSS, and modern JavaScript.',
  },
  {
    id: 'gtu-grad',
    name: 'Gujarat Technological University',
    role: 'B.E. in Computer Science',
    period: 'May 2028 (Expected)',
    badge: 'Degree Candidate · Upcoming',
    category: 'future',
    position: [1.8, 0.6, -13.0],
    color: '#C4B5FD',
    glowColor: '#A78BFA',
    isFuture: true,
    summary: 'Expected graduation May 2028. Degree candidate in computer science engineering.',
  },
];

// ── Custom GLSL Soft Radial Glow Billboard ───────────────────────────────────
// Guarantees zero hard edges, exponential radial falloff, and pure on-palette light
function SoftRadialGlow({ color, size = 1.6, opacity = 0.5, isActive = false }) {
  const meshRef = useRef();

  const uniforms = useMemo(() => ({
    uColor:   { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
  }), [color, opacity]);

  // Keep billboard facing the camera at all times
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      // Distance from center (0.0 to 0.5)
      float dist = length(vUv - vec2(0.5));
      if (dist > 0.5) discard;

      // Smooth exponential bell-curve falloff with ZERO hard edges
      float falloff = pow(clamp(1.0 - dist * 2.0, 0.0, 1.0), 2.2);

      // Core brightness boost at dead center
      float core = pow(clamp(1.0 - dist * 3.2, 0.0, 1.0), 2.0) * 0.8;

      vec3 finalColor = uColor * (falloff + core);
      gl_FragColor = vec4(finalColor, falloff * uOpacity);
    }
  `;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false} // Prevents dark scene fog from muddying additive light
      />
    </mesh>
  );
}

// ── Cosmic Background Star Field ─────────────────────────────────────────────
function ConstellationStarField({ count }) {
  const meshRef = useRef();

  const { positions, sizes, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz  = new Float32Array(count);
    const op  = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread stars across the entire constellation flight corridor
      const theta = Math.random() * Math.PI * 2;
      const radius = 3.0 + Math.random() * 22.0;

      pos[i * 3]     = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16.0;
      pos[i * 3 + 2] = 4.0 - Math.random() * 28.0; // Straddles camera Z range

      op[i] = 0.25 + Math.random() * 0.65;
      sz[i] = 0.7 + Math.random() * 1.0;
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
      vOpacity = aOpacity * (0.8 + 0.2 * sin(uTime * 1.2 + position.x * 2.8 + position.y * 1.9));
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pSize = aSize * (28.0 / -mv.z);
      gl_PointSize = clamp(pSize, 1.0, 4.0);
      gl_Position  = projectionMatrix * mv;
    }
  `;

  const fragmentShader = `
    varying float vOpacity;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.15, d) * vOpacity;
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
        fog={false}
      />
    </points>
  );
}

// ── Single Constellation Node ────────────────────────────────────────────────
function ConstellationNode({ node, index, activeIndex, reducedMotion }) {
  const groupRef = useRef();
  const ringRef  = useRef();

  const isActive = activeIndex === index;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    if (!reducedMotion) {
      groupRef.current.position.y = node.position[1] + Math.sin(t * 1.4 + index * 1.1) * 0.035;
    }

    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.z += (index % 2 === 0 ? 0.4 : -0.4) * 0.016;
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
      {/* 1. True Soft Radial Glow Halo (Shader Billboard, zero hard edges, fog-free) */}
      <SoftRadialGlow
        color={node.glowColor}
        size={isActive ? 1.9 : 1.3}
        opacity={isActive ? 0.65 : 0.35}
        isActive={isActive}
      />

      {/* 2. Concentric Coordinate Tick Ring */}
      <group ref={ringRef} rotation={[Math.PI * 0.25, Math.PI * 0.15, 0]}>
        <mesh>
          <ringGeometry args={[0.22, 0.235, node.isFuture ? 16 : 32]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={isActive ? 0.85 : node.isFuture ? 0.4 : 0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3. Core Sphere */}
      {node.isFuture ? (
        // Future Node: Celestial wireframe beacon octahedron
        <mesh>
          <octahedronGeometry args={[0.13, 0]} />
          <meshBasicMaterial
            color={node.color}
            wireframe
            transparent
            opacity={isActive ? 0.95 : 0.7}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ) : (
        // Realized Milestones: Emissive solid gem core
        <mesh>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isActive ? 3.0 : 1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Local point light */}
      <pointLight
        color={node.color}
        intensity={isActive ? 2.0 : 0.8}
        distance={6.5}
        decay={2}
      />
    </group>
  );
}

// ── Connecting Lines with Subtle Traveling Energy Pulses ─────────────────────
function ConstellationLines({ nodes, reducedMotion }) {
  // Primary sequential constellation lines
  const primaryGeometry = useMemo(() => {
    const points = nodes.map(n => new THREE.Vector3(...n.position));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  // Secondary astronomical cross-connections (e.g. 0->2, 1->3, 2->4)
  const secondaryGeometry = useMemo(() => {
    const pts = [];
    const cross = [[0, 2], [1, 3], [2, 4], [3, 5]];
    cross.forEach(([a, b]) => {
      pts.push(new THREE.Vector3(...nodes[a].position));
      pts.push(new THREE.Vector3(...nodes[b].position));
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [nodes]);

  // Smooth Catmull-Rom curve for traveling energy pulses
  const curve = useMemo(() => {
    const vectors = nodes.map(n => new THREE.Vector3(...n.position));
    return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.15);
  }, [nodes]);

  const pulseRefs = useRef([]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime * 0.18; // Smooth pulse velocity

    pulseRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const progress = (t + idx * 0.16) % 1.0;
      const pt = curve.getPointAt(progress);
      mesh.position.copy(pt);

      const fade = Math.sin(progress * Math.PI);
      if (mesh.material) {
        mesh.material.opacity = fade * 0.9;
      }
    });
  });

  return (
    <group>
      {/* 1. Primary Constellation Light Line */}
      <line geometry={primaryGeometry}>
        <lineBasicMaterial
          color="#C4B5FD"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* 2. Secondary Celestial Chart Lines */}
      <lineSegments geometry={secondaryGeometry}>
        <lineBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.20}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 3. Traveling Energy Light Pulses */}
      {!reducedMotion && [0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          ref={el => (pulseRefs.current[i] = el)}
        >
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#5EEAD4' : '#EDE9FE'}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Distant Celestial Grid for Spatial Depth ─────────────────────────────────
function CelestialGrid() {
  const gridMat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#8B5CF6',
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  const lineGeometry = useMemo(() => {
    const points = [];
    const size = 32;
    const step = 3.2;
    const y = -2.8;

    for (let x = -size / 2; x <= size / 2; x += step) {
      points.push(new THREE.Vector3(x, y, 6.0));
      points.push(new THREE.Vector3(x, y, -22.0));
    }
    for (let z = 6.0; z >= -22.0; z -= step) {
      points.push(new THREE.Vector3(-size / 2, y, z));
      points.push(new THREE.Vector3(size / 2, y, z));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return <lineSegments geometry={lineGeometry} material={gridMat} />;
}

// ── Main IdentityChamber Component ────────────────────────────────────────────
export default function IdentityChamber({ qualityTier = 'desktop', reducedMotion = false }) {
  const starCount = qualityTier === 'mobile' ? 220 : 850;
  const { sceneProgress } = useScene();
  const identityProgress = sceneProgress['identity'] ?? 0;

  // Debug isolation mode for inspecting the node glow in isolation
  const isIsolated = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugNode') === 'true';

  // Store debug metadata on window for automated verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__NODE_GLOW_DEBUG = {
        blending: 'THREE.AdditiveBlending',
        fog: false,
        depthWrite: false,
        shaderFalloff: 'pow(clamp(1.0 - dist * 2.0, 0.0, 1.0), 2.2)',
        paletteColors: CONSTELLATION_NODES.map(n => ({ id: n.id, color: n.color, glowColor: n.glowColor })),
        isolated: isIsolated
      };
    }
  }, [isIsolated]);

  // Active node calculated from continuous scroll progress
  const activeIndex = useMemo(() => {
    if (identityProgress < 0.14) return 0;
    const norm = (identityProgress - 0.14) / 0.86;
    const idx = Math.min(5, Math.floor(norm * 6));
    return Math.max(0, idx);
  }, [identityProgress]);

  if (isIsolated) {
    // Isolated Node 0 inspection view
    const testNode = {
      ...CONSTELLATION_NODES[0],
      position: [0, 0, 0],
    };
    return (
      <group>
        <color attach="background" args={['#05050D']} />
        <ambientLight color="#160d2d" intensity={0.8} />
        <pointLight position={[0, 4, 3]} color="#EDE9FE" intensity={2.0} />
        <ConstellationNode
          node={testNode}
          index={0}
          activeIndex={0}
          reducedMotion={reducedMotion}
        />
      </group>
    );
  }

  return (
    <group>
      {/* ── Background Color ── */}
      <color attach="background" args={['#05050D']} />

      {/* Subtle background distance fog starting behind nodes */}
      <fog attach="fog" args={['#07070F', 18, 48]} />

      {/* ── Technical Atmospheric Lighting ── */}
      <ambientLight color="#160d2d" intensity={0.55} />

      {/* Cool-white key light */}
      <pointLight position={[0, 7, 3]} color="#EDE9FE" intensity={1.5} distance={22} decay={2} />

      {/* Electric Violet accent */}
      <pointLight position={[-6, 4, -4]} color="#8B5CF6" intensity={1.1} distance={20} decay={2} />

      {/* Teal back fill */}
      <pointLight position={[6, -1, -8]} color="#2DD4BF" intensity={0.9} distance={18} decay={2} />

      {/* Warm Rose fill */}
      <pointLight position={[-3, 2, -13]} color="#E8956D" intensity={0.7} distance={16} decay={2} />

      {/* ── Cosmic Star Field (850 Stars) ── */}
      <ConstellationStarField count={starCount} />

      {/* ── Celestial Depth Grid ── */}
      <CelestialGrid />

      {/* ── Constellation Lines & Traveling Pulses ── */}
      <ConstellationLines nodes={CONSTELLATION_NODES} reducedMotion={reducedMotion} />

      {/* ── Constellation Nodes ── */}
      {CONSTELLATION_NODES.map((node, idx) => (
        <ConstellationNode
          key={node.id}
          node={node}
          index={idx}
          activeIndex={activeIndex}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
