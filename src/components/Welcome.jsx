import { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';

export default function Welcome({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [subtext,  setSubtext]  = useState('Initialising experience...');
  const [spoken,   setSpoken]   = useState(false);
  const { speak, isSupported }  = useTTS();

  const doSpeak = () => {
    if (!isSupported) return;
    speak(
      "Hey! Welcome to Shadab's World. I'm NOVA, his AI assistant. Feel free to explore his work, or ask me anything about him. Let's get started!",
      {
        onStart: () => setSpoken(true),
        onEnd:   () => setSpoken(false),
      }
    );
  };

  // Auto-speak after short delay (let voices load)
  useEffect(() => {
    const t = setTimeout(doSpeak, 600);
    return () => clearTimeout(t);
  }, []);

  // Progress bar
  useEffect(() => {
    const steps = [
      [30,  'Waking up NOVA...'],
      [60,  'Loading Three.js...'],
      [85,  'Almost there ✦'],
      [100, 'Welcome!'],
    ];
    let pct = 0;
    const iv = setInterval(() => {
      pct += 1.2;
      setProgress(Math.min(pct, 100));
      steps.forEach(([t, m]) => { if (pct >= t) setSubtext(m); });
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '2rem', textAlign: 'center',
    }}>
      {/* Orb */}
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 12, 24].map((inset, i) => (
          <div key={i} style={{
            position: 'absolute', inset, borderRadius: '50%',
            border: `1px solid ${['rgba(139,92,246,.3)','rgba(232,149,109,.2)','rgba(45,212,191,.15)'][i]}`,
            animation: `ringPulse 2s ${i * 0.35}s ease infinite`,
          }} />
        ))}
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--rose), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 0 40px rgba(139,92,246,.55), 0 0 80px rgba(232,149,109,.2)',
          animation: 'orbFloat 3s ease infinite', position: 'relative', zIndex: 1,
        }}>✦</div>
      </div>

      {/* Title */}
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.4rem)', color: 'var(--text)', lineHeight: 1.2 }}>
        Hey, welcome to<br />
        <span style={{ background: 'linear-gradient(90deg,var(--rose),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Shadab's World
        </span>{' '}👋
      </div>

      <div style={{ fontSize: '.82rem', color: 'var(--muted)', letterSpacing: '.06em' }}>{subtext}</div>

      {/* Bar */}
      <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, borderRadius: 1, background: 'linear-gradient(90deg, var(--rose), var(--violet))', transition: 'width .05s linear' }} />
      </div>

      {/* Replay voice */}
      <button onClick={doSpeak} style={{
        display: 'flex', alignItems: 'center', gap: '.6rem',
        fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--violet2)',
        background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)',
        borderRadius: 50, padding: '.38rem 1rem', transition: 'all .2s',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: spoken ? '#4ADE80' : 'var(--rose)', animation: 'pulse 1.5s infinite' }} />
        {spoken ? 'Speaking...' : 'Hear the welcome'}
      </button>
    </div>
  );
}
