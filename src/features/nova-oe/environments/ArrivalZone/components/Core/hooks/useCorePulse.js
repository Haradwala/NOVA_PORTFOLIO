/**
 * useCorePulse.js
 *
 * Custom hook returning a helper that computes a normalized,
 * deterministic sine-wave pulse (0 -> 1 -> 0) with a 4.5-second period
 * using the shared R3F clock.
 */

export default function useCorePulse() {
  return {
    get: (clockTime) => (Math.sin((clockTime * Math.PI * 2) / 4.5) + 1) / 2,
  };
}
