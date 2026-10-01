/**
 * CameraController.jsx — Cinematic Universe Camera Choreography
 *
 * Runs inside the shared R3F Canvas (CinematicUniverseCanvas).
 *
 * SCENE CHOREOGRAPHY:
 *  - Arrival: entrance push-in from [0, 0.5, 5.8] → [0, 0, 4.2]
 *  - Identity ("Constellation Timeline"):
 *      Cinematic camera path with balanced distance allowing multiple glowing
 *      nodes and connecting lines to remain visible in the frame simultaneously.
 *      Smoothly travels along a 3D Catmull-Rom spline as the user scrolls.
 *  - Capabilities ("Your Small World"):
 *      Frames the central planet and all three orbiting bodies with cinematic depth.
 *  - Reduced motion: static balanced vantage positions with gentle fades.
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from './SceneContext';

// Base static resting targets
const BASE_TARGETS = {
  arrival:      { pos: new THREE.Vector3(0, 0, 4.2),    look: new THREE.Vector3(0, 0, 0) },
  identity:     { pos: new THREE.Vector3(0, 0.8, 4.8),  look: new THREE.Vector3(0, 0.4, -2.5) },
  capabilities: { pos: new THREE.Vector3(0, 0.9, 6.4),  look: new THREE.Vector3(0, 0, -1.2) },
  process:      { pos: new THREE.Vector3(0, 0.4, 5.0),  look: new THREE.Vector3(0, 0, 0) },
  missions:     { pos: new THREE.Vector3(0, 0.4, 5.0),  look: new THREE.Vector3(0, 0, 0) },
  work:         { pos: new THREE.Vector3(0, 0.4, 5.0),  look: new THREE.Vector3(0, 0, 0) },
  archive:      { pos: new THREE.Vector3(0, 0.2, 4.6),  look: new THREE.Vector3(0, 0, 0) },
  contact:      { pos: new THREE.Vector3(0, 0, 4.2),    look: new THREE.Vector3(0, 0, 0) },
};

const START_POSITION = new THREE.Vector3(0, 0.5, 5.8);

// Constellation Camera Flight Spline Points (Identity Scene)
// Balanced framing: camera stays 3.5–5 units in front of the active plane so multiple
// nodes, connecting lines, and background stars are always in frame!
const CONSTELLATION_CAM_POINTS = [
  new THREE.Vector3(0.0, 0.8, 4.8),   // 0.0: Initial Bio Overview
  new THREE.Vector3(-1.4, 1.2, 3.2),  // Node 0: AEI Dual Diploma Rank 1
  new THREE.Vector3(0.6, 1.5, 0.8),   // Node 1: GTU Start (Computer Science)
  new THREE.Vector3(1.8, 0.3, -1.6),  // Node 2: Tech Smart / AEI Student Coordinator
  new THREE.Vector3(-0.2, -0.4, -4.0),// Node 3: AEI Honor Society President & Mentor
  new THREE.Vector3(-1.4, 0.4, -6.5), // Node 4: Edu-Champs 3.0 Instructor & PM
  new THREE.Vector3(0.8, 0.6, -9.0),  // Node 5: GTU Expected Graduation 2028 (Beacon)
];

const CONSTELLATION_LOOK_POINTS = [
  new THREE.Vector3(0.0, 0.4, -2.5),   // 0.0: Overview looking into constellation
  new THREE.Vector3(-1.8, 1.0, -1.8),  // Looking toward Node 0 & connecting line to Node 1
  new THREE.Vector3(1.0, 1.3, -4.2),   // Looking toward Node 1 & line to Node 2
  new THREE.Vector3(2.0, 0.0, -6.5),   // Looking toward Node 2 & line to Node 3
  new THREE.Vector3(-0.5, -0.6, -9.0), // Looking toward Node 3 & line to Node 4
  new THREE.Vector3(-1.8, 0.3, -11.5), // Looking toward Node 4 & line to Node 5
  new THREE.Vector3(1.4, 0.5, -13.0),  // Looking toward Node 5 beacon
];

export default function CameraController({ reducedMotion }) {
  const { camera } = useThree();
  const { activeScene, sceneProgress } = useScene();
  const entranceProgress = useRef(0);
  const entranceDone = useRef(false);
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Build Catmull-Rom splines for smooth camera path travel
  const camSpline = useMemo(() => new THREE.CatmullRomCurve3(CONSTELLATION_CAM_POINTS, false, 'catmullrom', 0.25), []);
  const lookSpline = useMemo(() => new THREE.CatmullRomCurve3(CONSTELLATION_LOOK_POINTS, false, 'catmullrom', 0.25), []);

  const targetPos  = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (reducedMotion) {
      const t = BASE_TARGETS[activeScene] || BASE_TARGETS.arrival;
      camera.position.copy(t.pos);
      camera.lookAt(t.look);
      currentLookAt.current.copy(t.look);
      entranceDone.current = true;
    } else {
      camera.position.copy(START_POSITION);
      camera.lookAt(BASE_TARGETS.arrival.look);
      currentLookAt.current.copy(BASE_TARGETS.arrival.look);
      entranceProgress.current = 0;
      entranceDone.current = false;
    }
  }, [camera, reducedMotion]);

  useFrame((_, delta) => {
    // 1. Entrance push-in on initial arrival
    if (!entranceDone.current) {
      entranceProgress.current = Math.min(1, entranceProgress.current + delta * 0.65);
      const t = 1 - Math.pow(1 - entranceProgress.current, 3);
      camera.position.lerpVectors(START_POSITION, BASE_TARGETS.arrival.pos, t);
      camera.lookAt(BASE_TARGETS.arrival.look);

      if (entranceProgress.current >= 1) {
        camera.position.copy(BASE_TARGETS.arrival.pos);
        camera.lookAt(BASE_TARGETS.arrival.look);
        entranceDone.current = true;
      }
      return;
    }

    // 2. Reduced motion: immediate snap to target scene
    if (reducedMotion) {
      const t = BASE_TARGETS[activeScene] || BASE_TARGETS.arrival;
      camera.position.copy(t.pos);
      camera.lookAt(t.look);
      return;
    }

    // 3. Active Scene Camera Computation
    const isDebugNode = typeof window !== 'undefined' && window.location.search.includes('debugNode=true');
    if (isDebugNode) {
      targetPos.set(0, 0, 3.2);
      targetLook.set(0, 0, 0);
    } else if (activeScene === 'identity') {
      const progress = Math.max(0, Math.min(1, sceneProgress['identity'] ?? 0));
      camSpline.getPointAt(progress, targetPos);
      lookSpline.getPointAt(progress, targetLook);
    } else {
      const base = BASE_TARGETS[activeScene] || BASE_TARGETS.arrival;
      targetPos.copy(base.pos);
      targetLook.copy(base.look);
    }

    // Smooth exponential damping toward active camera position & look target
    const factor = Math.min(1, delta * 2.8);
    camera.position.lerp(targetPos, factor);
    currentLookAt.current.lerp(targetLook, factor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
