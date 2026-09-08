/**
 * CapabilitiesLab.jsx — Phase 3: Capabilities Scene Environment
 *
 * Visual direction: Systems Lab.
 * Features:
 *   - Teal (#2DD4BF) and electric violet (#8B5CF6) technical lighting
 *   - Three distinct 3D visual representations:
 *       1. AI / Cognitive Pipelines (Left): Glowing synaptic node cluster
 *       2. Full-Stack Modular Core (Center): Rotating wireframe prism with data bus rails
 *       3. Real-Time 3D Gyro Array (Right): Dual rotating gyro rings with vertical light beam
 *   - Floating digital data packet particles (budget: 180 desktop, 60 mobile)
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── System 1: AI / Cognitive Synapse (Left) ──────────────────────────────────
function NeuralSynapse({ position = [-3.4, 0.2, -2] }) {
  const groupRef = useRef();

  // 6 synaptic nodes in a tetrahedral/cluster arrangement
  const nodes = useMemo(() => [
    [0, 0.7, 0],
    [-0.55, 0.1, 0.4],
    [0.55, 0.1, 0.4],
    [0, -0.4, -0.5],
    [-0.45, -0.5, 0.3],
    [0.45, -0.5, 0.3],
  ], []);

  // Interconnecting line geometry between all adjacent pairs
  const lineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        points.push(new THREE.Vector3(...nodes[i]));
        points.push(new THREE.Vector3(...nodes[j]));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: '#8B5CF6',
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    // Breathing scale
    const s = 1 + Math.sin(t * 1.4) * 0.05;
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Interconnecting synaptic branches */}
      <lineSegments geometry={lineGeometry} material={lineMaterial} />

      {/* Synaptic nodes */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial
            color="#A78BFA"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Central neural core glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight color="#8B5CF6" intensity={1.1} distance={8} decay={2} />
    </group>
  );
}

// ── System 2: Full-Stack Modular Core (Center) ────────────────────────────────
function ModularCore({ position = [0, 0, -2.5] }) {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.15;
      outerRef.current.rotation.y = t * 0.22;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.3;
      innerRef.current.rotation.y = -t * 0.35;
    }
  });

  const wireframeGeo = useMemo(() => new THREE.BoxGeometry(1.3, 1.3, 1.3), []);
  const wireframeEdges = useMemo(() => new THREE.EdgesGeometry(wireframeGeo), [wireframeGeo]);

  return (
    <group position={position}>
      {/* Outer rotating wireframe cube with data rails */}
      <group ref={outerRef}>
        <lineSegments geometry={wireframeEdges}>
          <lineBasicMaterial
            color="#2DD4BF"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Bus rail vertex markers */}
        {[
          [-0.65, -0.65, -0.65], [0.65, -0.65, -0.65],
          [-0.65,  0.65, -0.65], [0.65,  0.65, -0.65],
          [-0.65, -0.65,  0.65], [0.65, -0.65,  0.65],
          [-0.65,  0.65,  0.65], [0.65,  0.65,  0.65],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshBasicMaterial color="#5EEAD4" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Inner counter-rotating core */}
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          <meshBasicMaterial
            color="#2DD4BF"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <pointLight color="#2DD4BF" intensity={1.2} distance={9} decay={2} />
    </group>
  );
}

// ── System 3: Real-Time 3D Gyro Array (Right) ────────────────────────────────
function GyroRingBeam({ position = [3.4, 0.2, -2] }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ring1Ref.current) ring1Ref.current.rotation.x = t * 0.45;
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * 0.35;
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.72, 0.022, 16, 64]} />
        <meshBasicMaterial
          color="#A78BFA"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner orthogonal ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.52, 0.022, 16, 64]} />
        <meshBasicMaterial
          color="#E8956D"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Focused vertical light shaft */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 4.0, 16]} />
        <meshBasicMaterial
          color="#EDE9FE"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Central focal point */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#EDE9FE"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight color="#E8956D" intensity={0.9} distance={8} decay={2} />
    </group>
  );
}

// ── Floating Data Packet Particles ───────────────────────────────────────────
function DataParticles({ count = 180 }) {
  const pointsRef = useRef();

  const { positions, opacities, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const op  = new Float32Array(count);
    const sp  = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18.0;
      pos[i * 3 + 1] = -1.5 + Math.random() * 6.5;
      pos[i * 3 + 2] = -6.5 + Math.random() * 8.0;

      op[i] = 0.2 + Math.random() * 0.5;
      sp[i] = 0.2 + Math.random() * 0.4;
    }
    return { positions: pos, opacities: op, speeds: sp };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.045,
    color: new THREE.Color('#2DD4BF'),
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * speeds[i];
      if (y > 5.5) y = -1.5;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ── Main CapabilitiesLab Component ────────────────────────────────────────────
export default function CapabilitiesLab({ qualityTier = 'desktop', reducedMotion = false }) {
  const particleCount = qualityTier === 'mobile' ? 60 : 180;

  return (
    <group>
      {/* Background distance fog */}
      <fog attach="fog" args={['#05050D', 4, 25]} />

      {/* Technical ambient lighting */}
      <ambientLight color="#0F172A" intensity={0.7} />

      {/* Systems Lab key teal illumination */}
      <pointLight position={[0, 4, 2]} color="#2DD4BF" intensity={0.8} distance={16} decay={2} />

      {/* Violet fill */}
      <pointLight position={[-4, 2, 0]} color="#8B5CF6" intensity={0.7} distance={14} decay={2} />

      {/* Warm rose rim */}
      <pointLight position={[4, 2, 0]} color="#E8956D" intensity={0.6} distance={14} decay={2} />

      {/* Three distinct visual systems */}
      <NeuralSynapse />
      <ModularCore />
      <GyroRingBeam />

      {/* Floating technical data particles */}
      {!reducedMotion && <DataParticles count={particleCount} />}
    </group>
  );
}
