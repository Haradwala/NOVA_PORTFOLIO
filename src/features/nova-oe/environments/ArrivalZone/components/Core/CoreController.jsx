import { useFrame } from '@react-three/fiber';
import useCorePulse from './hooks/useCorePulse';
import { sparkSeeds } from './MicroSparks';
import { CoreStates, stateRuntime, updateStateRuntime } from './systems/CoreState';

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export default function CoreController({
  coreGroupRef,
  emitterMatRef,
  haloMatRef,
  lightRef,
  auraMatRef,
  energyShellRef,
  orbitalHaloRefs,
  filamentMatRefs,
  sparkRefs,
}) {
  const pulseHelper = useCorePulse();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    updateStateRuntime(t);
    const activeState = stateRuntime.getState();

    // 1. Fetch normalized breathing pulse
    const dynamicPulse = clamp(pulseHelper.get(t), 0.0, 1.0);

    // Initial declaration of state variable outputs
    let coreScale = 1.0;
    let emitterEmissive = 0.05;
    let haloOpacity = 0.05;
    let lightIntensity = 0.2;
    let auraOpacity = 0.01;
    let shellScale = 1.0;
    let filamentOpacity = 0.01;
    let rotMultiplier = 0.0;
    let sparkDisplacementScale = 0.0;

    if (activeState === CoreStates.BOOTING) {
      // ── Stage 1: DORMANT (0-2s) ──
      // Keep all initial variables static and minimal
    } else if (activeState === CoreStates.AWAKENING) {
      // ── Stage 2: AWAKENING (2-10s) ──
      if (t < 4.0) {
        // Sub-stage 2A: First Pulse (2-4s)
        const p = clamp((t - 2.0) / 2.0, 0.0, 1.0);
        coreScale = 1.0;
        emitterEmissive = 0.05 + p * 2.95;       // reaches 3.0
        shellScale = 1.0 + p * 0.03;             // reaches 1.03
        haloOpacity = 0.05 + p * 0.20;            // reaches 0.25
        lightIntensity = 0.2 + p * 5.3;           // reaches 5.5
        auraOpacity = 0.01 + p * 0.05;            // reaches 0.06
        filamentOpacity = 0.01 + p * 0.04;        // reaches 0.05
        rotMultiplier = p * 0.2;                  // slowly start ring rotation
        sparkDisplacementScale = p * 0.3;         // start slow drift
      } else if (t < 7.0) {
        // Sub-stage 2B: Synchronization (4-7s)
        const p = clamp((t - 4.0) / 3.0, 0.0, 1.0);
        coreScale = 1.0;
        emitterEmissive = 3.0 + p * 0.2;         // reaches 3.2
        shellScale = 1.03 + p * 0.01;            // reaches 1.04
        haloOpacity = 0.25 + p * 0.05;           // reaches 0.30
        lightIntensity = 5.5;
        auraOpacity = 0.06;
        filamentOpacity = 0.05 + p * 0.08;       // reaches 0.13
        rotMultiplier = 0.2 + p * 0.8;            // ramp to full speed
        sparkDisplacementScale = 0.3 + p * 0.7;   // ramp sparks displacement
      } else {
        // Sub-stage 2C: Awareness (7-10s) - Seamlessly blend final stage into idle loops
        const p = clamp((t - 7.0) / 3.0, 0.0, 1.0);

        // Dynamic Idle targets at current clock frame
        const targetCoreScale = 1.0 + dynamicPulse * 0.015;
        const targetEmitterEmissive = 2.2 + dynamicPulse * 1.3;
        const targetHaloOpacity = 0.30 + dynamicPulse * 0.12;
        const targetLightIntensity = 5.5 + dynamicPulse * 1.5;
        const targetAuraOpacity = 0.05 + dynamicPulse * 0.04;
        const targetShellScale = 1.0 + dynamicPulse * 0.05;
        const targetFilamentOpacity = 0.13 + dynamicPulse * 0.05;

        // Linear interpolation from boot-stage end towards dynamic idle targets
        coreScale = 1.0 * (1.0 - p) + targetCoreScale * p;
        emitterEmissive = 3.2 * (1.0 - p) + targetEmitterEmissive * p;
        shellScale = 1.04 * (1.0 - p) + targetShellScale * p;
        haloOpacity = 0.30 * (1.0 - p) + targetHaloOpacity * p;
        lightIntensity = 5.5 * (1.0 - p) + targetLightIntensity * p;
        auraOpacity = 0.06 * (1.0 - p) + targetAuraOpacity * p;
        filamentOpacity = 0.13 * (1.0 - p) + targetFilamentOpacity * p;
        rotMultiplier = 1.0;
        sparkDisplacementScale = 1.0;
      }
    } else {
      // ── Stage 3: IDLE (10s+) ──
      // Evaluate pure dynamic idle breathing calculations
      coreScale = 1.0 + dynamicPulse * 0.015;
      emitterEmissive = 2.2 + dynamicPulse * 1.3;
      shellScale = 1.0 + dynamicPulse * 0.05;
      haloOpacity = 0.30 + dynamicPulse * 0.12;
      lightIntensity = 5.5 + dynamicPulse * 1.5;
      auraOpacity = 0.05 + dynamicPulse * 0.04;
      filamentOpacity = 0.13 + dynamicPulse * 0.05;
      rotMultiplier = 1.0;
      sparkDisplacementScale = 1.0;
    }

    // Direct WebGL ref updates using clamped, state-derived variables
    if (coreGroupRef.current) {
      const s = clamp(coreScale, 1.0, 1.015);
      coreGroupRef.current.scale.set(s, s, s);
    }
    if (emitterMatRef.current) {
      emitterMatRef.current.emissiveIntensity = clamp(emitterEmissive, 0.0, 3.5);
    }
    if (haloMatRef.current) {
      haloMatRef.current.opacity = clamp(haloOpacity, 0.0, 0.42);
    }
    if (lightRef.current) {
      lightRef.current.intensity = clamp(lightIntensity, 0.0, 7.0);
    }
    if (auraMatRef.current) {
      auraMatRef.current.opacity = clamp(auraOpacity, 0.0, 0.09);
    }
    if (energyShellRef.current) {
      const s = clamp(shellScale, 1.0, 1.05);
      energyShellRef.current.scale.set(s, s, s);
    }

    // Orbital Halos rotation (drift speeds scaled by state-derived multiplier)
    if (orbitalHaloRefs.current[0]) {
      orbitalHaloRefs.current[0].rotation.y = t * 0.012 * rotMultiplier;
    }
    if (orbitalHaloRefs.current[1]) {
      orbitalHaloRefs.current[1].rotation.y = t * 0.016 * rotMultiplier;
    }
    if (orbitalHaloRefs.current[2]) {
      orbitalHaloRefs.current[2].rotation.y = t * 0.020 * rotMultiplier;
    }

    // Energy Filaments opacity
    for (let i = 0; i < 24; i++) {
      if (filamentMatRefs.current[i]) {
        filamentMatRefs.current[i].opacity = clamp(filamentOpacity, 0.0, 0.18);
      }
    }

    // Micro Sparks elliptical orbital drift
    if (sparkRefs.current) {
      const posAttr = sparkRefs.current.getAttribute('position');
      if (posAttr) {
        const pos = posAttr.array;
        sparkSeeds.forEach((spark, idx) => {
          const theta = t * 0.04 * spark.speed + spark.phase;
          const dx = clamp(Math.cos(theta) * spark.radiusX, -0.30, 0.30) * sparkDisplacementScale;
          const dy = clamp(Math.sin(theta) * spark.radiusY, -0.30, 0.30) * sparkDisplacementScale;
          const dz = clamp(Math.cos(theta) * spark.radiusZ, -0.30, 0.30) * sparkDisplacementScale;
          
          pos[idx * 3] = spark.basePos.x + dx;
          pos[idx * 3 + 1] = spark.basePos.y + dy;
          pos[idx * 3 + 2] = spark.basePos.z + dz;
        });
        posAttr.needsUpdate = true;
      }
    }
  });

  return null;
}
