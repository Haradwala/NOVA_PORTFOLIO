/**
 * SplineCamera.jsx
 * Reads WorldDirector's smoothed camera state each frame and applies it
 * to the R3F camera. Also handles bank (roll) via quaternion composition.
 *
 * This component does NO math — all math lives in WorldDirector._updateCamera().
 * Priority 1 (after WorldDirector tick at priority 0).
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldDirector } from '../engine/WorldDirector';
import { CAMERA_CONFIG } from '../engine/WorldConfig';

// ─── Scratch objects (allocated once, reused) ─────────────────────────────────

const _bankAxis = new THREE.Vector3();
const _bankQuat = new THREE.Quaternion();

// ─── Instrumentation scratch (frames 1-10 only) ───────────────────────────────

const _frustum          = new THREE.Frustum();
const _projScreenMatrix = new THREE.Matrix4();
// Core sphere: radius 1.35, centred at world position [0, 1.6, 0]
const _coreSphere       = new THREE.Sphere(new THREE.Vector3(0, 1.6, 0), 1.35);

function v3s(v) {
  return `[${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)}]`;
}
function q4s(q) {
  return `[${q.x.toFixed(4)}, ${q.y.toFixed(4)}, ${q.z.toFixed(4)}, ${q.w.toFixed(4)}]`;
}
function hasNaN(...vals) {
  return vals.some(v => isNaN(v));
}
function allFinite(matrix4) {
  return matrix4.elements.every(v => isFinite(v));
}
function mat4s(matrix4) {
  const e = matrix4.elements; // column-major
  return (
    `\n    [${e[0].toFixed(4)}, ${e[4].toFixed(4)}, ${e[8].toFixed(4)}, ${e[12].toFixed(4)}]` +
    `\n    [${e[1].toFixed(4)}, ${e[5].toFixed(4)}, ${e[9].toFixed(4)}, ${e[13].toFixed(4)}]` +
    `\n    [${e[2].toFixed(4)}, ${e[6].toFixed(4)}, ${e[10].toFixed(4)}, ${e[14].toFixed(4)}]` +
    `\n    [${e[3].toFixed(4)}, ${e[7].toFixed(4)}, ${e[11].toFixed(4)}, ${e[15].toFixed(4)}]`
  );
}

// ─── SplineCamera ─────────────────────────────────────────────────────────────

export default function SplineCamera() {
  const ready      = useRef(false);
  const frameCount = useRef(0);
  const { gl }     = useThree();

  // ── Post-render renderer.info capture ─────────────────────────────────────
  // requestAnimationFrame fires AFTER the current browser paint, which means
  // after R3F has already submitted draw calls to the GPU for that frame.
  // This gives renderer.info values that reflect the completed render pass.
  useEffect(() => {
    let rafId;
    let postFrame = 0;

    function postRender() {
      postFrame += 1;
      if (postFrame > 10) return;
      const { calls, triangles, frame } = gl.info.render;
      console.log(
        `[NOVA POST-F${postFrame}] renderer.info after paint:` +
        ` calls=${calls} triangles=${triangles} frame=${frame}`
      );
      rafId = requestAnimationFrame(postRender);
    }

    rafId = requestAnimationFrame(postRender);
    return () => cancelAnimationFrame(rafId);
  }, [gl]);

  useFrame(({ camera, scene }, _delta) => {
    const dir = WorldDirector;

    // ── Camera update ────────────────────────────────────────────────────────
    if (!ready.current) {
      camera.position.copy(dir.cameraPosition);
      camera.lookAt(dir.cameraTarget);
      ready.current = true;
    } else {
      camera.position.copy(dir.cameraPosition);
      camera.lookAt(dir.cameraTarget);

      _bankAxis.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
      _bankQuat.setFromAxisAngle(_bankAxis, dir.cameraBank);
      camera.quaternion.premultiply(_bankQuat);

      if (camera.fov !== CAMERA_CONFIG.fov) {
        camera.fov = CAMERA_CONFIG.fov;
        camera.updateProjectionMatrix();
      }
    }

    // ── Instrumentation: frames 1-10, then silent ────────────────────────────
    frameCount.current += 1;
    const f = frameCount.current;
    if (f > 10) return;

    const cp   = dir.cameraPosition;
    const ct   = dir.cameraTarget;
    const cpos = camera.position;
    const cquat = camera.quaternion;

    const nanInPos    = hasNaN(cpos.x,  cpos.y,  cpos.z);
    const nanInQuat   = hasNaN(cquat.x, cquat.y, cquat.z, cquat.w);
    const nanInDirPos = hasNaN(cp.x, cp.y, cp.z);
    const nanInDirTgt = hasNaN(ct.x, ct.y, ct.z);

    // ── Distance check every frame ──────────────────────────────────────────
    const dist = camera.position.distanceTo(ct);
    const distWarn = dist === 0 ? ' *** WARNING: distance=0, lookAt will degenerate ***' : '';

    console.log(
      `[NOVA F${f}]` +
      ` cam.pos=${v3s(cpos)} NaN=${nanInPos}` +
      ` | cam.quat=${q4s(cquat)} NaN=${nanInQuat}` +
      ` | dir.pos=${v3s(cp)} NaN=${nanInDirPos}` +
      ` | dir.tgt=${v3s(ct)} NaN=${nanInDirTgt}` +
      ` | dist(cam→tgt)=${dist.toFixed(4)}${distWarn}`
    );

    // ── Frame 1: scene object census + matrices ──────────────────────────────
    if (f === 1) {
      let totalChildren = 0;
      let groups        = 0;
      let meshes        = 0;
      let lights        = 0;
      let points        = 0;
      let lineSegments  = 0;

      scene.traverse(obj => {
        totalChildren += 1;
        if (obj.isGroup)            groups       += 1;
        if (obj.isMesh)             meshes       += 1;
        if (obj.isLight)            lights       += 1;
        if (obj.isPoints)           points       += 1;
        if (obj.isLineSegments || obj.isLine) lineSegments += 1;
      });

      console.log(
        `[NOVA F1 SCENE] totalObjects=${totalChildren}` +
        ` groups=${groups} meshes=${meshes} lights=${lights}` +
        ` points=${points} lineSegments=${lineSegments}`
      );

      // Matrices — logged once on F1
      camera.updateMatrixWorld(true);
      const mwOK    = allFinite(camera.matrixWorld);
      const mwiOK   = allFinite(camera.matrixWorldInverse);
      const projOK  = allFinite(camera.projectionMatrix);

      console.log(
        `[NOVA F1 MATRICES]` +
        ` matrixWorld allFinite=${mwOK}` +
        ` matrixWorldInverse allFinite=${mwiOK}` +
        ` projectionMatrix allFinite=${projOK}`
      );
      console.log(`[NOVA F1 matrixWorld]${mat4s(camera.matrixWorld)}`);
      console.log(`[NOVA F1 matrixWorldInverse]${mat4s(camera.matrixWorldInverse)}`);
      console.log(`[NOVA F1 projectionMatrix]${mat4s(camera.projectionMatrix)}`);
    }

    // ── Frame 10: frustum intersection test ──────────────────────────────────
    if (f === 10) {
      camera.updateMatrixWorld(true);
      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      _frustum.setFromProjectionMatrix(_projScreenMatrix);

      const coreInFrustum = _frustum.intersectsSphere(_coreSphere);
      console.log(
        `[NOVA F10 FRUSTUM]` +
        ` Core sphere (center=[0,1.6,0] r=1.35)` +
        ` in camera frustum=${coreInFrustum}`
      );
    }
  }, 1); // priority 1 — runs after WorldDirector tick

  return null;
}
