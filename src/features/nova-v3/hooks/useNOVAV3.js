import { useRef, useMemo, useCallback } from 'react';

export const STATES = {
  IDLE: 0,
  LISTENING: 1,
  THINKING: 2,
  RESPONDING: 3,
};

export function useNOVAV3() {
  const stateRef = useRef({
    currentState: STATES.IDLE,
    stateIntensity: 0,
    targetIntensity: 0,
    voiceAmplitude: 0,
    attentionRegion: [0, 0, 1],
    attentionStrength: 0,
  });

  const setState = useCallback((state) => {
    stateRef.current.currentState = state;
    stateRef.current.targetIntensity = state;
  }, []);

  const setVoiceAmplitude = useCallback((amp) => {
    stateRef.current.voiceAmplitude = Math.min(amp, 1.0);
  }, []);

  const setAttention = useCallback((region, strength = 0) => {
    stateRef.current.attentionRegion = region;
    stateRef.current.attentionStrength = strength;
  }, []);

  return useMemo(() => ({
    stateRef,
    setState,
    setVoiceAmplitude,
    setAttention,
    STATES,
  }), [setState, setVoiceAmplitude, setAttention]);
}
