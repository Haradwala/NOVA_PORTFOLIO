/**
 * BootSequence.jsx — NOVA // ENTER THE SYSTEM
 *
 * Cinematic boot overlay that plays once per browser session.
 *
 * Skip conditions (any one triggers instant skip):
 *  - sessionStorage.getItem('nova_booted') === 'true'
 *  - ?nowelcome=true or ?skipWelcome=true in URL params
 *  - prefers-reduced-motion
 *  - Standalone routes: /chat, /admin, /world
 *
 * Timeline:
 *  0.0s  → Dark screen + blinking cursor
 *  0.4s  → Line 1 types: "SYSTEM INITIALIZING..."
 *  0.95s → Line 2 types: "NEURAL CORE ONLINE"
 *  1.5s  → Line 3 types: "VISUAL ENGINE READY"
 *  2.1s  → Short hold
 *  2.5s  → Fade out overlay → onDone() called
 */

import { useEffect, useRef, useState } from 'react';

const BOOT_SESSION_KEY = 'nova_booted';
const STANDALONE_ROUTES = ['/chat', '/admin', '/world'];

const BOOT_LINES = [
  { text: 'SYSTEM INITIALIZING...', delay: 400 },
  { text: 'NEURAL CORE ONLINE',     delay: 950 },
  { text: 'VISUAL ENGINE READY',    delay: 1500 },
];

function shouldSkipBoot() {
  if (typeof window === 'undefined') return true;

  // Skip if already booted this session
  if (sessionStorage.getItem(BOOT_SESSION_KEY) === 'true') return true;

  // Skip on URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get('nowelcome') === 'true' || params.get('skipWelcome') === 'true') return true;

  // Skip on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  // Skip on standalone routes
  if (STANDALONE_ROUTES.includes(window.location.pathname)) return true;

  return false;
}

export default function BootSequence({ onDone }) {
  const [phase, setPhase]         = useState('boot');   // 'boot' | 'fadeout' | 'done'
  const [visibleLines, setVisible] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => {
    if (shouldSkipBoot()) {
      sessionStorage.setItem(BOOT_SESSION_KEY, 'true');
      onDone?.();
      return;
    }

    // Schedule each line to appear
    BOOT_LINES.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setVisible(prev => [...prev, text]);
      }, delay);
      timersRef.current.push(t);
    });

    // Start fade-out
    const fadeT = setTimeout(() => setPhase('fadeout'), 2150);
    timersRef.current.push(fadeT);

    // Complete
    const doneT = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(BOOT_SESSION_KEY, 'true');
      onDone?.();
    }, 2550);
    timersRef.current.push(doneT);

    return () => timersRef.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#03030A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: 'clamp(2rem, 8vw, 8rem)',
        pointerEvents: 'none',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: phase === 'fadeout' ? 'opacity 0.4s ease' : 'none',
      }}
    >
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* NOVA wordmark — top left */}
      <div style={{
        position: 'absolute', top: 'clamp(1.5rem, 4vh, 3rem)', left: 'clamp(2rem, 8vw, 8rem)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        letterSpacing: '0.22em',
        color: 'rgba(139,92,246,0.45)',
        textTransform: 'uppercase',
      }}>
        NOVA // ENTER THE SYSTEM
      </div>

      {/* Boot lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', position: 'relative', zIndex: 1 }}>
        {BOOT_LINES.map(({ text }, i) => {
          const visible = visibleLines.includes(text);
          const isLast  = i === BOOT_LINES.length - 1;
          return (
            <div
              key={text}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
                letterSpacing: '0.12em',
                color: visible
                  ? (isLast ? 'rgba(167,139,250,0.9)' : 'rgba(167,139,250,0.55)')
                  : 'transparent',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(4px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease, color 0.4s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {/* Status indicator */}
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isLast ? 'rgba(167,139,250,0.9)' : 'rgba(139,92,246,0.5)',
                boxShadow: visible ? `0 0 8px ${isLast ? 'rgba(167,139,250,0.7)' : 'rgba(139,92,246,0.4)'}` : 'none',
                transition: 'box-shadow 0.4s ease',
              }} />
              {text}
              {/* Blinking cursor after last visible line */}
              {isLast && visible && (
                <span className="boot-cursor" />
              )}
            </div>
          );
        })}
      </div>

      {/* Version tag — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(1.5rem, 4vh, 3rem)',
        right: 'clamp(2rem, 8vw, 8rem)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.55rem',
        letterSpacing: '0.2em',
        color: 'rgba(139,92,246,0.25)',
        textTransform: 'uppercase',
      }}>
        v2.0.0 // 2026
      </div>
    </div>
  );
}
