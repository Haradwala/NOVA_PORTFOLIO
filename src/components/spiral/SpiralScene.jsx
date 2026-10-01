/**
 * SpiralScene.jsx
 *
 * 3D Spiral Project Navigator Scene
 *
 * Implements Phase 2 Specification:
 *   - Continuous 3-Turn Helix (radius 2.2, pitch 1.4, turns 3, panelsPerTurn 8)
 *   - 24 panels traveling individually along the helix (DO NOT rotate a rigid group)
 *   - Authentic project representation using the 8 real projects repeating every 8 panels
 *   - Active project detection near middle turn (y ≈ 0, θ ≈ 3π) with scale 1.06 and lift 0.10
 *   - Continuous wrapping across boundaries with smooth fade (no popping, no teleportation)
 *   - Clean, neutral studio lighting & #050505 background
 *   - Three-quarter perspective camera (FOV 44)
 *   - Drag, touch swipe, wheel handling (touch-action: pan-y), ArrowLeft / ArrowRight
 *   - Raycast click navigation to /work/:project
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SPIRAL_CONFIG, getHelixGeometry } from './spiralConfig';
import { createSpiralPanelMesh } from './SpiralPanel';
import { PROJECTS_DATA } from '../../data/projectsData';

// Wrap helper: wraps value continuously into [0, max)
function wrapAngle(val, max) {
  const res = val % max;
  return res < 0 ? res + max : res;
}

export default function SpiralScene({
  activeProjectSlug,
  onActiveProjectChange,
  onSelectProject,
}) {
  const mountRef = useRef(null);
  const [webGLOk, setWebGLOk] = useState(true);

  // Authoritative continuous progress in radians
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startMouseXRef = useRef(0);
  const lastMouseXRef = useRef(0);
  const lastActiveSlugRef = useRef('');

  // Responsive panel count
  const getPanelCount = (width) => {
    if (width < 640) return SPIRAL_CONFIG.mobilePanelCount; // 12
    if (width < 1024) return SPIRAL_CONFIG.tabletPanelCount; // 18
    return SPIRAL_CONFIG.desktopPanelCount; // 24
  };

  // Sync when activeProjectSlug is passed externally
  useEffect(() => {
    if (!activeProjectSlug) return;
    const projIdx = PROJECTS_DATA.findIndex((p) => p.slug === activeProjectSlug);
    if (projIdx < 0) return;

    // The middle turn starts at panel 8.
    // Panel (8 + projIdx) has baseTheta = (8 + projIdx) * deltaTheta.
    // To align it with activeTheta (3π = 12 * deltaTheta):
    // (8 + projIdx) * deltaTheta + targetProgress = 12 * deltaTheta
    // => targetProgress = (4 - projIdx) * deltaTheta
    const deltaTheta = SPIRAL_CONFIG.pitch ? Math.PI / 4 : SPIRAL_CONFIG.deltaTheta;
    const targetProgress = (4 - projIdx) * deltaTheta;
    targetProgressRef.current = targetProgress;
  }, [activeProjectSlug]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer, scene, camera, rafId;
    let panelDataList = [];
    let isMounted = true;

    // Reusable math objects to eliminate per-frame allocations (Section 22)
    const cameraPos = new THREE.Vector3();
    const tempPanelPos = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    try {
      const W = container.clientWidth || 960;
      const H = container.clientHeight || 560;
      const panelCount = getPanelCount(W);
      const helix = getHelixGeometry(panelCount);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(SPIRAL_CONFIG.background);

      // Camera: three-quarter angle viewing the active locus near θ = 3π, y = 0
      const camAzimuth = SPIRAL_CONFIG.activeTheta + SPIRAL_CONFIG.camera.azimuthOffset;
      const camDist = SPIRAL_CONFIG.camera.distance;
      const camElev = SPIRAL_CONFIG.camera.elevation;

      camera = new THREE.PerspectiveCamera(SPIRAL_CONFIG.camera.fov, W / H, 0.1, 50);
      camera.position.set(
        camDist * Math.cos(camAzimuth),
        camElev,
        camDist * Math.sin(camAzimuth)
      );
      camera.lookAt(-0.35, 0, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Neutral studio lighting (Section 16: soft key, weak fill, neutral ambient)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      // Soft key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
      keyLight.position.set(
        camDist * Math.cos(camAzimuth + 0.4),
        5.2,
        camDist * Math.sin(camAzimuth + 0.4)
      );
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
      scene.add(keyLight);

      // Weak fill light
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
      fillLight.position.set(
        -camDist * Math.cos(camAzimuth),
        -1.2,
        -camDist * Math.sin(camAzimuth)
      );
      scene.add(fillLight);

      // Instantiate panels along the helix
      // Project sequence repeats every 8 panels across the 3 turns
      for (let i = 0; i < helix.panelCount; i++) {
        const project = PROJECTS_DATA[i % PROJECTS_DATA.length];
        const panelData = createSpiralPanelMesh(i, helix.panelCount, helix, project);
        scene.add(panelData.mesh);
        panelDataList.push(panelData);
      }

      // Drag / Swipe Interaction handlers
      const onPointerDown = (e) => {
        isDraggingRef.current = true;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        startMouseXRef.current = clientX;
        lastMouseXRef.current = clientX;
        container.style.cursor = 'grabbing';
      };

      const onPointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const deltaX = clientX - lastMouseXRef.current;
        lastMouseXRef.current = clientX;

        // Progress sensitivity: smooth drag through projects
        const rotDelta = (deltaX / W) * (Math.PI * 1.8);
        targetProgressRef.current += rotDelta;
      };

      const onPointerUp = (e) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        container.style.cursor = 'grab';

        // Soft magnetic snap to nearest project step (Section 13)
        const deltaTheta = helix.deltaTheta;
        const nearest = Math.round(targetProgressRef.current / deltaTheta) * deltaTheta;
        targetProgressRef.current = nearest;
      };

      // Native wheel handling: consumes horizontal navigation, allows vertical page scroll
      let wheelSnapTimeout = null;
      const onWheel = (e) => {
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const isShift = e.shiftKey;

        // Consume event when scrolling horizontally over the slider
        if (isHorizontal || isShift) {
          e.preventDefault();
          const delta = (isHorizontal ? e.deltaX : e.deltaY) * 0.0028;
          targetProgressRef.current -= delta;

          clearTimeout(wheelSnapTimeout);
          wheelSnapTimeout = setTimeout(() => {
            const nearest = Math.round(targetProgressRef.current / helix.deltaTheta) * helix.deltaTheta;
            targetProgressRef.current = nearest;
          }, 120);
        }
      };

      // Raycast click for project selection (Section 10)
      const onClick = (e) => {
        // Ignore clicks that were part of a meaningful drag
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
        if (Math.abs(clientX - startMouseXRef.current) > 8) return;

        const rect = container.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);
        const frontMeshes = panelDataList.map((p) => p.frontMesh);
        const intersects = raycaster.intersectObjects(frontMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const matched = panelDataList.find((p) => p.frontMesh === hit);
          if (matched && matched.project) {
            // If already the active project, or clicked directly, navigate to /work/:slug
            if (matched.project.slug === lastActiveSlugRef.current) {
              if (onSelectProject) {
                onSelectProject(matched.project);
              }
            } else {
              // Smoothly step this panel to the active locus
              const baseTheta = matched.index * helix.deltaTheta;
              const targetProg = SPIRAL_CONFIG.activeTheta - baseTheta;
              const nearest = Math.round(targetProg / helix.deltaTheta) * helix.deltaTheta;
              targetProgressRef.current = nearest;
              if (onSelectProject) {
                onSelectProject(matched.project);
              }
            }
          }
        }
      };

      // Keyboard navigation (ArrowLeft / ArrowRight)
      const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
          // Advance to next project
          targetProgressRef.current -= helix.deltaTheta;
        } else if (e.key === 'ArrowLeft') {
          // Go to previous project
          targetProgressRef.current += helix.deltaTheta;
        }
      };

      container.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      container.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      container.addEventListener('wheel', onWheel, { passive: false });
      container.addEventListener('click', onClick);
      window.addEventListener('keydown', onKeyDown);

      const onResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth || 960;
        const newH = container.clientHeight || 560;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', onResize);

      // Render Loop: Panels travel individually along the helix (Section 4)
      const animate = () => {
        if (!isMounted) return;
        rafId = requestAnimationFrame(animate);

        // Smooth damping towards target progress (Section 12)
        progressRef.current += (targetProgressRef.current - progressRef.current) * 0.10;
        const progress = progressRef.current;

        camera.getWorldPosition(cameraPos);

        const { radius, pitch, turns, totalAngle, deltaTheta } = helix;
        const fadeZone = 0.75 * deltaTheta;

        // Middle turn active locus is at θ = 3π where y = 0
        const activeTheta = SPIRAL_CONFIG.activeTheta; // 3π
        let closestPanel = null;
        let minDeltaThetaToActive = Infinity;

        // Array for dynamic distance-to-camera sorting
        const panelSortList = [];

        // Update each panel's individual position and orientation along the helix
        panelDataList.forEach((panel) => {
          const baseTheta = panel.index * deltaTheta;
          // Continuous wrapping: wrap(baseTheta + progress, totalAngle)
          const theta = wrapAngle(baseTheta + progress, totalAngle);

          // Position formula from Section 4:
          // x = radius * Math.cos(theta)
          // z = radius * Math.sin(theta)
          // y = pitch * theta / (2 * Math.PI) - (turns * pitch) / 2
          const baseX = radius * Math.cos(theta);
          const baseZ = radius * Math.sin(theta);
          const baseY = (pitch * theta) / (2 * Math.PI) - (turns * pitch) / 2;

          // Panel outward normal vector
          const normalX = Math.cos(theta);
          const normalZ = Math.sin(theta);

          // Facing angle: orient panel outward along cylinder normal
          panel.mesh.rotation.y = Math.PI / 2 - theta;

          // Check distance to active locus (middle turn, θ ≈ 3π, y ≈ 0)
          const deltaFromActive = Math.abs(theta - activeTheta);
          if (deltaFromActive < minDeltaThetaToActive) {
            minDeltaThetaToActive = deltaFromActive;
            closestPanel = panel;
          }

          // Boundary fade zone at helix ends: smooth fade, zero popping (Section 14)
          let edgeFade = 1.0;
          if (theta < fadeZone) {
            edgeFade = theta / fadeZone;
          } else if (theta > totalAngle - fadeZone) {
            edgeFade = (totalAngle - theta) / fadeZone;
          }
          edgeFade = Math.max(0, Math.min(1, edgeFade));

          // Base opacity and color
          panel.material.opacity = 0.95 * edgeFade;

          // Default position (before active lift)
          panel.targetPos = new THREE.Vector3(baseX, baseY, baseZ);
          panel.normalVec = new THREE.Vector3(normalX, 0, normalZ);
          panel.fade = edgeFade;

          // Add to sort list for renderOrder
          tempPanelPos.set(baseX, baseY, baseZ);
          const distToCam = tempPanelPos.distanceTo(cameraPos);
          panelSortList.push({ panel, distToCam });
        });

        // Dynamic renderOrder: furthest to nearest ensures artifact-free transparency
        panelSortList.sort((a, b) => b.distToCam - a.distToCam);
        panelSortList.forEach((item, rank) => {
          item.panel.mesh.renderOrder = rank;
          item.panel.frontMesh.renderOrder = rank;
        });

        // Apply active panel lift (≈ 0.10) and scale (≈ 1.06) (Section 9)
        panelDataList.forEach((panel) => {
          const isActive = panel === closestPanel;
          const targetScale = isActive ? SPIRAL_CONFIG.activeScale : 1.0;
          const liftAmount = isActive ? SPIRAL_CONFIG.activeLift : 0.0;

          const posX = panel.targetPos.x + panel.normalVec.x * liftAmount;
          const posY = panel.targetPos.y;
          const posZ = panel.targetPos.z + panel.normalVec.z * liftAmount;

          // Smooth lerp for physical movement and scale
          panel.mesh.position.set(posX, posY, posZ);
          panel.mesh.scale.set(targetScale, targetScale, targetScale);
        });

        // Report active project to parent when changed
        if (closestPanel && closestPanel.project) {
          const currentSlug = closestPanel.project.slug;
          if (currentSlug !== lastActiveSlugRef.current) {
            lastActiveSlugRef.current = currentSlug;
            if (onActiveProjectChange) {
              onActiveProjectChange(closestPanel.project);
            }
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isMounted = false;
        cancelAnimationFrame(rafId);
        clearTimeout(wheelSnapTimeout);
        window.removeEventListener('resize', onResize);
        container.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        container.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKeyDown);

        if (renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('SpiralScene WebGL initialization error:', err);
      setWebGLOk(false);
    }
  }, [onActiveProjectChange, onSelectProject]);

  if (!webGLOk) {
    return null; // Will trigger accessible non-3D fallback in parent
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: 'clamp(480px, 62vh, 600px)',
        position: 'relative',
        background: SPIRAL_CONFIG.background,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'pan-y', // allows normal vertical page scrolling
      }}
    />
  );
}
