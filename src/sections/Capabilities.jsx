import { useState, useEffect, useRef } from 'react';
import { useScene } from '../features/scene-engine/SceneContext';
import { registerSection, highlightSection } from '../utils/sectionRegistry';

export default function Capabilities() {
  const sectionRef = useRef(null);
  const [activeSystem, setActiveSystem] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('active') || p.get('system') || null;
    }
    return null;
  });

  // 1. Register with Scene Engine for 3D Camera / Canvas tracking
  const { registerSection: registerSceneSection } = useScene();
  useEffect(() => {
    if (sectionRef.current) {
      registerSceneSection('capabilities', sectionRef.current);
    }
    return () => registerSceneSection('capabilities', null);
  }, [registerSceneSection]);

  // 2. Register with DOM Section Registry for backward-compatible scroll & highlight ('skills')
  useEffect(() => {
    const unregisterSkills = registerSection('skills', sectionRef);

    if (window.__pendingScroll === 'skills') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.__pendingHighlight === 'skills') {
          window.__pendingHighlight = null;
          highlightSection('skills');
        }
      }, 350);
    }

    return () => {
      unregisterSkills();
    };
  }, []);

  // Reveal observer for entry animations
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal') || [];
    const checkVis = () => {
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('vis');
        }
      });
    };
    checkVis();
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    els.forEach(el => obs.observe(el));
    const t = setTimeout(checkVis, 200);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, []);

  // 3 distinct technical systems matching the 3D Systems Lab representations
  const systems = [
    {
      id: 'ai-cognitive',
      num: 'SYS-01',
      title: 'AI & Cognitive Systems',
      subtitle: 'Neural Orchestration & Autonomous Agent Pipelines',
      tagline: 'Local-first & cloud LLM pipelines with real-time audio and function execution.',
      icon: '🧠',
      accentColor: '#8B5CF6',
      accentGlow: 'rgba(139, 92, 246, 0.25)',
      borderColor: 'rgba(139, 92, 246, 0.35)',
      badge: 'Agentic Core',
      stats: [
        { label: 'Latency', val: '< 600ms Groq / Edge' },
        { label: 'Architecture', val: 'Local-First + Cloud' },
      ],
      techChips: [
        { name: 'LLM Pipelines', icon: '⚡' },
        { name: 'Agentic Systems', icon: '🤖' },
        { name: 'Python & Automation', icon: '🐍' },
        { name: 'Prompt Engineering', icon: '💬' },
        { name: 'Hono / tRPC AI Routes', icon: '📡' },
      ],
      affordanceText: 'View AI Systems In Action',
      affordanceTarget: '#projects',
    },
    {
      id: 'fullstack-core',
      num: 'SYS-02',
      title: 'Full-Stack Engineering',
      subtitle: 'Modular End-to-End Applications & Microservices',
      tagline: 'End-to-end type-safe architectures with fast edge handlers, serverless APIs, and secure payment verification.',
      icon: '⚙️',
      accentColor: '#2DD4BF',
      accentGlow: 'rgba(45, 212, 191, 0.25)',
      borderColor: 'rgba(45, 212, 191, 0.35)',
      badge: 'Type-Safe Bus',
      stats: [
        { label: 'Type Safety', val: 'End-to-End tRPC' },
        { label: 'Deployments', val: 'Vercel / Edge Functions' },
      ],
      techChips: [
        { name: 'React / Vite', icon: '⚛️' },
        { name: 'Node.js', icon: '🟢' },
        { name: 'Hono / tRPC', icon: '🚀' },
        { name: 'Supabase', icon: '⚡' },
        { name: 'MongoDB Atlas', icon: '🍃' },
        { name: 'REST & WebSockets', icon: '🔄' },
        { name: 'Tailwind CSS', icon: '🎨' },
      ],
      affordanceText: 'Inspect Platform Architecture',
      affordanceTarget: '#projects',
    },
    {
      id: 'creative-3d',
      num: 'SYS-03',
      title: 'Interactive 3D & WebGL',
      subtitle: 'Real-Time Graphics, Spatial Environments & Custom Shaders',
      tagline: 'Cinematic browser viewports, GLSL shaders, camera lerp choreographies, and hardware-accelerated lattices.',
      icon: '🌌',
      accentColor: '#E8956D',
      accentGlow: 'rgba(232, 149, 109, 0.25)',
      borderColor: 'rgba(232, 149, 109, 0.35)',
      badge: '60 FPS Viewport',
      stats: [
        { label: 'Renderer', val: 'R3F / Three.js r180' },
        { label: 'Performance', val: 'Sub-millisecond Frames' },
      ],
      techChips: [
        { name: 'Three.js / R3F', icon: '📐' },
        { name: 'WebGL Shaders (GLSL)', icon: '✨' },
        { name: 'Canvas 2D Physics', icon: '🪐' },
        { name: 'Audio Reactive Visuals', icon: '🎵' },
        { name: 'Viewport Projection', icon: '🎥' },
      ],
      affordanceText: 'Examine WebGL Shaders',
      affordanceTarget: '#projects',
    },
  ];

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="capabilities-section"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: '7rem 3.5rem',
        overflow: 'hidden',
        background: 'transparent', // Let 3D Systems Lab show through
      }}
    >
      <style>{`
        .capabilities-section {
          padding-top: calc(7rem + env(safe-area-inset-top)) !important;
          padding-bottom: calc(7rem + env(safe-area-inset-bottom)) !important;
          padding-left: calc(3.5rem + env(safe-area-inset-left)) !important;
          padding-right: calc(3.5rem + env(safe-area-inset-right)) !important;
        }

        .systems-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          align-items: stretch;
        }

        .system-floating-card {
          border-radius: 24px;
          background: rgba(12, 10, 28, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.16);
          padding: 2.2rem 2rem;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.32s ease,
                      opacity 0.28s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline: none;
        }

        .system-floating-card:hover,
        .system-floating-card:focus-visible {
          transform: translateY(-6px);
          outline: none;
        }

        .system-floating-card.active {
          opacity: 1 !important;
        }

        .system-floating-card.dimmed {
          opacity: 0.58 !important;
          filter: saturate(80%);
        }

        @media (max-width: 1040px) {
          .systems-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .capabilities-section {
            padding: 4.5rem 1.5rem !important;
          }
        }
      `}</style>

      {/* Subtle radial atmosphere (maintains contrast over technical 3D wireframes) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(7,7,15,0.45) 0%, rgba(7,7,15,0.72) 100%)',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Section Header ── */}
        <div className="reveal" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBottom: '3.8rem',
          borderBottom: '1px solid rgba(139,92,246,0.18)',
          paddingBottom: '1.8rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2DD4BF',
              boxShadow: '0 0 10px #2DD4BF',
              display: 'inline-block'
            }} />
            <span style={{
              fontSize: '0.68rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--teal)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700
            }}>
              Systems Lab // Capabilities 02
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(2.2rem, 3.8vw, 3.6rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                margin: 0,
                color: '#FFFFFF'
              }}>
                Engineering Disciplines &amp; Architecture
              </h2>
              <p style={{
                fontSize: '0.96rem',
                color: '#CBD5E1',
                margin: '0.7rem 0 0 0',
                maxWidth: 680,
                lineHeight: 1.6
              }}>
                Three specialized technical tracks built with verified modern toolchains. Hover or focus any system to examine supporting technologies.
              </p>
            </div>

            <div style={{
              fontSize: '0.62rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontFamily: 'monospace'
            }}>
              INTERACTIVE SYSTEMS LAB · 3 NODES
            </div>
          </div>
        </div>

        {/* ── 3 Systems Floating Detail-Card Grid ── */}
        <div className="systems-grid">
          {systems.map((sys) => {
            const isHovered = activeSystem === sys.id;
            const isOtherHovered = activeSystem !== null && !isHovered;

            return (
              <div
                key={sys.id}
                tabIndex={0}
                role="region"
                aria-label={sys.title}
                className={`system-floating-card reveal ${isHovered ? 'active' : ''} ${isOtherHovered ? 'dimmed' : ''}`}
                style={{
                  boxShadow: isHovered
                    ? `0 20px 48px rgba(0,0,0,0.55), 0 0 35px ${sys.accentGlow}`
                    : '0 12px 32px rgba(0,0,0,0.35)',
                  borderColor: isHovered ? sys.borderColor : 'rgba(139, 92, 246, 0.16)',
                }}
                onMouseEnter={() => setActiveSystem(sys.id)}
                onMouseLeave={() => setActiveSystem(null)}
                onFocus={() => setActiveSystem(sys.id)}
                onBlur={() => setActiveSystem(null)}
              >
                {/* Ambient Top Glow Line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '10%',
                  right: '10%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${sys.accentColor}, transparent)`,
                  opacity: isHovered ? 0.9 : 0.3,
                  transition: 'opacity 0.3s ease'
                }} />

                {/* Card Top Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: isHovered ? sys.accentGlow : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isHovered ? sys.borderColor : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        transition: 'all 0.25s ease'
                      }}>
                        {sys.icon}
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.58rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.12em',
                          color: sys.accentColor,
                          fontWeight: 600
                        }}>
                          {sys.num}
                        </div>
                        <div style={{
                          fontSize: '0.62rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                          fontWeight: 600
                        }}>
                          {sys.badge}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.68rem',
                      color: isHovered ? sys.accentColor : 'var(--muted)',
                      transform: isHovered ? 'scale(1.2)' : 'none',
                      transition: 'transform 0.2s ease, color 0.2s ease'
                    }}>
                      ✦
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                    marginBottom: '0.4rem',
                    transition: 'color 0.2s ease'
                  }}>
                    {sys.title}
                  </h3>

                  <div style={{
                    fontSize: '0.74rem',
                    color: sys.accentColor,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    marginBottom: '0.9rem'
                  }}>
                    {sys.subtitle}
                  </div>

                  <p style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    color: '#CBD5E1',
                    marginBottom: '1.4rem'
                  }}>
                    {sys.tagline}
                  </p>

                  {/* Micro-Stats Badges */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.6rem',
                    marginBottom: '1.4rem',
                    padding: '0.8rem 0.9rem',
                    borderRadius: 14,
                    background: 'rgba(7, 7, 15, 0.55)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {sys.stats.map((st, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '0.54rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '0.15rem' }}>
                          {st.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#FFFFFF', fontFamily: 'monospace' }}>
                          {st.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Supporting Technologies Icon-Labeled Chips */}
                  <div>
                    <div style={{
                      fontSize: '0.58rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      marginBottom: '0.65rem',
                      fontWeight: 600
                    }}>
                      Supporting Technologies
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {sys.techChips.map((chip, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: 12,
                            background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
                            fontSize: '0.68rem',
                            color: isHovered ? 'var(--text)' : 'var(--textd)',
                            transition: 'all 0.2s ease',
                            fontWeight: 500
                          }}
                        >
                          <span style={{ fontSize: '0.72rem' }}>{chip.icon}</span>
                          <span>{chip.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Affordance */}
                <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <a
                    href={sys.affordanceTarget}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.6rem 1rem',
                      borderRadius: 14,
                      background: isHovered ? sys.accentGlow : 'transparent',
                      border: `1px solid ${isHovered ? sys.borderColor : 'transparent'}`,
                      color: isHovered ? '#FFFFFF' : 'var(--muted)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <span>{sys.affordanceText}</span>
                    <span style={{ transform: isHovered ? 'translateX(3px)' : 'none', transition: 'transform 0.2s ease' }}>
                      →
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
