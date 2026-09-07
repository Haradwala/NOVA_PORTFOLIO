import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// ── Obsidian Orb Shader ─────────────────────────────────────────────────────
// Near-black glossy sphere with an internal soft glow visible through the surface
// (like a smoked-glass marble lit from within) + thin purple/peach rim light.
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uPulse;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec3 p = position;
    
    // Gentle breathing & internal wave
    float breathe = sin(uTime * 1.2) * 0.028;
    float wave = sin(p.y * 3.5 + p.x * 2.5 + uTime * 0.9) * 0.02;
    float pulseWave = sin(p.y * 5.0 - uTime * 2.5) * uPulse * 0.06;
    
    vDisplacement = wave + pulseWave;
    p += normal * (breathe + wave + pulseWave);
    
    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    vPosition = (modelViewMatrix * vec4(p, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;
  varying float vDisplacement;
  uniform float uTime;
  uniform float uPulse;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    vec3 normal = normalize(vNormal);

    // Fresnel rim calculation
    float NdotV = max(dot(normal, viewDir), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.8);

    // 1. Smoked Glass / Near-black Obsidian Base
    vec3 obsidianBase = vec3(0.018, 0.012, 0.04); // near black

    // 2. Internal Soft Glow (lit from within like a smoked-glass marble)
    float internalPulse = sin(vPosition.y * 2.8 + uTime * 0.8) * 0.5 + 0.5;
    vec3 internalPurple = vec3(0.48, 0.32, 0.92); // soft violet glow
    vec3 internalPeach  = vec3(0.95, 0.55, 0.42); // warm peach accent
    vec3 internalGlow   = mix(internalPurple, internalPeach, internalPulse * 0.4);
    
    // Translucent depth visibility (brighter in center, darkening toward edges)
    float depthFactor = pow(NdotV, 1.8);
    vec3 bodyColor = mix(obsidianBase, internalGlow * 0.45, depthFactor * (0.5 + uPulse * 0.4));

    // 3. Thin Purple/Peach Rim Light at Silhouette Edge
    vec3 rimPurple = vec3(0.62, 0.49, 1.0);  // #9e7eff
    vec3 rimPeach  = vec3(1.0, 0.70, 0.54);  // #ffb38a
    vec3 rimColor  = mix(rimPurple, rimPeach, internalPulse);

    // 4. Glossy Specular Highlight (Reflection spot)
    vec3 lightDir = normalize(vec3(0.6, 0.8, 1.0));
    vec3 halfDir  = normalize(lightDir + viewDir);
    float spec    = pow(max(dot(normal, halfDir), 0.0), 38.0);
    vec3 specular = vec3(0.9, 0.92, 1.0) * spec * 0.65;

    // Combine base, rim glow, internal light & glossy highlight
    vec3 finalColor = bodyColor + rimColor * fresnel * 1.35 + specular;
    finalColor += rimPurple * (vDisplacement * 0.15 + uPulse * 0.25);

    gl_FragColor = vec4(finalColor, 0.96);
  }
`;

// ── Smoked-Glass Internal Core Mesh ─────────────────────────────────────────
function ObsidianCoreMesh({ isHovered, activeWorld, pulseTrigger }) {
  const matRef = useRef();

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const targetPulse = activeWorld ? 0.8 : isHovered ? 0.35 : pulseTrigger ? 1.0 : 0.0;
      matRef.current.uniforms.uPulse.value += (targetPulse - matRef.current.uniforms.uPulse.value) * delta * 4;
    }
  });

  return (
    <group>
      {/* Outer Obsidian Glass Shell */}
      <mesh>
        <sphereGeometry args={[1.08, 80, 80]} />
        <shaderMaterial
          ref={matRef}
          uniforms={{
            uTime: { value: 0 },
            uPulse: { value: 0 },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </mesh>
      {/* Inner Soft Luminous Nucleus */}
      <mesh scale={0.58}>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Thin HUD Concentric Rings (Hidden at idle, visible on hover/focus) ─────
function HudRings({ isHovered, activeWorld }) {
  const innerRing = useRef();
  const outerRing = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const targetScale = activeWorld ? 1.25 : isHovered ? 1.12 : 0.95;
    const targetOpacity = (isHovered || activeWorld) ? 0.35 : 0.0;

    if (innerRing.current) {
      innerRing.current.rotation.z = t * 0.12;
      innerRing.current.rotation.x = Math.sin(t * 0.25) * 0.12;
      innerRing.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
      innerRing.current.material.opacity += (targetOpacity - innerRing.current.material.opacity) * delta * 6;
    }
    if (outerRing.current) {
      outerRing.current.rotation.z = -t * 0.08;
      outerRing.current.rotation.y = Math.cos(t * 0.2) * 0.1;
      const s = targetScale * 1.16;
      outerRing.current.scale.lerp(new THREE.Vector3(s, s, s), delta * 4);
      outerRing.current.material.opacity += (targetOpacity * 0.7 - outerRing.current.material.opacity) * delta * 6;
    }
  });

  return (
    <group>
      <mesh ref={innerRing} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.42, 1.432, 64]} />
        <meshBasicMaterial color="#9e7eff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerRing} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <ringGeometry args={[1.65, 1.662, 64]} />
        <meshBasicMaterial color="#ffb38a" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Scene Controller ────────────────────────────────────────────────────────
function SceneContent({ isHovered, activeWorld, pulseTrigger, onProjectNodes }) {
  const groupRef = useRef();
  const { camera, gl } = useThree();

  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const rotVel = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerDown = (e) => {
      isDragging.current = true;
      previousPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - previousPointer.current.x;
      const dy = e.clientY - previousPointer.current.y;

      rotVel.current.y += dx * 0.003;
      rotVel.current.x += dy * 0.003;

      previousPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  useFrame((_, delta) => {
    const targetZ = activeWorld ? 4.15 : 5.1;
    camera.position.z += (targetZ - camera.position.z) * delta * 3.5;

    if (groupRef.current) {
      groupRef.current.rotation.y += rotVel.current.y + delta * 0.05;
      groupRef.current.rotation.x += rotVel.current.x;

      rotVel.current.x *= 0.94;
      rotVel.current.y *= 0.94;
    }

    if (onProjectNodes && groupRef.current && gl.domElement) {
      const containerWidth = gl.domElement.clientWidth || 520;
      const containerHeight = gl.domElement.clientHeight || 460;

      const nodes = [
        { id: 'forge', label: 'Forge', angle: 0 },
        { id: 'projects', label: 'Projects', angle: (Math.PI * 2) / 5 },
        { id: 'skills', label: 'Skills', angle: ((Math.PI * 2) / 5) * 2 },
        { id: 'story', label: 'Story', angle: ((Math.PI * 2) / 5) * 3 },
        { id: 'contact', label: 'Contact', angle: ((Math.PI * 2) / 5) * 4 },
      ];

      const r = 1.62;
      const projected = nodes.map((node) => {
        const a = node.angle + groupRef.current.rotation.y;
        const vec = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.35, Math.sin(a) * r * 0.8);
        vec.project(camera);
        return {
          ...node,
          x: (vec.x * 0.5 + 0.5) * containerWidth,
          y: (-vec.y * 0.5 + 0.5) * containerHeight,
          z: vec.z,
        };
      });
      onProjectNodes(projected);
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#9e7eff" />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-2.5, 2, 2.5]} intensity={8} color="#9e7eff" distance={6} />
      <pointLight position={[2.5, -1, 2]} intensity={5} color="#ffb38a" distance={5} />

      <group ref={groupRef}>
        <ObsidianCoreMesh isHovered={isHovered} activeWorld={activeWorld} pulseTrigger={pulseTrigger} />
        <HudRings isHovered={isHovered} activeWorld={activeWorld} />
      </group>
    </>
  );
}

export default function NOVAMatterSphere({
  isHovered,
  setIsHovered,
  activeWorld,
  pulseTrigger,
  onSelectNode,
}) {
  const [hudNodes, setHudNodes] = useState([]);

  return (
    <div
      className="nova-sphere-container"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      role="region"
      aria-label="NOVA interactive sphere container"
    >
      {/* Three.js Canvas - Transparent Background */}
      <Canvas
        camera={{ position: [0, 0, 5.1], fov: 42 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      >
        <SceneContent
          isHovered={isHovered}
          activeWorld={activeWorld}
          pulseTrigger={pulseTrigger}
          onProjectNodes={setHudNodes}
        />
      </Canvas>

      {/* Interactive HUD Nodes - HIDDEN at idle, visible only on hover/focus */}
      <div className="nova-hud-overlay">
        {hudNodes.map((node) => (
          <button
            key={node.id}
            className={`nova-hud-node ${activeWorld === node.id ? 'is-active' : ''}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              opacity: (isHovered || activeWorld === node.id) ? (node.z > 0.95 ? 0.2 : 0.95) : 0.0,
              pointerEvents: (isHovered || activeWorld === node.id) && node.z <= 0.95 ? 'auto' : 'none',
            }}
            onClick={() => onSelectNode(node.id)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            aria-label={`Open ${node.label} panel`}
          >
            <span className="hud-node-dot" />
            <span className="hud-node-label">{node.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
