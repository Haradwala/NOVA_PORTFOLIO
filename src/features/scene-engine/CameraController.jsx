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

const REST_POSITION  = new THREE.Vector3(0, 0, 4.2);
const REST_LOOK      = new THREE.Vector3(0, 0, 0);
const START_POSITION = new THREE.Vector3(0, 0.5, 5.8);

export default function CameraController({ reducedMotion }) {
  const { camera } = useThree();
  const progress   = useRef(0);   // 0 = at start, 1 = at rest
  const done       = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      // Skip animation — settle immediately
      camera.position.copy(REST_POSITION);
      camera.lookAt(REST_LOOK);
      done.current = true;
    } else {
      // Start at vantage position
      camera.position.copy(START_POSITION);
      camera.lookAt(REST_LOOK);
      progress.current = 0;
      done.current     = false;
    }
  }, [camera, reducedMotion]);

  useFrame((_, delta) => {
    if (done.current) return;

    // Advance progress (exponential ease-out: slower as it approaches 1)
    progress.current = Math.min(1, progress.current + delta * 0.65);

    // Smooth easing curve (ease-out cubic)
    const t = 1 - Math.pow(1 - progress.current, 3);

    camera.position.lerpVectors(START_POSITION, REST_POSITION, t);
    camera.lookAt(REST_LOOK);

    if (progress.current >= 1) {
      camera.position.copy(REST_POSITION);
      camera.lookAt(REST_LOOK);
      done.current = true;
    }
  });

  return null;
}
