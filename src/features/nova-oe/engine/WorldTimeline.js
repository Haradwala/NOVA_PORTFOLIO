/**
 * WorldTimeline.js
 * Owns the single canonical source of normalized world progress (0 → 1).
 *
 * Responsibilities:
 *  - Convert raw scroll position → normalized progress
 *  - Apply smoothing / easing so the camera never reads scroll directly
 *  - Support programmatic seek (e.g. navbar scene jumps)
 *  - Expose a React hook (useWorldTimeline) for consumption in components
 *  - Expose a raw class (WorldTimeline) for use inside R3F useFrame loops
 *
 * Rules:
 *  - No camera logic here — progress is just a number
 *  - No Three.js here — pure JS
 *  - The rest of the engine reads from here; they never touch window.scrollY
 */

import { useEffect, useRef, useCallback } from 'react';
import { WORLD_SCROLL_MULTIPLIER } from './WorldConfig';

// ─── Core Timeline Class ──────────────────────────────────────────────────────

export class WorldTimeline {
  constructor() {
    /** Raw progress from scroll driver (0–1, instant) */
    this._rawProgress     = 0;
    /** Smoothed progress — what the rest of the world reads */
    this._smoothProgress  = 0;
    /** Target set by programmatic seek */
    this._targetProgress  = null;
    /** Whether the timeline is actively being driven */
    this._active          = true;

    // Internal state for velocity tracking
    this._lastRaw         = 0;
    this._velocity        = 0;

    // Listeners subscribed via .onChange()
    this._listeners       = new Set();

    this._scrollHandler   = this._onScroll.bind(this);
    this._resizeHandler   = this._onResize.bind(this);

    this._viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;
    this._totalH    = this._viewportH * WORLD_SCROLL_MULTIPLIER;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Call once to start listening to scroll */
  mount() {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', this._scrollHandler, { passive: true });
    window.addEventListener('resize', this._resizeHandler, { passive: true });
    this._updateRaw();
  }

  /** Call on unmount / cleanup */
  destroy() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this._scrollHandler);
    window.removeEventListener('resize', this._resizeHandler);
    this._listeners.clear();
  }

  // ── Scroll Driver ──────────────────────────────────────────────────────────

  _onScroll() {
    this._updateRaw();
    // Clear any programmatic seek when user scrolls manually
    this._targetProgress = null;
  }

  _onResize() {
    this._viewportH = window.innerHeight;
    this._totalH    = this._viewportH * WORLD_SCROLL_MULTIPLIER;
    this._updateRaw();
  }

  _updateRaw() {
    if (typeof window === 'undefined') return;
    const scrollable = this._totalH - this._viewportH;
    this._rawProgress = scrollable > 0
      ? Math.max(0, Math.min(1, window.scrollY / scrollable))
      : 0;
  }

  // ── Per-Frame Tick (called inside R3F useFrame) ────────────────────────────

  /**
   * Must be called every frame.
   * @param {number} delta - seconds since last frame
   * @returns {number} - current smooth progress
   */
  tick(delta) {
    if (!this._active) return this._smoothProgress;

    const target = this._targetProgress !== null
      ? this._targetProgress
      : this._rawProgress;

    // Exponential smoothing — framerate independent
    const alpha = 1 - Math.exp(-8.0 * delta);
    const prev  = this._smoothProgress;
    this._smoothProgress += (target - this._smoothProgress) * alpha;

    // Track velocity for downstream consumers (e.g. camera banking)
    this._velocity = (this._smoothProgress - prev) / Math.max(delta, 0.001);

    if (this._listeners.size > 0) {
      this._listeners.forEach(fn => fn(this._smoothProgress, this._velocity));
    }

    return this._smoothProgress;
  }

  // ── Programmatic Seek ──────────────────────────────────────────────────────

  /**
   * Smoothly navigate to a specific normalized progress value.
   * Also scrolls the window to match so the scroll position stays in sync.
   * @param {number} progress - 0–1
   */
  seekTo(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    this._targetProgress = clamped;

    // Sync window scroll so the page doesn't snap on next manual scroll
    if (typeof window !== 'undefined') {
      const scrollable = this._totalH - this._viewportH;
      window.scrollTo({ top: clamped * scrollable, behavior: 'instant' });
    }
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  /** Normalized smooth progress (0–1) */
  get progress()  { return this._smoothProgress; }

  /** Normalized raw scroll progress (0–1) before smoothing */
  get rawProgress() { return this._rawProgress; }

  /** Rate of progress change per second */
  get velocity()  { return this._velocity; }

  // ── Listener API ──────────────────────────────────────────────────────────

  /**
   * Subscribe to progress updates.
   * @param {Function} fn - called with (progress, velocity)
   * @returns {Function} unsubscribe
   */
  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

/** Shared singleton used across the application */
export const worldTimeline = new WorldTimeline();

// ─── React Hook ───────────────────────────────────────────────────────────────

/**
 * useWorldTimeline
 * React hook that provides the current smooth timeline progress
 * and a seekTo function for programmatic navigation.
 *
 * Re-renders are intentionally NOT triggered on every frame — call this
 * only for UI components that need progress at render time (e.g. HUD labels).
 * For frame-loop consumption, use worldTimeline.tick(delta) in useFrame.
 *
 * @returns {{ progress: number, velocity: number, seekTo: Function }}
 */
export function useWorldTimeline() {
  const progressRef = useRef(worldTimeline.progress);
  const velocityRef = useRef(worldTimeline.velocity);

  useEffect(() => {
    worldTimeline.mount();
    const unsub = worldTimeline.onChange((p, v) => {
      progressRef.current = p;
      velocityRef.current = v;
    });
    return () => {
      unsub();
      worldTimeline.destroy();
    };
  }, []);

  const seekTo = useCallback((progress) => {
    worldTimeline.seekTo(progress);
  }, []);

  return {
    get progress() { return progressRef.current; },
    get velocity() { return velocityRef.current; },
    seekTo,
  };
}
