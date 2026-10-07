/**
 * Process.jsx — "How the System Evolves" Section
 *
 * NOVA // ENTER THE SYSTEM — Phase 6
 *
 * A compact cinematic 6-step process section placed between
 * Capabilities and Work. Communicates the engineering methodology.
 *
 * Steps: Observe → Architect → Engineer → Visualize → Deploy → Evolve
 *
 * No 3D scene registration — relies on the existing CinematicUniverseCanvas
 * particle field that remains visible between scene transitions.
 */

import { useEffect, useRef, useState } from 'react';
import { registerSection } from '../utils/sectionRegistry';

const STEPS = [
  {
    num: '01',
    label: 'OBSERVE',
    desc: 'Study the problem space, user context, and system constraints before writing a single line.',
    color: 'var(--violet2)',
  },
  {
    num: '02',
    label: 'ARCHITECT',
    desc: 'Design the system map — data flows, component boundaries, API contracts, state topology.',
    color: 'var(--violet)',
  },
  {
    num: '03',
    label: 'ENGINEER',
    desc: 'Build with precision. Clean APIs, typed interfaces, low-latency pipelines, test coverage.',
    color: 'var(--teal)',
  },
  {
    num: '04',
    label: 'VISUALIZE',
    desc: 'Translate systems into interfaces. 3D environments, motion design, and interaction layers.',
    color: 'var(--teal)',
  },
  {
    num: '05',
    label: 'DEPLOY',
    desc: 'Ship to production with confidence. Performance audits, edge-case coverage, real monitoring.',
    color: 'var(--rose)',
  },
  {
    num: '06',
    label: 'EVOLVE',
    desc: 'Learn from usage. Refactor ruthlessly. The system grows smarter with every iteration.',
    color: 'var(--rose2)',
  },
];

export default function Process() {
  const sectionRef = useRef(null);
  const [visibleSteps, setVisibleSteps] = useState(new Set());

  // Register with DOM section registry
  useEffect(() => {
    const unregister = registerSection('process', sectionRef);
    return unregister;
  }, []);

  // Intersection-based step reveal
  useEffect(() => {
    const stepEls = sectionRef.current?.querySelectorAll('[data-step]') || [];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = e.target.dataset.step;
            setVisibleSteps((prev) => new Set([...prev, idx]));
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    stepEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="process"
      id="process"
      style={{
        position: 'relative',
        padding: 'clamp(5rem, 10vh, 9rem) clamp(1.5rem, 6vw, 7rem)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative thin top line */}
      <div style={{
        position: 'absolute', top: 0, left: 'clamp(1.5rem, 6vw, 7rem)', right: 'clamp(1.5rem, 6vw, 7rem)',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
      }} />

      {/* Section header */}
      <div style={{ marginBottom: 'clamp(3rem, 6vh, 5.5rem)' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <span className="system-tag">PROCESS</span>
        </div>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 4vw, 3.8rem)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          margin: 0,
          maxWidth: '680px',
        }}>
          FROM IDEA TO<br />
          <span style={{ color: 'var(--violet2)' }}>INTELLIGENT SYSTEM.</span>
        </h2>
      </div>

      {/* Steps grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'clamp(1.5rem, 3vw, 2.5rem)',
      }}>
        {STEPS.map((step, i) => {
          const isVisible = visibleSteps.has(String(i));
          return (
            <div
              key={step.num}
              data-step={i}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'none' : 'translateY(14px)',
                transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`,
                padding: '1.6rem 1.4rem',
                border: '1px solid rgba(139,92,246,0.1)',
                borderRadius: '3px',
                background: 'rgba(7,7,15,0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${step.color}, transparent)`,
                opacity: 0.6,
              }} />

              {/* Step number */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                fontWeight: 300,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: `${step.color}22`,
                marginBottom: '0.8rem',
                userSelect: 'none',
              }}>
                {step.num}
              </div>

              {/* Step label */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: step.color,
                marginBottom: '0.7rem',
              }}>
                {step.label}
              </div>

              {/* Step description */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                lineHeight: 1.65,
                color: 'rgba(160,160,192,0.7)',
                margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Decorative connector line between steps (desktop only) */}
      <div style={{
        marginTop: 'clamp(2.5rem, 5vh, 4rem)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        opacity: 0.35,
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: i < STEPS.length - 1 ? '1 1 auto' : 'none' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: STEPS[i].color,
              boxShadow: `0 0 6px ${STEPS[i].color}`,
              flexShrink: 0,
            }} />
            {i < STEPS.length - 1 && (
              <div style={{
                flex: '1 1 auto', height: 1,
                background: `linear-gradient(90deg, ${STEPS[i].color}60, ${STEPS[i + 1].color}60)`,
              }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
