import { useRef, useEffect, useState } from 'react';
import { NOVAScene } from './components/NOVAScene';
import { useNOVA, STATES } from './hooks/useNOVA';
import './nova-hero.css';

export function NOVAHero() {
  const { stateRef, setState, setVoiceAmplitude, processTopic, STATES } = useNOVA();
  const [displayState, setDisplayState] = useState('IDLE');
  const [topic, setTopic] = useState('');
  const voiceIntervalRef = useRef();

  useEffect(() => {
    const states = [STATES.IDLE, STATES.LISTENING, STATES.THINKING, STATES.RESPONDING];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setState(states[idx]);
      const names = ['IDLE', 'LISTENING', 'THINKING', 'RESPONDING'];
      setDisplayState(names[idx]);

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

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      processTopic(topic);
      setTopic('');
    }
  };

  return (
    <section className="nova-hero">
      <div className="nova-hero-content">
        <div className="nova-hero-visual">
          <NOVAScene novaRef={stateRef} />
        </div>
        <div className="nova-hero-text">
          <h1 className="nova-title">NOVA</h1>
          <p className="nova-subtitle">Neural Operating Virtual Architecture</p>
          <div className="nova-state-indicator">
            <span className={`nova-state-dot nova-state-${displayState.toLowerCase()}`} />
            <span className="nova-state-label">{displayState}</span>
          </div>
          <form onSubmit={handleTopicSubmit} className="nova-topic-form">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ask NOVA anything..."
              className="nova-topic-input"
            />
            <button type="submit" className="nova-topic-btn">Focus</button>
          </form>
        </div>
      </div>
    </section>
  );
}
