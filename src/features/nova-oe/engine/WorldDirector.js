/**
 * WorldDirector.js
 * The central controller of the NOVA Operating Environment.
 *
 * Responsibilities:
 *  - Receives world progress from WorldTimeline every frame
 *  - Updates camera target (position + lookAt) along the spline
 *  - Tells each registered world module whether it is active
 *  - Updates lighting intensities per scene zone
 *  - Updates particle system density / drift
 *  - Updates HUD state (current scene label)
 *  - Emits named AI events for future NOVA intelligence hooks
 *
 * Rules:
 *  - WorldDirector does NOT own scroll state — it reads from WorldTimeline
 *  - WorldDirector does NOT render anything — it mutates refs
 *  - All camera math lives here, not in the camera component
 *  - Consumers call director.tick(delta) inside R3F useFrame
 */

import * as THREE from 'three';
import {
  CAMERA_CONFIG,
  CAMERA_SPLINE_POINTS,
  ATMOSPHERE_CONFIG,
  LIGHTING_CONFIG,
  HUD_CONFIG,
} from './WorldConfig';
import { WorldRegistry } from './WorldRegistry';
import { worldTimeline } from './WorldTimeline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toV3(arr) {
  return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

// ─── WorldDirector Class ──────────────────────────────────────────────────────

export class WorldDirectorClass {
  constructor() {
    // ── Spline ──────────────────────────────────────────────────────────────
    this._spline = new THREE.CatmullRomCurve3(
      CAMERA_SPLINE_POINTS.map(toV3),
      false,          // not closed
      'catmullrom',
      0.5             // tension
    );

    // ── Camera smoothing state ───────────────────────────────────────────────
    /** Current smoothed camera position (world space) */
    this.cameraPosition = new THREE.Vector3();
    /** Current smoothed camera lookAt target */
    this.cameraTarget   = new THREE.Vector3();
    /** Current bank angle (radians) */
    this.cameraBank     = 0;
    /** Current breathing offset */
    this._breathOffset  = 0;
    this._breathTime    = 0;

    // ── Lateral velocity for banking ─────────────────────────────────────────
    this._lastCameraX = 0;
    this._bankVelocity = 0;

    // ── Module activation table ───────────────────────────────────────────────
    /**
     * Map<id, { active: boolean, localProgress: number }>
     * Updated every frame so scene components can cheaply subscribe.
     */
    this.moduleStates = new Map();
    WorldRegistry.all().forEach(mod => {
      this.moduleStates.set(mod.id, { active: false, localProgress: 0 });
    });

    // ── HUD state ─────────────────────────────────────────────────────────────
    /**
     * { id, label, sub } of the currently primary (closest) scene.
     * Scene components and HUD overlay read this.
     */
    this.hudState = HUD_CONFIG.sceneLabels[0];

    // ── Lighting state ────────────────────────────────────────────────────────
    /**
     * Per-landmark light target intensities for smooth blending.
     * Array of { intensity } matching LIGHTING_CONFIG.landmarkLights order.
     */
    this.lightStates = LIGHTING_CONFIG.landmarkLights.map(l => ({
      targetIntensity: 0,
      currentIntensity: 0,
      baseIntensity: l.intensity,
    }));

    // ── Particle state ────────────────────────────────────────────────────────
    this.particleState = {
      density: 1.0,    // multiplier applied to particle count visibility
      drift: ATMOSPHERE_CONFIG.dustDriftSpeed,
    };

    // ── Event bus (minimal pub/sub for AI events) ─────────────────────────────
    this._events = new Map();

    // ── Internal scratch vectors ──────────────────────────────────────────────
    this._scratchPos    = new THREE.Vector3();
    this._scratchTarget = new THREE.Vector3();
    this._scratchTangent = new THREE.Vector3();
  }

  // ── Event Bus ─────────────────────────────────────────────────────────────

  /**
   * Subscribe to a named AI event.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  on(event, handler) {
    if (!this._events.has(event)) this._events.set(event, new Set());
    this._events.get(event).add(handler);
    return () => this._events.get(event)?.delete(handler);
  }

  /** Emit a named AI event with optional payload */
  emit(event, payload) {
    this._events.get(event)?.forEach(fn => fn(payload));
  }

  // ── Per-Frame Tick ────────────────────────────────────────────────────────

  /**
   * Must be called every frame (inside R3F useFrame).
   * @param {number} delta - seconds since last frame
   */
  tick(delta) {
    const progress = worldTimeline.tick(delta);

    this._updateCamera(progress, delta);
    this._updateModules(progress);
    this._updateLighting(progress, delta);
    this._updateParticles(progress);
    this._updateHUD(progress);
  }

  // ── Camera Update ─────────────────────────────────────────────────────────

  _updateCamera(progress, delta) {
    const { breathAmplitude, breathFrequency, bankStrength, bankDamping, lookAheadOffset } = CAMERA_CONFIG;

    // Spline position
    this._spline.getPoint(Math.min(progress, 0.9999), this._scratchPos);

    // Lookahead: sample slightly ahead for a stable horizon
    const lookAheadT = Math.min(progress + lookAheadOffset, 0.9999);
    this._spline.getPoint(lookAheadT, this._scratchTarget);

    // Breathing motion — sinusoidal Y offset
    this._breathTime += delta;
    this._breathOffset = Math.sin(this._breathTime * breathFrequency * Math.PI * 2) * breathAmplitude;
    this._scratchPos.y += this._breathOffset;

    // Banking — measure lateral velocity then lerp bank angle
    const lateralDelta  = this._scratchPos.x - this._lastCameraX;
    this._lastCameraX   = this._scratchPos.x;
    this._bankVelocity  = lateralDelta / Math.max(delta, 0.001);

    const targetBank    = -this._bankVelocity * bankStrength;
    this.cameraBank    += (targetBank - this.cameraBank) * bankDamping;

    // Smooth camera position
    const camAlpha = 1 - Math.exp(-CAMERA_CONFIG.damping * 60 * delta);
    this.cameraPosition.lerp(this._scratchPos, camAlpha);
    this.cameraTarget.lerp(this._scratchTarget, camAlpha);
  }

  // ── Module Activation ─────────────────────────────────────────────────────

  _updateModules(progress) {
    const activeModules = WorldRegistry.getActiveAt(progress);
    const activeIds     = new Set(activeModules.map(m => m.id));

    WorldRegistry.all().forEach(mod => {
      const isActive     = activeIds.has(mod.id);
      const localProgress = isActive
        ? WorldRegistry.getLocalProgress(mod.id, progress)
        : 0;

      const prev = this.moduleStates.get(mod.id);

      // Emit enter / exit events for AI hooks
      if (isActive && !prev.active) this.emit('module:enter', mod);
      if (!isActive && prev.active)  this.emit('module:exit',  mod);

      this.moduleStates.set(mod.id, { active: isActive, localProgress });
    });
  }

  // ── Lighting Update ───────────────────────────────────────────────────────

  _updateLighting(progress, delta) {
    const mods = WorldRegistry.all();

    this.lightStates.forEach((state, idx) => {
      const mod = mods[idx];
      if (!mod) return;

      const localP = WorldRegistry.getLocalProgress(mod.id, progress);
      // Bell-curve intensity: peaks at localProgress ≈ 0.5 (module center)
      const t = Math.max(0, 1 - Math.abs(localP - 0.5) * 3.0);
      state.targetIntensity = state.baseIntensity * t;

      // Smooth lerp
      const alpha = 1 - Math.exp(-4.0 * delta);
      state.currentIntensity += (state.targetIntensity - state.currentIntensity) * alpha;
    });
  }

  // ── Particle Update ───────────────────────────────────────────────────────

  _updateParticles(progress) {
    // Slightly increase dust density toward the far end of the journey
    this.particleState.density = 0.7 + progress * 0.6;
    this.particleState.drift   = ATMOSPHERE_CONFIG.dustDriftSpeed * (1 + progress * 0.8);
  }

  // ── HUD Update ────────────────────────────────────────────────────────────

  _updateHUD(progress) {
    const primary = WorldRegistry.getPrimary(progress);
    if (!primary) return;

    const label = HUD_CONFIG.sceneLabels.find(l => l.id === primary.id);
    if (label && label.id !== this.hudState?.id) {
      this.hudState = label;
      this.emit('hud:scene-change', label);
    }
  }

  // ── Convenience Getters ───────────────────────────────────────────────────

  /** Is a given module currently in its activation window? */
  isModuleActive(id) {
    return this.moduleStates.get(id)?.active ?? false;
  }

  /** Get the local progress (0–1) of a specific module */
  getModuleLocalProgress(id) {
    return this.moduleStates.get(id)?.localProgress ?? 0;
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const WorldDirector = new WorldDirectorClass();
