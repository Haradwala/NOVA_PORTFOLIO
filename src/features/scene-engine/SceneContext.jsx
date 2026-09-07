/**
 * SceneContext.jsx — Phase 1: Shared Scene Foundation
 *
 * Provides:
 *  - Active scene tracking ('arrival' | 'about' | 'work' | 'contact')
 *  - Per-section normalized scroll progress (0–1)
 *  - Quality tier ('desktop' | 'mobile') based on screen width + DPR
 *  - Reduced-motion flag from system preferences
 *  - Section registration API for future scenes to self-register
 *
 * How to register a future scene section:
 *  const { registerSection } = useScene();
 *  useEffect(() => {
 *    const ref = myDivRef.current;
 *    if (ref) registerSection('identity', ref);
 *  }, []);
 *
 * How to read scroll progress in a scene:
 *  const { sceneProgress } = useScene();
 *  const progress = sceneProgress['arrival'] ?? 0; // 0 = top, 1 = fully scrolled through
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const SceneCtx = createContext(null);

/** Determine quality tier once. Re-checks on resize. */
function getQualityTier() {
  if (typeof window === 'undefined') return 'desktop';
  const mobile = window.innerWidth < 768 || window.devicePixelRatio < 1.5;
  return mobile ? 'mobile' : 'desktop';
}

export function SceneProvider({ children }) {
  const [activeScene,    setActiveScene]    = useState('arrival');
  const [sceneProgress,  setSceneProgress]  = useState({});
  const [qualityTier,    setQualityTier]    = useState(() => getQualityTier());
  const [reducedMotion,  setReducedMotion]  = useState(false);

  // Map of { sceneId → DOM element }
  const sectionRefs = useRef(new Map());
  const rafRef      = useRef(null);

  // ── Reduced-motion preference ──────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Quality tier on resize ─────────────────────────────────────────────────
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setQualityTier(getQualityTier()), 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, []);

  // ── RAF-based scroll progress ──────────────────────────────────────────────
  useEffect(() => {
    let dirty = false;
    const onScroll = () => { dirty = true; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!dirty) return;
      dirty = false;

      const vh = window.innerHeight;
      const next = {};
      let mostVisible = 'arrival';
      let mostVisibleRatio = -Infinity;

      sectionRefs.current.forEach((el, id) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // progress = how far the section has scrolled through the viewport (0→1)
        const raw = 1 - (rect.top / vh);
        next[id] = Math.max(0, Math.min(1, raw));

        // Active scene = section with most on-screen presence
        const visibleRatio = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        if (visibleRatio > mostVisibleRatio) {
          mostVisibleRatio = visibleRatio;
          mostVisible = id;
        }
      });

      setSceneProgress(prev => {
        // Only update state if values changed (avoids re-renders on identical scroll)
        const changed = Object.keys(next).some(k => prev[k] !== next[k]);
        return changed ? { ...prev, ...next } : prev;
      });
      setActiveScene(mostVisible);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Section Registration API ───────────────────────────────────────────────
  const registerSection = useCallback((id, el) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  const value = {
    activeScene,
    sceneProgress,
    qualityTier,
    reducedMotion,
    registerSection,
  };

  return <SceneCtx.Provider value={value}>{children}</SceneCtx.Provider>;
}

export function useScene() {
  const ctx = useContext(SceneCtx);
  if (!ctx) throw new Error('useScene must be used inside <SceneProvider>');
  return ctx;
}
