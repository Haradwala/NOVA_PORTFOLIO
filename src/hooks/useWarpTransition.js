import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useWarpTransition
 * Call warpTo('/route') — it fires the warp animation
 * then navigates after the peak.
 *
 * The UniverseCanvas listens to window.warpLevel (set here)
 * for forced warp independent of scroll velocity.
 */
export function useWarpTransition() {
  const navigate    = useNavigate();
  const warpingRef  = useRef(false);

  const warpTo = useCallback((path) => {
    if (warpingRef.current) return;
    warpingRef.current = true;

    // Tell UniverseCanvas to go full warp immediately
    window.__warpForced = 1;

    // Navigate at peak (400ms) — feels like hyperspace jump
    setTimeout(() => {
      navigate(path);
    }, 420);

    // Ease warp back down after navigation
    setTimeout(() => {
      window.__warpForced = 0;
      warpingRef.current  = false;
    }, 900);
  }, [navigate]);

  return { warpTo };
}
