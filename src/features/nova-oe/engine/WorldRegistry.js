/**
 * WorldRegistry.js
 * The single source of truth for all world modules (scenes / landmarks).
 *
 * Responsibilities:
 *  - Register every world zone with its position, rotation, and activation range
 *  - Allow the WorldDirector to query which modules are currently active
 *  - Support placeholder → real scene hot-swapping (Phase 2+)
 *
 * Rules:
 *  - Registry is IMMUTABLE after boot (Object.freeze on each entry)
 *  - No React, no Three.js imported here — pure data + lookup logic
 *  - Activation range is expressed in normalized progress (0–1)
 */

// ─── Module Definition ────────────────────────────────────────────────────────

/**
 * @typedef {Object} WorldModule
 * @property {string}   id              - Unique identifier
 * @property {string}   label           - Human-readable display name
 * @property {number[]} position        - [x, y, z] world-space anchor
 * @property {number[]} rotation        - [rx, ry, rz] euler angles in radians
 * @property {number}   entryProgress   - Normalized progress (0–1) when module starts becoming visible
 * @property {number}   peakProgress    - Normalized progress when module is fully centered
 * @property {number}   exitProgress    - Normalized progress when module fades out
 * @property {boolean}  isPlaceholder   - If true, renders placeholder geometry
 * @property {string|null} componentKey - Key used by WorldDirector to lazy-load the real scene
 * @property {Object}   meta            - Arbitrary scene-level metadata for future use
 */

// ─── Registry Entries ─────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'arrival',
    label: 'NOVA Core — Arrival Zone',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    entryProgress: 0.00,
    peakProgress:  0.07,
    exitProgress:  0.18,
    isPlaceholder: false,          // Scene 1 renders the real NOVA Core
    componentKey:  'NovaCorePhase1',
    meta: { accentColor: '#8b5cf6', lightColor: '#8b5cf6' },
  },
  {
    id: 'identity',
    label: 'Identity Module — Who I Am',
    position: [-6, 1.5, -38],
    rotation: [0, 0.4, 0],
    entryProgress: 0.10,
    peakProgress:  0.18,
    exitProgress:  0.28,
    isPlaceholder: true,
    componentKey:  'IdentityScene',
    meta: { accentColor: '#38bdf8', lightColor: '#38bdf8' },
  },
  {
    id: 'capability',
    label: 'Capability Matrix — What I Can Do',
    position: [4, -1, -78],
    rotation: [0, -0.3, 0],
    entryProgress: 0.24,
    peakProgress:  0.32,
    exitProgress:  0.42,
    isPlaceholder: true,
    componentKey:  'CapabilityScene',
    meta: { accentColor: '#a78bfa', lightColor: '#a78bfa' },
  },
  {
    id: 'projects',
    label: 'Project Intelligence — What I\'ve Built',
    position: [-2, 2.5, -118],
    rotation: [0, 0.2, 0],
    entryProgress: 0.38,
    peakProgress:  0.46,
    exitProgress:  0.56,
    isPlaceholder: true,
    componentKey:  'ProjectsScene',
    meta: { accentColor: '#f59e0b', lightColor: '#f59e0b' },
  },
  {
    id: 'timeline',
    label: 'Timeline Engine — My Journey',
    position: [5, -0.5, -158],
    rotation: [0, -0.25, 0],
    entryProgress: 0.52,
    peakProgress:  0.60,
    exitProgress:  0.70,
    isPlaceholder: true,
    componentKey:  'TimelineScene',
    meta: { accentColor: '#2dd4bf', lightColor: '#2dd4bf' },
  },
  {
    id: 'archive',
    label: 'Knowledge Archive — What I\'ve Learned',
    position: [-3, 1, -198],
    rotation: [0, 0.35, 0],
    entryProgress: 0.66,
    peakProgress:  0.74,
    exitProgress:  0.84,
    isPlaceholder: true,
    componentKey:  'ArchiveScene',
    meta: { accentColor: '#818cf8', lightColor: '#818cf8' },
  },
  {
    id: 'terminal',
    label: 'Communication Terminal — Let\'s Connect',
    position: [0, 0, -240],
    rotation: [0, 0, 0],
    entryProgress: 0.80,
    peakProgress:  0.90,
    exitProgress:  1.00,
    isPlaceholder: true,
    componentKey:  'TerminalScene',
    meta: { accentColor: '#e8956d', lightColor: '#e8956d' },
  },
];

// ─── Registry Class ───────────────────────────────────────────────────────────

class WorldRegistryClass {
  constructor() {
    /** @type {Map<string, WorldModule>} */
    this._map = new Map();

    MODULES.forEach(mod => {
      this._map.set(mod.id, Object.freeze({ ...mod }));
    });

    Object.freeze(this._map);
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  /** Returns all registered modules in registration order */
  all() {
    return Array.from(this._map.values());
  }

  /** Returns a single module by id, or undefined */
  get(id) {
    return this._map.get(id);
  }

  /**
   * Returns all modules that are within their activation window at `progress`.
   * @param {number} progress - Normalized 0–1 world progress
   * @returns {WorldModule[]}
   */
  getActiveAt(progress) {
    return this.all().filter(
      mod => progress >= mod.entryProgress && progress <= mod.exitProgress
    );
  }

  /**
   * Returns the module whose peak is closest to the given progress.
   * Useful for HUD label display.
   * @param {number} progress
   * @returns {WorldModule}
   */
  getPrimary(progress) {
    let closest = null;
    let minDist  = Infinity;

    this.all().forEach(mod => {
      const d = Math.abs(mod.peakProgress - progress);
      if (d < minDist) { minDist = d; closest = mod; }
    });

    return closest;
  }

  /**
   * Returns the normalized 0–1 "local progress" of a module at the given world progress.
   * 0 = entry, 0.5 = peak, 1 = exit
   * @param {string} id
   * @param {number} progress
   * @returns {number}
   */
  getLocalProgress(id, progress) {
    const mod = this._map.get(id);
    if (!mod) return 0;

    const span = mod.exitProgress - mod.entryProgress;
    if (span <= 0) return 0;

    return Math.max(0, Math.min(1, (progress - mod.entryProgress) / span));
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const WorldRegistry = new WorldRegistryClass();
