import { useEffect, useState, useRef } from 'react';
import { startAnalyser, stopAnalyser, getAnalyserValues } from '../../lib/audioAnalyser';

const STATE_MAP = { idle: 0, listening: 1, thinking: 2, speaking: 3 };

export function useVoiceHalo({ duplexState, setState, setVoiceAmplitude }) {
  const [amp, setAmp] = useState(0);
  const voiceTickRef = useRef(null);

  useEffect(() => {
    setState(STATE_MAP[duplexState] ?? 0);
    clearInterval(voiceTickRef.current);
    let animationFrameId = null;

    if (duplexState === 'speaking') {
      let tick = 0;
      voiceTickRef.current = setInterval(() => {
        tick++;
        const simulatedAmp = Math.abs(Math.sin(tick * 0.45)) * 0.75 + 0.2;
        setAmp(simulatedAmp);
        setVoiceAmplitude(simulatedAmp);
      }, 55);
    } else if (duplexState === 'listening') {
      const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        let tick = 0;
        voiceTickRef.current = setInterval(() => {
          tick++;
          const simulatedAmp = Math.max(0.015, Math.sin(tick * 0.45) * 0.03 + 0.03);
          setAmp(simulatedAmp);
          setVoiceAmplitude(simulatedAmp);
        }, 55);
      } else {
        startAnalyser().catch((err) => console.error('[VoiceHalo] startAnalyser failed:', err));

        const tickAnalyser = () => {
          const values = getAnalyserValues();
          setAmp(values.voiceAmplitude);
          setVoiceAmplitude(values.voiceAmplitude);
          animationFrameId = requestAnimationFrame(tickAnalyser);
        };
        tickAnalyser();
      }
    } else {
      setAmp(0);
      setVoiceAmplitude(0);
    }

    return () => {
      clearInterval(voiceTickRef.current);
      stopAnalyser();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setVoiceAmplitude(0);
      setAmp(0);
    };
  }, [duplexState, setState, setVoiceAmplitude]);

  return {
    amp,
  };
}
