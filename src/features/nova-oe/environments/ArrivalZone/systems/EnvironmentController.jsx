import { useFrame } from '@react-three/fiber';
import useCorePulse from '../components/Core/hooks/useCorePulse';
import { CoreStates, stateRuntime } from '../components/Core/systems/CoreState';

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Centralized material and component registry for decoupled environmental response
export const environmentRegistry = {
  ringMat: null,
  platformMat: null,
  bridgeMat: null,
  portalMat: null,
  fog: null,
  hemiLight: null,
};

export default function EnvironmentController() {
  const pulseHelper = useCorePulse();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const activeState = stateRuntime.getState();

    const dynamicPulse = clamp(pulseHelper.get(t), 0.0, 1.0);

    // Initial declaration of environment variables
    let ringM = 0.68;
    let ringR = 0.44;
    let platM = 0.68;
    let platR = 0.44;
    let bridM = 0.68;
    let bridR = 0.44;
    let portalBrightness = 0.0;
    let fogInterpolation = 0.0;
    let hemiIntensity = 0.15;

    if (activeState === CoreStates.BOOTING) {
      // ── Stage 1: DORMANT (0-2s) ──
      // Default standard properties, no animation
    } else if (activeState === CoreStates.AWAKENING) {
      // ── Stage 2: AWAKENING (2-10s) ──
      if (t < 4.0) {
        // Sub-stage 2A: First Pulse (2-4s)
        const p = clamp((t - 2.0) / 2.0, 0.0, 1.0);
        ringM = 0.68 + p * 0.03;              // reaches 0.71
        ringR = 0.44 - p * 0.02;              // reaches 0.42
        portalBrightness = p * 0.025;         // reaches 2.5%
      } else if (t < 7.0) {
        // Sub-stage 2B: Synchronization (4-7s)
        const p = clamp((t - 4.0) / 3.0, 0.0, 1.0);
        ringM = 0.71 + p * 0.03;              // reaches 0.74
        ringR = 0.42 - p * 0.02;              // reaches 0.40
        platM = 0.68 + p * 0.01;              // reaches 0.69
        platR = 0.44 - p * 0.015;             // reaches 0.425
        bridM = 0.68 + p * 0.01;              // reaches 0.69
        bridR = 0.44 - p * 0.015;             // reaches 0.425
        portalBrightness = 0.025 + p * 0.025; // reaches 5.0%
      } else {
        // Sub-stage 2C: Awareness (7-10s) - Seamless transition blending
        const p = clamp((t - 7.0) / 3.0, 0.0, 1.0);

        // Dynamic Idle targets at current clock frame
        const targetRingM = 0.68 + dynamicPulse * 0.06;
        const targetRingR = 0.44 - dynamicPulse * 0.04;
        const targetPlatM = 0.68 + dynamicPulse * 0.05 * 0.32;
        const targetPlatR = 0.44 - dynamicPulse * 0.05 * 0.44;
        const targetBridM = 0.68 + dynamicPulse * 0.05 * 0.32;
        const targetBridR = 0.44 - dynamicPulse * 0.05 * 0.44;
        const targetPortalB = dynamicPulse * 0.05;
        const targetFogI = dynamicPulse * 0.08;
        const targetHemiI = 0.15 * (1.0 - dynamicPulse * 0.05);

        // Blending boot final values with dynamic dynamic values
        ringM = 0.74 * (1.0 - p) + targetRingM * p;
        ringR = 0.40 * (1.0 - p) + targetRingR * p;
        platM = 0.69 * (1.0 - p) + targetPlatM * p;
        platR = 0.425 * (1.0 - p) + targetPlatR * p;
        bridM = 0.69 * (1.0 - p) + targetBridM * p;
        bridR = 0.425 * (1.0 - p) + targetBridR * p;
        portalBrightness = 0.05 * (1.0 - p) + targetPortalB * p;
        fogInterpolation = targetFogI * p;
        hemiIntensity = 0.15 * (1.0 - p) + targetHemiI * p;
      }
    } else {
      // ── Stage 3: IDLE (10s+) ──
      // Dynamic idle resonance calculations
      ringM = 0.68 + dynamicPulse * 0.06;
      ringR = 0.44 - dynamicPulse * 0.04;
      platM = 0.68 + dynamicPulse * 0.05 * 0.32;
      platR = 0.44 - dynamicPulse * 0.05 * 0.44;
      bridM = 0.68 + dynamicPulse * 0.05 * 0.32;
      bridR = 0.44 - dynamicPulse * 0.05 * 0.44;
      portalBrightness = dynamicPulse * 0.05;
      fogInterpolation = dynamicPulse * 0.08;
      hemiIntensity = 0.15 * (1.0 - dynamicPulse * 0.05);
    }

    // Direct WebGL ref writes using clamped parameters
    if (environmentRegistry.ringMat) {
      environmentRegistry.ringMat.metalness = clamp(ringM, 0.68, 0.74);
      environmentRegistry.ringMat.roughness = clamp(ringR, 0.40, 0.44);
    }
    if (environmentRegistry.platformMat) {
      environmentRegistry.platformMat.metalness = clamp(platM, 0.68, 0.70);
      environmentRegistry.platformMat.roughness = clamp(platR, 0.41, 0.44);
    }
    if (environmentRegistry.bridgeMat) {
      environmentRegistry.bridgeMat.metalness = clamp(bridM, 0.68, 0.70);
      environmentRegistry.bridgeMat.roughness = clamp(bridR, 0.41, 0.44);
    }
    if (environmentRegistry.portalMat) {
      const r = 0.133 + portalBrightness * 0.133;
      const g = 0.157 + portalBrightness * 0.157;
      const b = 0.220 + portalBrightness * 0.220;
      environmentRegistry.portalMat.color.setRGB(r, g, b);
    }
    if (environmentRegistry.fog) {
      const r = 0.0157 + (0.039 - 0.0157) * fogInterpolation;
      const g = 0.0235 + (0.0627 - 0.0235) * fogInterpolation;
      const b = 0.047 + (0.125 - 0.047) * fogInterpolation;
      environmentRegistry.fog.color.setRGB(r, g, b);
    }
    if (environmentRegistry.hemiLight) {
      environmentRegistry.hemiLight.intensity = clamp(hemiIntensity, 0.1425, 0.15);
    }
  });

  return null;
}
