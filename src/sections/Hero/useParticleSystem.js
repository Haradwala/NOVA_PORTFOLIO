import { useCallback, useRef } from 'react';
import * as THREE from 'three';

// ─── Palette: Pearl White / Lavender / Jade – no blue ───────────────────────
const PALETTE = {
  coreWhite:  new THREE.Color(0xF8F6FF),   // brightest nucleus
  pearl:      new THREE.Color(0xEEEBFF),   // pearl-white halo
  lavender:   new THREE.Color(0xB39DDB),   // mid-field lavender
  softViolet: new THREE.Color(0x9575CD),   // deeper violet
  jade:       new THREE.Color(0x80CBC4),   // jade accent
  driftGray:  new THREE.Color(0x4A4A6A),   // outer drift
};

// Seeded noise substitute (cheap, deterministic)
function sNoise(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7);
  return (s - Math.floor(s)) * 2 - 1;
}

export function useParticleSystem() {
  const particlesRef = useRef([]);

  /**
   * initSingularity – creates three concentric layers:
   *   Layer 0: Consciousness Core  – very high density, tiny radius
   *   Layer 1: Cognitive Field     – mid density, medium radius
   *   Layer 2: Drift Horizon       – sparse outer shell
   */
  const initParticles = useCallback((count) => {
    const list = [];
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    // Layer budget
    const coreFraction  = 0.42;  // 42 % packed inside core
    const fieldFraction = 0.40;  // 40 % cognitive field
    // remaining 18 % = drift horizon

    for (let i = 0; i < count; i++) {
      const layerSeed = i / count;
      let layer, r, color, size;

      if (layerSeed < coreFraction) {
        // ── Consciousness Core ────────────────────────
        layer = 0;
        // Power distribution: cluster near centre
        const t = Math.pow(Math.random(), 2.2);
        r = t * 0.55 + 0.01;
        const mix = Math.random();
        color = mix < 0.5 ? PALETTE.coreWhite : mix < 0.78 ? PALETTE.pearl : PALETTE.lavender;
        size  = 0.014 + Math.random() * 0.028;
      } else if (layerSeed < coreFraction + fieldFraction) {
        // ── Cognitive Field ───────────────────────────
        layer = 1;
        r = 0.55 + Math.pow(Math.random(), 1.4) * 0.75;
        const mix = Math.random();
        color = mix < 0.45 ? PALETTE.lavender : mix < 0.72 ? PALETTE.softViolet : PALETTE.jade;
        size  = 0.010 + Math.random() * 0.018;
      } else {
        // ── Drift Horizon ─────────────────────────────
        layer = 2;
        r = 1.3 + Math.random() * 0.9;
        const mix = Math.random();
        color = mix < 0.6 ? PALETTE.driftGray : PALETTE.softViolet;
        size  = 0.006 + Math.random() * 0.010;
      }

      // Spherical distribution with slight oblate squish (y * 0.72)
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const bx    = r * Math.sin(phi) * Math.cos(theta);
      const by    = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      const bz    = r * Math.cos(phi);

      // Per-particle phase / speed / noise offsets
      const phase   = Math.random() * Math.PI * 2;
      const driftV  = (Math.random() - 0.5) * 0.0012;  // slow gravitational drift
      const noiseO  = Math.random() * 100;

      list.push({
        baseX: bx, baseY: by, baseZ: bz,
        x: bx, y: by, z: bz,
        r, layer, phase, driftV, noiseO,
        // Used for gravitational contraction during listening
        angle: theta, phi,
        speed: 0.25 + Math.random() * 0.55,
      });

      positions[i * 3]     = bx;
      positions[i * 3 + 1] = by;
      positions[i * 3 + 2] = bz;

      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = size;
    }

    particlesRef.current = list;
    return { positions, colors, sizes };
  }, []);

  /**
   * updateParticles – evolves particle positions every frame.
   * Cognitive states alter physical behaviour:
   *   idle      – gentle slow rotation + gravitational drift
   *   listening – contraction + cluster toward centre
   *   thinking  – localized energy packets (wave propagation)
   *   speaking  – expanding radial waves
   */
  const updateParticles = useCallback(({
    count, radiusFactor, scalePulse,
    isSpeaking, isListening, isThinking,
    wordPulse, jitterFactor, colArr, posArr, tt, navPulse = 0,
  }) => {
    const list = particlesRef.current;
    if (!list || list.length === 0) return;

    for (let i = 0; i < count; i++) {
      const p = list[i];
      if (!p) continue;

      // ── Base radius target ────────────────────────────────────────────────
      let rTarget = p.r * radiusFactor * scalePulse;

      // ── Layer-specific motion amplitude ──────────────────────────────────
      const layerScale = p.layer === 0 ? 0.72 : p.layer === 1 ? 1.0 : 1.35;

      // ── Noise-driven gravitational drift (always present) ─────────────────
      const nOff  = p.noiseO;
      const nx    = sNoise(p.baseX + tt * 0.08 + nOff, p.baseY, p.baseZ) * 0.012 * layerScale;
      const ny    = sNoise(p.baseX, p.baseY + tt * 0.07 + nOff, p.baseZ) * 0.012 * layerScale;
      const nz    = sNoise(p.baseX, p.baseY, p.baseZ + tt * 0.09 + nOff) * 0.010 * layerScale;

      let rx = p.baseX * rTarget + nx;
      let ry = p.baseY * rTarget + ny;
      let rz = p.baseZ * rTarget + nz;
      const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);

      // ── Listening: gravitational contraction ──────────────────────────────
      if (isListening && dist > 0.01) {
        const pull = (p.layer === 0 ? 0.22 : p.layer === 1 ? 0.14 : 0.06);
        rx += (-rx / dist) * pull;
        ry += (-ry / dist) * pull;
        rz += (-rz / dist) * pull;
      }

      // ── Thinking: localized energy packet pulses ──────────────────────────
      if (isThinking) {
        const packetFreq = 3.5 + (i % 5) * 0.6;
        const packetAmp  = p.layer === 0 ? 0.04 : 0.07;
        const pulse      = Math.sin(tt * packetFreq + p.phase) * packetAmp;
        if (dist > 0.01) {
          rx += (rx / dist) * pulse;
          ry += (ry / dist) * pulse;
          rz += (rz / dist) * pulse;
        }
      }

      // ── Speaking: radial wave expansion ──────────────────────────────────
      if (isSpeaking && dist > 0.01) {
        const waveAmp = 0.06 + wordPulse * 0.32;
        const wave    = Math.sin(dist * 4.8 - tt * 9.0) * waveAmp;
        rx += (rx / dist) * wave;
        ry += (ry / dist) * wave;
        rz += (rz / dist) * wave;
      }

      // ── Nav pulse: brief inward compression ──────────────────────────────
      if (navPulse > 0.01 && dist > 0.01) {
        const inward = navPulse * 0.18 * (p.layer === 0 ? 1 : p.layer === 1 ? 0.6 : 0.3);
        rx -= (rx / dist) * inward;
        ry -= (ry / dist) * inward;
        rz -= (rz / dist) * inward;
      }

      // ── State jitter ─────────────────────────────────────────────────────
      const jx = Math.sin(tt * 14.0 + p.phase) * jitterFactor;
      const jy = Math.cos(tt * 11.0 + p.phase) * jitterFactor;
      const jz = Math.sin(tt * 9.5  + p.phase + 1.3) * jitterFactor;

      p.x = rx + jx;
      p.y = ry + jy;
      p.z = rz + jz;

      posArr[i * 3]     = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;

      // ── Color shift by state ──────────────────────────────────────────────
      let tColor;
      if (p.layer === 0) {
        tColor = isListening ? PALETTE.pearl : isSpeaking ? PALETTE.coreWhite : PALETTE.coreWhite;
      } else if (p.layer === 1) {
        tColor = isListening ? PALETTE.lavender
               : isThinking  ? PALETTE.jade
               : isSpeaking  ? PALETTE.lavender
               : PALETTE.softViolet;
      } else {
        tColor = isListening ? PALETTE.softViolet
               : isThinking  ? PALETTE.lavender
               : PALETTE.driftGray;
      }

      const lerpSpeed = isListening || isSpeaking ? 0.12 : 0.06;
      colArr[i * 3]     += (tColor.r - colArr[i * 3])     * lerpSpeed;
      colArr[i * 3 + 1] += (tColor.g - colArr[i * 3 + 1]) * lerpSpeed;
      colArr[i * 3 + 2] += (tColor.b - colArr[i * 3 + 2]) * lerpSpeed;
    }
  }, []);

  /** connectPathways – proximity links between Cognitive Field particles only */
  const connectPathways = useCallback(({
    count, maxConnections, maxDist, linePos, lineCol, colArr,
  }) => {
    const list = particlesRef.current;
    if (!list || list.length === 0) return 0;

    let connCount = 0;
    // Only connect layer-1 particles for clean web-of-thought look
    const layer1  = [];
    for (let i = 0; i < count; i++) {
      if (list[i] && list[i].layer === 1) layer1.push(i);
    }

    const step = layer1.length > 600 ? 3 : 2;

    for (let a = 0; a < layer1.length; a += step) {
      if (connCount >= maxConnections) break;
      const i  = layer1[a];
      const p1 = list[i];

      const searchEnd = Math.min(a + 30, layer1.length);
      for (let b = a + 1; b < searchEnd; b++) {
        if (connCount >= maxConnections) break;
        const j  = layer1[b];
        const p2 = list[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq < maxDist * maxDist) {
          const fade = Math.max(0, 1 - Math.sqrt(dSq) / maxDist);
          const idx  = connCount * 6;

          linePos[idx]     = p1.x; linePos[idx + 1] = p1.y; linePos[idx + 2] = p1.z;
          linePos[idx + 3] = p2.x; linePos[idx + 4] = p2.y; linePos[idx + 5] = p2.z;

          const opF = fade * 0.65;
          lineCol[idx]     = colArr[i * 3]     * opF;
          lineCol[idx + 1] = colArr[i * 3 + 1] * opF;
          lineCol[idx + 2] = colArr[i * 3 + 2] * opF;
          lineCol[idx + 3] = colArr[j * 3]     * opF;
          lineCol[idx + 4] = colArr[j * 3 + 1] * opF;
          lineCol[idx + 5] = colArr[j * 3 + 2] * opF;

          connCount++;
        }
      }
    }
    return connCount;
  }, []);

  return { initParticles, updateParticles, connectPathways };
}
