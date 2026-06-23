import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useParticleSystem } from './useParticleSystem';
import { OrbitalNodes } from './OrbitalNodes';
import { CORE_NODES, PARTICLE_CONFIG } from './constants';

// ── Glow halo canvas texture ─────────────────────────────────────────────────
function makeHaloTexture(size = 64) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.25,'rgba(255,255,255,0.9)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.2)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export default function NovaCore({
  duplexState = 'idle',
  onClickNode,
  activeSubNodes = [],
  highlightedNode = null,
  setHighlightedNode,
}) {
  const mountRef    = useRef(null);
  const stateRef    = useRef('idle');
  const wordPulse   = useRef(0);
  const navPulse    = useRef(0);
  const hoveredRef  = useRef(null);
  const [nodesData, setNodesData] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  const { initParticles, updateParticles, connectPathways } = useParticleSystem();

  useEffect(() => { stateRef.current = duplexState; }, [duplexState]);

  useEffect(() => {
    const h = () => { wordPulse.current = 1.0; };
    window.addEventListener('nova-word', h);
    return () => window.removeEventListener('nova-word', h);
  }, []);

  useEffect(() => {
    const h = () => { navPulse.current = 1.0; };
    window.addEventListener('nova-nav', h);
    return () => window.removeEventListener('nova-nav', h);
  }, []);

  // Track hovered node without re-triggering the Three.js effect
  useEffect(() => { hoveredRef.current = hoveredNode; }, [hoveredNode]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.offsetWidth, H = el.offsetHeight;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    // ── Lights ──────────────────────────────────────────────────────────────
    // Warm lavender + cool jade accent
    const lA = new THREE.PointLight(0xC4B5FD, 6, 14); lA.position.set(-2, 1.5, 2); scene.add(lA);
    const lB = new THREE.PointLight(0x80CBC4, 4, 14); lB.position.set(2, -1.5, 2); scene.add(lB);
    scene.add(new THREE.AmbientLight(0xffffff, 0.03));

    // ── Adaptive particle count ──────────────────────────────────────────────
    const isLow = devicePixelRatio < 1.5 || window.innerWidth < 768;
    const cfg   = isLow ? PARTICLE_CONFIG.mobile : PARTICLE_CONFIG.desktop;
    const count = cfg.count;

    // ── Shared texture ──────────────────────────────────────────────────────
    const haloTex = makeHaloTexture(64);

    // ── Particle geometry ───────────────────────────────────────────────────
    const { positions, colors } = initParticles(count);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.075, map: haloTex,
      vertexColors: true, transparent: true, opacity: 0.88,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── Volumetric nucleus glow (instanced spheres at core) ─────────────────
    // We layer 3 semi-transparent glow spheres for a depth-of-field feel
    const addGlowSphere = (radius, color, opacity) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.FrontSide, depthWrite: false })
      );
      scene.add(mesh);
      return mesh;
    };
    const glowCore  = addGlowSphere(0.22, 0xF4F0FF, 0.26);
    const glowMid   = addGlowSphere(0.46, 0xC4B5FD, 0.10);
    const glowOuter = addGlowSphere(0.75, 0x7C6FA0, 0.04);

    // ── Connection line geometry ─────────────────────────────────────────────
    const linePos = new Float32Array(cfg.maxConnections * 2 * 3);
    const lineCol = new Float32Array(cfg.maxConnections * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ── Mouse ────────────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    // ── State interpolation targets ──────────────────────────────────────────
    let radiusFactor = 1.0, speedFactor = 0.18, jitterFactor = 0.002;
    let coreGlowScale = 1.0;
    let tt = 0, rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      tt += 0.008;

      // Camera parallax
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      camera.position.x = mouse.x * 0.45;
      camera.position.y = -mouse.y * 0.45;
      camera.lookAt(0, 0, 0);

      const state      = stateRef.current;
      const isListening = state === 'listening';
      const isThinking  = state === 'thinking';
      const isSpeaking  = state === 'speaking';

      // Decay pulses
      wordPulse.current += (0 - wordPulse.current) * 0.07;
      navPulse.current  += (0 - navPulse.current)  * 0.06;

      // ── State-dependent visual targets ──────────────────────────────────
      let tRadius = 1.0, tSpeed = 0.18, tJitter = 0.002;
      let tOpacity = 0.10, tGlowScale = 1.0;
      let tLightA = 6, tLightB = 4;
      let tParticleOpacity = 0.9;

      if (isListening) {
        tRadius = 0.62; tSpeed = 0.55; tJitter = 0.055;
        tOpacity = 0.20; tGlowScale = 0.78;
        tLightA = 10; tLightB = 6; tParticleOpacity = 0.85;
      } else if (isThinking) {
        tRadius = 0.82; tSpeed = 0.10; tJitter = 0.010;
        tOpacity = 0.14; tGlowScale = 0.92;
        tLightA = 8; tLightB = 8; tParticleOpacity = 0.80;
      } else if (isSpeaking) {
        tRadius = 1.15 + wordPulse.current * 0.30;
        tSpeed  = 0.28 + wordPulse.current * 0.22;
        tJitter = 0.004; tOpacity = 0.13; tGlowScale = 1.18 + wordPulse.current * 0.2;
        tLightA = 8 + wordPulse.current * 5;
        tLightB = 6 + wordPulse.current * 4;
        tParticleOpacity = 0.92;
      }

      // Nav-pulse: brief inward compression
      if (navPulse.current > 0.01) {
        tRadius = THREE.MathUtils.lerp(tRadius, 0.35, navPulse.current * 0.7);
        tSpeed  = THREE.MathUtils.lerp(tSpeed,  1.1,  navPulse.current * 0.5);
      }

      // Lerp everything
      const lk = 0.07;
      radiusFactor  += (tRadius - radiusFactor)   * lk;
      speedFactor   += (tSpeed  - speedFactor)     * lk;
      jitterFactor  += (tJitter - jitterFactor)    * lk;
      coreGlowScale += (tGlowScale - coreGlowScale) * lk;
      lineMat.opacity  += (tOpacity - lineMat.opacity)   * lk;
      mat.opacity      += (tParticleOpacity - mat.opacity) * lk;
      lA.intensity  += (tLightA - lA.intensity) * lk;
      lB.intensity  += (tLightB - lB.intensity) * lk;

      // Breathing scalePulse
      const breathFreq = isListening ? 5.5 : isThinking ? 2.0 : isSpeaking ? 3.8 : 1.0;
      const breathAmp  = isListening ? 0.055 : isThinking ? 0.018 : isSpeaking ? 0.038 : 0.012;
      const scalePulse = 1.0 + Math.sin(tt * breathFreq) * breathAmp;

      // Slow global rotation of particle cloud
      points.rotation.y += speedFactor * 0.0025 + mouse.x * 0.0006;
      points.rotation.x  = mouse.y * 0.10 + Math.sin(tt * 0.07) * 0.035;
      lines.rotation.copy(points.rotation);

      // Nucleus glow pulse
      const gs = coreGlowScale * scalePulse;
      glowCore.scale.setScalar(gs);
      glowMid.scale.setScalar(gs * 1.0);
      glowOuter.scale.setScalar(gs * 1.0);
      glowCore.material.opacity  = 0.18 + (isSpeaking ? wordPulse.current * 0.15 : 0);
      glowMid.material.opacity   = 0.07 + (isListening ? 0.04 : 0);
      glowOuter.material.opacity = 0.03 + (isThinking ? 0.02 : 0);

      // Update particles
      const posArr = geo.attributes.position.array;
      const colArr = geo.attributes.color.array;
      updateParticles({
        count, radiusFactor, scalePulse,
        isSpeaking, isListening, isThinking,
        wordPulse: wordPulse.current, jitterFactor,
        colArr, posArr, tt, navPulse: navPulse.current,
      });
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;

      // Update connections
      const connCount = connectPathways({
        count, maxConnections: cfg.maxConnections, maxDist: cfg.maxDist,
        linePos, lineCol, colArr,
      });
      lineGeo.setDrawRange(0, connCount * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate    = true;

      // ── Project Orbital Nodes ────────────────────────────────────────────
      const pNodes = [];
      const orbitR = 1.9;
      const rotMul = hoveredRef.current ? 0.04 : 1.0;
      const aOff   = tt * 0.13 * rotMul;

      CORE_NODES.forEach((node, i) => {
        const angle = (i * 2 * Math.PI / CORE_NODES.length) + aOff;
        const nx = Math.cos(angle) * orbitR;
        const ny = Math.sin(angle) * orbitR * 0.20;
        const nz = Math.sin(angle) * orbitR * 0.95;

        const v = new THREE.Vector3(nx, ny, nz).project(camera);
        const sx = (v.x * 0.5 + 0.5) * W;
        const sy = (v.y * -0.5 + 0.5) * H;
        const scale   = THREE.MathUtils.mapLinear(nz, -orbitR, orbitR, 0.70, 1.12);
        const opacity = THREE.MathUtils.mapLinear(nz, -orbitR, orbitR, 0.40, 1.0);
        const zIndex  = Math.floor(THREE.MathUtils.mapLinear(nz, -orbitR, orbitR, 1, 10));
        pNodes.push({ label: node.label, route: node.route, sx, sy, scale, opacity, zIndex });
      });

      if (activeSubNodes && activeSubNodes.length > 0) {
        const subR = 2.15;
        activeSubNodes.forEach((subLabel, i) => {
          const angle = (i * 2 * Math.PI / activeSubNodes.length) - aOff;
          const nx = Math.cos(angle) * subR;
          const ny = Math.sin(angle) * subR * 0.26;
          const nz = Math.sin(angle) * subR * 0.90;
          const v  = new THREE.Vector3(nx, ny, nz).project(camera);
          pNodes.push({
            label: subLabel, route: '/work',
            sx:  (v.x * 0.5 + 0.5) * W,
            sy:  (v.y * -0.5 + 0.5) * H,
            scale:   THREE.MathUtils.mapLinear(nz, -subR, subR, 0.73, 1.10),
            opacity: THREE.MathUtils.mapLinear(nz, -subR, subR, 0.48, 1.0),
            zIndex:  Math.floor(THREE.MathUtils.mapLinear(nz, -subR, subR, 2, 12)),
            isSubCategory: true,
          });
        });
      }

      setNodesData(pNodes);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const W2 = el.offsetWidth, H2 = el.offsetHeight;
      renderer.setSize(W2, H2);
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose();
      haloTex.dispose(); renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [activeSubNodes]); // eslint-disable-line

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        ref={mountRef}
        style={{
          width:  'min(580px, 70vw)',
          height: 'min(580px, 70vw)',
          cursor: duplexState === 'idle' ? 'pointer' : 'crosshair',
          filter: [
            'drop-shadow(0 0 80px rgba(180,160,255,0.18))',
            'drop-shadow(0 0 160px rgba(200,180,255,0.08))',
          ].join(' '),
          userSelect: 'none', WebkitUserSelect: 'none',
        }}
      />
      <OrbitalNodes
        nodesData={nodesData}
        onHover={setHoveredNode}
        onClick={onClickNode}
        activeSubNodes={activeSubNodes}
        highlightedNode={highlightedNode}
      />
    </div>
  );
}
