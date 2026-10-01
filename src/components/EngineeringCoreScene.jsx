/**
 * EngineeringCoreScene.jsx
 *
 * Spatial 3D / Interactive representation of the Engineering Core.
 * Visualizes the 4 primary systems as interconnected architectural nodes:
 *   - NOVA (AI Core)
 *   - FINANCE MANAGER (Financial Ledger Engine)
 *   - TRADING INTELLIGENCE (Quantitative Pipeline)
 *   - FORGE IDE (Engineering Platform)
 *
 * Includes WebGL / Three.js canvas with graceful SVG fallback for reduced motion & mobile.
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ENGINEERING_SYSTEMS } from '../data/engineeringCore';

const NODE_POSITIONS = {
  'nova-ai':              { x: 0,    y: 1.6,  z: 0,    color: '#A78BFA', label: 'NOVA AI' },
  'finance-manager':      { x: -2.2, y: -0.6, z: 0.2,  color: '#38BDF8', label: 'FINANCE MANAGER' },
  'trading-intelligence': { x: 2.2,  y: -0.6, z: 0.2,  color: '#F59E0B', label: 'TRADING SYSTEM' },
  'forge-ide':            { x: 0,    y: -1.8, z: -0.4, color: '#2DD4BF', label: 'FORGE IDE' },
};

const CONNECTIONS = [
  ['nova-ai', 'finance-manager'],
  ['nova-ai', 'trading-intelligence'],
  ['nova-ai', 'forge-ide'],
  ['finance-manager', 'trading-intelligence'],
  ['finance-manager', 'forge-ide'],
  ['trading-intelligence', 'forge-ide'],
];

function FallbackLattice({ activeSystem, onSelectSystem }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 900,
      margin: '0 auto',
      position: 'relative',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <svg
        viewBox="-250 -180 500 360"
        style={{ width: '100%', maxHeight: 420, overflow: 'visible' }}
        role="img"
        aria-label="Engineering Core System Lattice"
      >
        <defs>
          <linearGradient id="grad-nova-fm" x1="0" y1="-140" x2="-180" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="grad-nova-ti" x1="0" y1="-140" x2="180" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="grad-fm-ti" x1="-180" y1="40" x2="180" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="grad-fm-forge" x1="-180" y1="40" x2="0" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="grad-ti-forge" x1="180" y1="40" x2="0" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="grad-nova-forge" x1="0" y1="-140" x2="0" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* System boundary rings */}
        <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 8" />
        <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(167,139,250,0.06)" />

        {/* Lines */}
        <line x1="0" y1="-130" x2="-170" y2="35" stroke="url(#grad-nova-fm)" strokeWidth="1.5" />
        <line x1="0" y1="-130" x2="170" y2="35" stroke="url(#grad-nova-ti)" strokeWidth="1.5" />
        <line x1="-170" y1="35" x2="170" y2="35" stroke="url(#grad-fm-ti)" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="-170" y1="35" x2="0" y2="120" stroke="url(#grad-fm-forge)" strokeWidth="1.2" />
        <line x1="170" y1="35" x2="0" y2="120" stroke="url(#grad-ti-forge)" strokeWidth="1.2" />
        <line x1="0" y1="-130" x2="0" y2="120" stroke="url(#grad-nova-forge)" strokeWidth="1" strokeDasharray="3 5" />

        {/* System Nodes */}
        {[
          { id: 'nova-ai', cx: 0, cy: -130, color: '#A78BFA', name: 'NOVA AI', desc: 'AI ENGINE · ACTIVE' },
          { id: 'finance-manager', cx: -170, cy: 35, color: '#38BDF8', name: 'FINANCE MANAGER', desc: 'LEDGER ENGINE · DEV' },
          { id: 'trading-intelligence', cx: 170, cy: 35, color: '#F59E0B', name: 'TRADING SYSTEM', desc: 'QUANT SIMULATION' },
          { id: 'forge-ide', cx: 0, cy: 120, color: '#2DD4BF', name: 'FORGE IDE', desc: 'ENGINEERING OS · ARCH' },
        ].map((node) => {
          const isSelected = activeSystem === node.id;
          return (
            <g
              key={node.id}
              onClick={() => onSelectSystem(node.id)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${node.name}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectSystem(node.id); }}
            >
              {/* Outer pulsing halo */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isSelected ? 32 : 24}
                fill={node.color}
                fillOpacity={isSelected ? 0.22 : 0.08}
                stroke={node.color}
                strokeOpacity={isSelected ? 0.9 : 0.4}
                strokeWidth={isSelected ? 2 : 1}
              />
              {/* Center point */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={6}
                fill={node.color}
              />
              {/* Label */}
              <text
                x={node.cx}
                y={node.cy > 0 ? node.cy + 30 : node.cy - 22}
                textAnchor="middle"
                fill="#EEEEF5"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.08em"
              >
                {node.name}
              </text>
              <text
                x={node.cx}
                y={node.cy > 0 ? node.cy + 42 : node.cy - 10}
                textAnchor="middle"
                fill="rgba(160,160,192,0.65)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="8"
                letterSpacing="0.12em"
              >
                {node.desc}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function EngineeringCoreScene({ activeSystem, onSelectSystem }) {
  const mountRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Parallax mouse tracking
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setUseFallback(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let renderer, scene, camera, rafId;
    let nodeMeshes = [];
    let lineSegments;
    let particlePoints;

    try {
      const W = container.clientWidth || 800;
      const H = container.clientHeight || 450;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0, 0);

      container.appendChild(renderer.domElement);

      // Ambient & directional lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const light = new THREE.PointLight(0xa78bfa, 3, 15);
      light.position.set(0, 2, 4);
      scene.add(light);

      // Create Nodes
      Object.entries(NODE_POSITIONS).forEach(([id, data]) => {
        const group = new THREE.Group();
        group.position.set(data.x, data.y, data.z);
        group.userData = { id, name: data.label };

        // Core sphere
        const color = new THREE.Color(data.color);
        const geo = new THREE.SphereGeometry(0.18, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.2,
          metalness: 0.8,
          emissive: color,
          emissiveIntensity: 0.4,
        });
        const sphere = new THREE.Mesh(geo, mat);
        group.add(sphere);

        // Outer wireframe ring
        const ringGeo = new THREE.RingGeometry(0.26, 0.29, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        // Glow billboard
        const haloGeo = new THREE.PlaneGeometry(1.2, 1.2);
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0, data.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const haloTexture = new THREE.CanvasTexture(canvas);
        const haloMat = new THREE.MeshBasicMaterial({
          map: haloTexture,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        group.add(halo);

        scene.add(group);
        nodeMeshes.push({ id, group, ring, sphere, halo, baseScale: 1 });
      });

      // Connections between nodes
      const linePositions = [];
      const lineColors = [];
      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = NODE_POSITIONS[fromId];
        const to = NODE_POSITIONS[toId];
        linePositions.push(from.x, from.y, from.z);
        linePositions.push(to.x, to.y, to.z);

        const c1 = new THREE.Color(from.color);
        const c2 = new THREE.Color(to.color);
        lineColors.push(c1.r, c1.g, c1.b);
        lineColors.push(c2.r, c2.g, c2.b);
      });

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      lineSegments = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lineSegments);

      // Flowing data packets (small particles travelling along connections)
      const packetCount = 40;
      const packetGeo = new THREE.BufferGeometry();
      const packetPositions = new Float32Array(packetCount * 3);
      const packetData = [];

      for (let i = 0; i < packetCount; i++) {
        const conn = CONNECTIONS[i % CONNECTIONS.length];
        packetData.push({
          from: NODE_POSITIONS[conn[0]],
          to: NODE_POSITIONS[conn[1]],
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.006,
        });
      }

      packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
      const packetMat = new THREE.PointsMaterial({
        color: 0xEEEEF5,
        size: 0.07,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      particlePoints = new THREE.Points(packetGeo, packetMat);
      scene.add(particlePoints);

      // Raycaster for hover/click interaction
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();

      const handlePointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseVec.set(mouse.current.x, mouse.current.y);

        raycaster.setFromCamera(mouseVec, camera);
        const hit = raycaster.intersectObjects(nodeMeshes.map(n => n.sphere));
        if (hit.length > 0) {
          const matched = nodeMeshes.find(n => n.sphere === hit[0].object);
          if (matched) {
            setHoveredNode(matched.id);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredNode(null);
        container.style.cursor = 'default';
      };

      const handlePointerClick = (e) => {
        const rect = container.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVec, camera);
        const hit = raycaster.intersectObjects(nodeMeshes.map(n => n.sphere));
        if (hit.length > 0) {
          const matched = nodeMeshes.find(n => n.sphere === hit[0].object);
          if (matched && onSelectSystem) {
            onSelectSystem(matched.id);
          }
        }
      };

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth || 800;
        const newH = container.clientHeight || 450;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('click', handlePointerClick);
      window.addEventListener('resize', handleResize);

      // Render loop
      let clock = new THREE.Clock();
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Subtle camera parallax
        camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.04;
        camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        // Animate node rings & highlights
        nodeMeshes.forEach(n => {
          n.ring.rotation.z += 0.01;
          const isAct = n.id === activeSystem;
          const isHov = n.id === hoveredNode;
          const targetScale = isAct ? 1.35 : (isHov ? 1.2 : 1.0);
          n.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
          n.halo.material.opacity = isAct ? 0.75 : (isHov ? 0.6 : 0.35);
        });

        // Update data packets
        const posAttr = particlePoints.geometry.attributes.position;
        packetData.forEach((p, idx) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;
          const px = p.from.x + (p.to.x - p.from.x) * p.progress;
          const py = p.from.y + (p.to.y - p.from.y) * p.progress;
          const pz = p.from.z + (p.to.z - p.from.z) * p.progress;
          posAttr.setXYZ(idx, px, py, pz);
        });
        posAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('click', handlePointerClick);
        if (renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL scene init failed, switching to SVG lattice fallback', err);
      setUseFallback(true);
    }
  }, [activeSystem, hoveredNode, onSelectSystem]);

  if (useFallback) {
    return <FallbackLattice activeSystem={activeSystem} onSelectSystem={onSelectSystem} />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: 'clamp(360px, 48vh, 500px)',
          position: 'relative',
          borderRadius: 16,
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      />

      {/* HTML overlay labels on top of WebGL canvas for accessibility & direct click */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem',
          padding: '0 0.5rem',
        }}
      >
        {ENGINEERING_SYSTEMS.map((sys) => {
          const isSelected = activeSystem === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => onSelectSystem(sys.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(15,15,25,0.6)',
                border: `1px solid ${isSelected ? sys.statusColor : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 20px ${sys.statusColor}25` : 'none',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: sys.statusColor,
                  boxShadow: `0 0 8px ${sys.statusColor}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: '#EEEEF5',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {sys.title}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.58rem',
                    color: 'rgba(160,160,192,0.7)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {sys.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
