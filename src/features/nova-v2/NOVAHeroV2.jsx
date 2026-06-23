import { useRef, useEffect } from 'react';
import { NOVASceneV2 } from './components/NOVASceneV2';
import { useNOVAV2 } from './hooks/useNOVAV2';
import './nova-herov2.css';

export function NOVAHeroV2() {
  const { stateRef, setState, setVoiceAmplitude, STATES } = useNOVAV2();
  const voiceIntervalRef = useRef();

  useEffect(() => {
    const states = [STATES.IDLE, STATES.LISTENING, STATES.THINKING, STATES.RESPONDING];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setState(states[idx]);

      if (states[idx] === STATES.RESPONDING) {
        let tick = 0;
        voiceIntervalRef.current = setInterval(() => {
          tick++;
          setVoiceAmplitude(Math.sin(tick * 0.5) * 0.5 + 0.5);
        }, 50);
      } else {
        clearInterval(voiceIntervalRef.current);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(voiceIntervalRef.current);
    };
  }, [setState, setVoiceAmplitude, STATES]);

  return (
    <section className="nova-herov2">
      <NOVASceneV2 novaRef={stateRef} />
    </section>
  );
}
