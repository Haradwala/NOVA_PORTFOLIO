/**
 * SceneManager.js
 * Manages environment registration, lifecycle, and lazy-loading for the NOVA OE.
 *
 * Responsibilities:
 *  - Register environments with id, component ref, and lifecycle hooks
 *  - Track activation state (idle → entering → active → leaving → idle)
 *  - Provide per-frame update delegation
 *  - Support placeholder → real scene swapping (Phase 3)
 *  - Emit AI-activation hooks for future NOVA intelligence
 *
 * Rules:
 *  - WorldDirector communicates ONLY through SceneManager
 *  - No React, no Three.js — pure orchestration logic
 *  - SceneManager does NOT render — WorldScene reads from it
 */

import { WorldRegistry } from './WorldRegistry';

// ─── State Machine ────────────────────────────────────────────────────────────

export const SCENE_STATE = Object.freeze({
  IDLE:     'idle',
  ENTERING: 'entering',
  ACTIVE:   'active',
  LEAVING:  'leaving',
});

// ─── SceneManager Class ───────────────────────────────────────────────────────

class SceneManagerClass {
  constructor() {
    /**
     * Map<id, EnvironmentEntry>
     * @typedef {{ definition: Object, state: string, localProgress: number }} EnvironmentEntry
     */
    this._envs = new Map();

    /** Callbacks for AI event hooks */
    this._aiHooks = new Map();

    /** Reference to WorldDirector — injected via connect() */
    this._director = null;
  }

  // ── Connection ────────────────────────────────────────────────────────────

  /**
   * Connect to WorldDirector.
   * Must be called once after both singletons are created.
   * @param {import('./WorldDirector').WorldDirectorClass} director
   */
  connect(director) {
    this._director = director;

    director.on('module:enter', (mod) => this._handleEnter(mod));
    director.on('module:exit',  (mod) => this._handleLeave(mod));
  }

  // ── Registration ─────────────────────────────────────────────────────────

  /**
   * Register an environment.
   * @param {string} id - Must match a WorldRegistry module id
   * @param {Object} def
   * @param {Function} [def.onEnter]   - Called when camera enters activation range
   * @param {Function} [def.onUpdate]  - Called every frame with (localProgress, delta)
   * @param {Function} [def.onLeave]   - Called when camera exits activation range
   * @param {Object}   [def.camera]    - Optional camera overrides: { fovOffset, lookOffset }
   * @param {string}   [def.aiPrompt]  - Future: triggers NOVA AI contextual response
   */
  register(id, def = {}) {
    if (!WorldRegistry.get(id)) {
      console.warn(`[SceneManager] No registry entry for id "${id}"`);
      return;
    }

    this._envs.set(id, {
      definition:    def,
      state:         SCENE_STATE.IDLE,
      localProgress: 0,
    });
  }

  // ── Lifecycle Handlers ────────────────────────────────────────────────────

  _handleEnter(mod) {
    const env = this._envs.get(mod.id);
    if (!env) return;

    env.state = SCENE_STATE.ENTERING;
    env.definition.onEnter?.(mod);
    this._fireAIHook('enter', mod.id, { mod });
  }

  _handleLeave(mod) {
    const env = this._envs.get(mod.id);
    if (!env) return;

    env.state = SCENE_STATE.LEAVING;
    env.definition.onLeave?.(mod);
    this._fireAIHook('leave', mod.id, { mod });
  }

  // ── Per-Frame Tick ────────────────────────────────────────────────────────

  /**
   * Call every frame (from WorldScene's useFrame).
   * @param {number} delta
   */
  tick(delta) {
    if (!this._director) return;

    this._envs.forEach((env, id) => {
      const isActive = this._director.isModuleActive(id);
      const localP   = this._director.getModuleLocalProgress(id);

      env.localProgress = localP;

      // State transitions
      if (isActive && env.state !== SCENE_STATE.ACTIVE) {
        env.state = SCENE_STATE.ACTIVE;
      }
      if (!isActive && env.state === SCENE_STATE.LEAVING) {
        env.state = SCENE_STATE.IDLE;
      }

      // Per-frame update callback
      if (env.state === SCENE_STATE.ACTIVE || env.state === SCENE_STATE.ENTERING) {
        env.definition.onUpdate?.(localP, delta);
      }
    });
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Get current state of an environment */
  getState(id) {
    return this._envs.get(id)?.state ?? SCENE_STATE.IDLE;
  }

  /** Get local progress (0–1) of an environment */
  getLocalProgress(id) {
    return this._envs.get(id)?.localProgress ?? 0;
  }

  /** Get camera overrides defined by an environment */
  getCameraOverride(id) {
    return this._envs.get(id)?.definition.camera ?? null;
  }

  /** Returns all registered environment ids in order */
  getIds() {
    return Array.from(this._envs.keys());
  }

  // ── AI Hook System ────────────────────────────────────────────────────────

  /**
   * Register a future NOVA AI hook.
   * @param {string} event - 'enter' | 'leave'
   * @param {string} id    - environment id, or '*' for all
   * @param {Function} fn
   */
  onAI(event, id, fn) {
    const key = `${event}:${id}`;
    if (!this._aiHooks.has(key)) this._aiHooks.set(key, new Set());
    this._aiHooks.get(key).add(fn);
    return () => this._aiHooks.get(key)?.delete(fn);
  }

  _fireAIHook(event, id, payload) {
    this._aiHooks.get(`${event}:${id}`)?.forEach(fn => fn(payload));
    this._aiHooks.get(`${event}:*`)?.forEach(fn => fn({ ...payload, id }));
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const SceneManager = new SceneManagerClass();
