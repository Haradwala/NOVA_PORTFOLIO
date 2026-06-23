import { useRef, useMemo, useCallback } from 'react';

export const STATES = {
  IDLE: 0,
  LISTENING: 1,
  THINKING: 2,
  RESPONDING: 3,
};

export function useNOVA() {
  const stateRef = useRef({
    currentState: STATES.IDLE,
    stateIntensity: 0,
    targetIntensity: 0,
    voiceAmplitude: 0,
    attentionRegion: [0, 0, 1],
    attentionStrength: 0,
    topic: null,
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

  const processTopic = useCallback((topic) => {
    const hash = topic.split('').reduce((a, c) => {
      a = ((a << 5) - a) + c.charCodeAt(0);
      return a & a;
    }, 0);
    const theta = (Math.abs(hash) % 628) / 100;
    const phi = (Math.abs(hash >> 8) % 314) / 100;
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    stateRef.current.attentionRegion = [x, y, z];
    stateRef.current.attentionStrength = 0.8;
    stateRef.current.topic = topic;
  }, []);

  return useMemo(() => ({
    stateRef,
    setState,
    setVoiceAmplitude,
    setAttention,
    processTopic,
    STATES,
  }), [setState, setVoiceAmplitude, setAttention, processTopic]);
}
