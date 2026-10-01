/**
 * SpiralScene.jsx
 *
 * Final Merged Geometry + Interaction Specification
 *
 * Features:
 *   - Parametric 3D Helix: Δθ = π/4 (8 panels/turn), turns = panelCount / 8
 *   - Camera placed at azimuth around θ = 3π offset by ~30° horizontally (looking at origin)
 *   - Active panel defined as the one nearest θ = 3π (where y = 0)
 *   - Responsive panel count (24 desktop / 18 tablet / 12 mobile) preserving exact panel aspect ratio
 *   - Dynamic per-frame renderOrder sorting based on distance to camera (artifact-free transparency)
 *   - Intentional wheel handling (horizontal trackpad swipe / Shift+wheel without trapping page scroll)
 *   - Calibrated boundary fade zone (< 1 Δθ)
 *   - No autoplay
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { SPIRAL_CONFIG } from './spiralConfig';
import { createSpiralPanelMesh } from './SpiralPanel';

export default function SpiralScene({
  activePanelIndex,
  onActivePanelChange,
  onSelectDestination,
}) {
  const mountRef = useRef(null);
  const [webGLOk, setWebGLOk] = useState(true);

  // Authoritative rotation angle (radians)
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  // Responsive panel count determination
  const getPanelCountForWidth = (width) => {
    if (width < 640) return SPIRAL_CONFIG.mobilePanelCount; // 12
    if (width < 1024) return SPIRAL_CONFIG.tabletPanelCount; // 18
    return SPIRAL_CONFIG.desktopPanelCount; // 24
  };

  // Sync angle when external activePanelIndex changes
  useEffect(() => {
    if (activePanelIndex === undefined || activePanelIndex === null) return;
    const deltaTheta = SPIRAL_CONFIG.deltaTheta;
    // Align target panel index with activeTheta (3π)
    const targetAngle = (activePanelIndex + 0.5) * deltaTheta - SPIRAL_CONFIG.activeTheta;
    targetAngleRef.current = targetAngle;
  }, [activePanelIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer, scene, camera, rafId;
    let rootGroup;
    let panelDataList = [];

    // Reusable math objects to prevent per-frame allocation
    const tempVec = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();
    const cameraPos = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    try {
      const W = container.clientWidth || 900;
      const H = container.clientHeight || 520;
      const panelCount = getPanelCountForWidth(W);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);

      // Camera: placed at azimuth around θ = 3π, offset about 30° horizontally (-π/6)
      // Azimuth angle = 3π - π/6 = 17π/6 (equivalent to 5π/6 = 150°)
      const camAzimuth = SPIRAL_CONFIG.activeTheta + SPIRAL_CONFIG.camera.azimuthOffset;
      const camDist = SPIRAL_CONFIG.camera.distance;
      const camElev = SPIRAL_CONFIG.camera.elevation;

      camera = new THREE.PerspectiveCamera(SPIRAL_CONFIG.camera.fov, W / H, 0.1, 50);
      camera.position.set(
        camDist * Math.cos(camAzimuth),
        camElev,
        camDist * Math.sin(camAzimuth)
      );
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Neutral studio lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      scene.add(ambientLight);

      // Soft key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      keyLight.position.set(
        camDist * Math.cos(camAzimuth + 0.5),
        5.5,
        camDist * Math.sin(camAzimuth + 0.5)
      );
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
      scene.add(keyLight);

      // Soft fill light
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
      fillLight.position.set(
        -camDist * Math.cos(camAzimuth),
        -1.0,
        -camDist * Math.sin(camAzimuth)
      );
      scene.add(fillLight);

      // Helix assembly group
      rootGroup = new THREE.Group();
      rootGroup.name = 'spiral-assembly';
      scene.add(rootGroup);

      // Populate panels
      for (let i = 0; i < panelCount; i++) {
        const panelData = createSpiralPanelMesh(i, panelCount);
        rootGroup.add(panelData.mesh);
        panelDataList.push(panelData);
      }

      // Drag interactions
      const onPointerDown = (e) => {
        isDraggingRef.current = true;
        lastMouseXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      };

      const onPointerMove = (e) => {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        if (!isDraggingRef.current) return;
        const deltaX = clientX - lastMouseXRef.current;
        lastMouseXRef.current = clientX;

        // Progress sensitivity
        const rotDelta = (deltaX / W) * 2.5;
        targetAngleRef.current -= rotDelta;
      };

      const onPointerUp = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        // Soft magnetic snap to nearest panel step
        const deltaTheta = SPIRAL_CONFIG.deltaTheta;
        const currentAngle = targetAngleRef.current;

        // Snap to nearest discrete panel step
        const rawStep = Math.round(currentAngle / deltaTheta);
        const clampedStep = THREE.MathUtils.clamp(rawStep, -4, panelCount - 1);
        targetAngleRef.current = clampedStep * deltaTheta;

        // Find panel closest to θ = 3π
        const effectiveIndex = ((clampedStep % panelCount) + panelCount) % panelCount;
        if (onActivePanelChange) {
          onActivePanelChange(effectiveIndex);
        }
      };

      // Intentional wheel handling: captures horizontal swipes or Shift+wheel
      const onWheel = (e) => {
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const isShiftHeld = e.shiftKey;

        // Only consume event if user is intentionally scrolling horizontally
        if (isHorizontal || isShiftHeld) {
          e.preventDefault();
          const delta = (isHorizontal ? e.deltaX : e.deltaY) * 0.003;
          targetAngleRef.current += delta;
        }
      };

      const onClick = (e) => {
        const rect = container.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);
        const frontMeshes = panelDataList.map((p) => p.frontMesh);
        const intersects = raycaster.intersectObjects(frontMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const matched = panelDataList.find((p) => p.frontMesh === hit);
          if (matched) {
            targetAngleRef.current = matched.baseAngle - SPIRAL_CONFIG.activeTheta;
            if (onActivePanelChange) {
              onActivePanelChange(matched.index);
            }
            if (matched.destination && onSelectDestination) {
              onSelectDestination(matched.destination);
            }
          }
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

      const onResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth || 900;
        const newH = container.clientHeight || 520;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', onResize);

      // Render Loop
      let lastReportedIdx = -1;

      const animate = () => {
        rafId = requestAnimationFrame(animate);

        // Smooth spring damping towards target angle
        angleRef.current += (targetAngleRef.current - angleRef.current) * 0.09;

        // Continuous screw motion:
        // One progress value controls rotation + vertical translation
        const currentAngle = angleRef.current;
        rootGroup.rotation.y = -currentAngle;
        rootGroup.position.y = (SPIRAL_CONFIG.pitch * currentAngle) / (2 * Math.PI);

        camera.getWorldPosition(cameraPos);

        // Active locus in world space: where the active panel sits at θ = 3π, y = 0
        const activeLocus = new THREE.Vector3(
          SPIRAL_CONFIG.radius * Math.cos(SPIRAL_CONFIG.activeTheta),
          0,
          SPIRAL_CONFIG.radius * Math.sin(SPIRAL_CONFIG.activeTheta)
        );

        let closestPanel = panelDataList[0];
        let minLocusDistance = Infinity;

        // Calculate distance to camera for dynamic renderOrder sorting
        const panelSortList = [];

        panelDataList.forEach((p) => {
          p.mesh.getWorldPosition(tempVec);
          p.mesh.getWorldDirection(tempNormal);

          const distToLocus = tempVec.distanceTo(activeLocus);
          const distToCam = tempVec.distanceTo(cameraPos);

          panelSortList.push({ panel: p, distToCam });

          if (distToLocus < minLocusDistance) {
            minLocusDistance = distToLocus;
            closestPanel = p;
          }

          // Dot product between panel normal and direction to camera
          const dirToCam = cameraPos.clone().sub(tempVec).normalize();
          const dot = tempNormal.dot(dirToCam);

          // Smooth interpolation between front-facing and far-side
          const facing = THREE.MathUtils.smoothstep(dot, -0.3, 0.45);

          p.material.opacity = THREE.MathUtils.lerp(0.35, 0.95, facing);
          p.material.roughness = THREE.MathUtils.lerp(0.55, SPIRAL_CONFIG.material.roughness, facing);
          p.material.transmission = THREE.MathUtils.lerp(0.65, SPIRAL_CONFIG.material.transmission, facing);

          // Calibrated boundary fade zone: starts 0.5 * deltaTheta outside ends, fades over 0.7 * deltaTheta
          const totalAngleSpan = panelCount * SPIRAL_CONFIG.deltaTheta;
          const currentPanelTheta = (p.baseAngle - currentAngle) % totalAngleSpan;
          const distFromStart = Math.abs(currentPanelTheta);
          const distFromEnd = Math.abs(totalAngleSpan - currentPanelTheta);
          const boundaryDist = Math.min(distFromStart, distFromEnd);
          const boundaryFade = THREE.MathUtils.clamp(boundaryDist / (0.7 * SPIRAL_CONFIG.deltaTheta), 0.25, 1.0);

          const baseL = p.baseLightness;
          const finalBrightness = baseL * THREE.MathUtils.lerp(0.6, 1.0, facing) * boundaryFade;
          p.material.color.setRGB(finalBrightness, finalBrightness, finalBrightness);

          if (p.decalMat) {
            p.decalMat.opacity = THREE.MathUtils.lerp(0.1, 0.95, facing) * boundaryFade;
          }

          // Reset non-active panels
          if (p !== closestPanel) {
            p.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            p.mesh.position.lerp(p.basePos, 0.1);
          }
        });

        // Dynamic renderOrder: sort furthest to nearest so translucent acrylic blends cleanly
        panelSortList.sort((a, b) => b.distToCam - a.distToCam);
        panelSortList.forEach((item, rank) => {
          item.panel.mesh.renderOrder = rank;
          item.panel.frontMesh.renderOrder = rank;
        });

        // Active panel lift and scale
        if (closestPanel) {
          const liftedPos = new THREE.Vector3(
            closestPanel.basePos.x + closestPanel.normal.x * SPIRAL_CONFIG.activeLift,
            closestPanel.basePos.y,
            closestPanel.basePos.z + closestPanel.normal.z * SPIRAL_CONFIG.activeLift
          );

          closestPanel.mesh.position.lerp(liftedPos, 0.12);
          closestPanel.mesh.scale.lerp(
            new THREE.Vector3(SPIRAL_CONFIG.activeScale, SPIRAL_CONFIG.activeScale, SPIRAL_CONFIG.activeScale),
            0.12
          );

          if (closestPanel.index !== lastReportedIdx) {
            lastReportedIdx = closestPanel.index;
            if (onActivePanelChange) {
              onActivePanelChange(closestPanel.index);
            }
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        container.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        container.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('click', onClick);

        if (renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('SpiralScene initialization failed', err);
      setWebGLOk(false);
    }
  }, [onActivePanelChange, onSelectDestination]);

  if (!webGLOk) {
    return (
      <div
        style={{
          width: '100%',
          height: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.8rem',
        }}
      >
        [ SPIRAL SLIDER ]
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: 'clamp(460px, 58vh, 580px)',
        position: 'relative',
        background: '#050505',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'grab',
      }}
    />
  );
}
