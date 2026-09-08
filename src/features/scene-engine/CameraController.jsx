/**
 * CameraController.jsx — Phase 1: Controlled Camera Choreography
 *
 * Runs inside the shared R3F Canvas (CinematicUniverseCanvas).
 *
 * Behaviour:
 *  - On Arrival mount: performs a 1.8s cinematic push-in from
 *    vantage point [0, 0.5, 5.8] → resting position [0, 0, 4.2]
 *  - After the entrance completes, camera is fully static. No idle drift.
 *  - If reducedMotion is true: camera jumps directly to rest position,
 *    no animation is played.
 *  - Future scenes can pass different target positions via props.
 *
 * Easing: smooth exponential decay (lerp factor 0.04/frame @ 60fps ≈ 1.8s settle)
 *
 * NOTE: This controller only moves the environment camera.
 * The NOVA Core lives in its own separate Canvas and has its own camera.
 * These two cameras are fully independent.
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from './SceneContext';

const SCENE_TARGETS = {
  arrival:      { pos: new THREE.Vector3(0, 0, 4.2),    look: new THREE.Vector3(0, 0, 0) },
  identity:     { pos: new THREE.Vector3(0, 0.2, 4.6),  look: new THREE.Vector3(0, 0.05, 0) },
  capabilities: { pos: new THREE.Vector3(0, 0, 5.0),    look: new THREE.Vector3(0, 0, 0) },
};

const START_POSITION = new THREE.Vector3(0, 0.5, 5.8);

export default function CameraController({ reducedMotion }) {
  const { camera } = useThree();
  const { activeScene } = useScene();
  const entranceProgress = useRef(0);
  const entranceDone = useRef(false);
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Determine current scene target
  const target = SCENE_TARGETS[activeScene] || SCENE_TARGETS.arrival;

  useEffect(() => {
    if (reducedMotion) {
      camera.position.copy(target.pos);
      camera.lookAt(target.look);
      currentLookAt.current.copy(target.look);
      entranceDone.current = true;
    } else {
      camera.position.copy(START_POSITION);
      camera.lookAt(target.look);
      currentLookAt.current.copy(target.look);
      entranceProgress.current = 0;
      entranceDone.current = false;
    }
  }, [camera, reducedMotion]);

  useFrame((_, delta) => {
    // 1. Entrance push-in on initial arrival
    if (!entranceDone.current) {
      entranceProgress.current = Math.min(1, entranceProgress.current + delta * 0.65);
      const t = 1 - Math.pow(1 - entranceProgress.current, 3);
      camera.position.lerpVectors(START_POSITION, SCENE_TARGETS.arrival.pos, t);
      camera.lookAt(SCENE_TARGETS.arrival.look);

      if (entranceProgress.current >= 1) {
        camera.position.copy(SCENE_TARGETS.arrival.pos);
        camera.lookAt(SCENE_TARGETS.arrival.look);
        entranceDone.current = true;
      }
      return;
    }

    // 2. Continuous smooth inter-scene lerping
    if (reducedMotion) {
      camera.position.copy(target.pos);
      camera.lookAt(target.look);
      return;
    }

    // Smooth exponential damping toward active scene target (damping factor ~ 2.4/s)
    const factor = Math.min(1, delta * 2.4);
    camera.position.lerp(target.pos, factor);
    currentLookAt.current.lerp(target.look, factor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
