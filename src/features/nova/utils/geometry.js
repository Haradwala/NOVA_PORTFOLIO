export function generateSpherePoints(count) {
  const positions = [];
  const randoms = [];
  const layers = [];
  const spherePositions = [];

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * t);

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);

    const jitter = 0.02;
    const jx = x + (Math.random() - 0.5) * jitter;
    const jy = y + (Math.random() - 0.5) * jitter;
    const jz = z + (Math.random() - 0.5) * jitter;
    const len = Math.sqrt(jx * jx + jy * jy + jz * jz);

    positions.push(jx / len, jy / len, jz / len);
    spherePositions.push(x, y, z);
    randoms.push(Math.random());
    layers.push(Math.random());
  }

  return { positions, randoms, layers, spherePositions };
}

export function getAdaptiveCount() {
  const width = window.innerWidth;
  if (width >= 1200) return 25000;
  if (width >= 768) return 15000;
  return 8000;
}
