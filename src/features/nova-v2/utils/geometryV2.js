/**
 * geometryV2.js — Surface-dominant particle distribution
 *
 * 85% of particles sit on the sphere shell (r ≈ 1.0).
 * 15% form a thin aura band just outside (r 1.01–1.18).
 * No interior/volumetric scattering.
 * Fibonacci spiral gives perfectly even surface coverage.
 */

export function generateSurfacePoints(count) {
  const positions      = [];
  const randoms        = [];
  const layers         = [];
  const spherePositions = []; // unit-sphere normals for shader curl reference

  const goldenRatio    = (1 + Math.sqrt(5)) / 2;
  const surfaceFrac    = 0.85; // 85% on shell

  for (let i = 0; i < count; i++) {
    const t     = i / count;
    // Fibonacci spiral → perfectly even angular distribution
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi   = Math.acos(1 - 2 * t);

    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.sin(phi) * Math.sin(theta);
    const nz = Math.cos(phi);

    const isSurface = t < surfaceFrac;
    const layerVal  = isSurface ? 0.0 : 1.0;

    // Surface: tight shell jitter (±2%)
    // Aura:    thin band outside (1.0 – 1.18)
    const r = isSurface
      ? 1.0 + (Math.random() - 0.5) * 0.04
      : 1.01 + Math.random() * 0.17;

    positions.push(nx * r, ny * r, nz * r);
    spherePositions.push(nx, ny, nz);
    randoms.push(Math.random());
    layers.push(layerVal);
  }

  return { positions, randoms, layers, spherePositions };
}

export function getAdaptiveCountV2() {
  const w = window.innerWidth;
  if (w >= 1200) return 25000;
  if (w >= 768)  return 14000;
  return 7000;
}
