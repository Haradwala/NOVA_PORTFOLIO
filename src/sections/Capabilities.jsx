/**
 * Capabilities.jsx — "Your Small World" Systems Section
 *
 * Implements the 3 technical systems matching the 3D planetary system:
 *   1. AI & Cognitive Systems (Inner Neural Moon)
 *   2. Full-Stack Engineering (Middle Modular Moon)
 *   3. Interactive 3D & WebGL (Outer Crystalline Moon)
 *
 * Connected via two-way event synchronization to CapabilitiesLab.jsx:
 *   Hovering or focusing a card highlights that moon and pulls it forward in 3D.
 *   Zero native emojis: all replaced with bespoke accessible line-icon SVGs.
 */

import { useState, useEffect, useRef } from 'react';
import { useScene } from '../features/scene-engine/SceneContext';
import { registerSection, highlightSection } from '../utils/sectionRegistry';
import {
  BrainIcon,
  GearIcon,
  Cube3dIcon,
  LightningIcon,
  BotIcon,
  CodeBracketIcon,
  MessageSquareIcon,
  RadioTowerIcon,
  AtomIcon,
  ServerIcon,
  RocketIcon,
  DatabaseIcon,
  LeafIcon,
  RefreshCwIcon,
  PaletteIcon,
  RulerIcon,
  SparklesIcon,
  OrbitIcon,
  MusicIcon,
  VideoCameraIcon,
} from '../components/LineIcons';

export default function Capabilities() {
  const sectionRef = useRef(null);
  const [activeSystem, setActiveSystem] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('active') || p.get('system') || null;
    }
    return null;
  });

  // Notify 3D Planetary Environment of card focus/hover
  const notify3DFocus = (systemId) => {
    setActiveSystem(systemId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('capabilities-system-focus', {
        detail: { systemId }
      }));
    }
  };

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

  // 3 distinct technical systems matching the 3D Planetary Environment
  const systems = [
    {
      id: 'ai-cognitive',
      num: 'SYS-01',
      title: 'AI & Cognitive Systems',
      subtitle: 'Neural Orchestration & Autonomous Agent Pipelines',
      tagline: 'Local-first & cloud LLM pipelines with real-time audio and function execution.',
      icon: <BrainIcon size={22} color="#A78BFA" />,
      accentColor: '#8B5CF6',
      accentGlow: 'rgba(139, 92, 246, 0.25)',
      borderColor: 'rgba(139, 92, 246, 0.35)',
      badge: 'Agentic Core',
      stats: [
        { label: 'Latency', val: '< 600ms Groq / Edge' },
        { label: 'Architecture', val: 'Local-First + Cloud' },
      ],
      techChips: [
        { name: 'LLM Pipelines', icon: <LightningIcon size={12} color="#A78BFA" /> },
        { name: 'Agentic Systems', icon: <BotIcon size={12} color="#A78BFA" /> },
        { name: 'Python & Automation', icon: <CodeBracketIcon size={12} color="#A78BFA" /> },
        { name: 'Prompt Engineering', icon: <MessageSquareIcon size={12} color="#A78BFA" /> },
        { name: 'Hono / tRPC AI Routes', icon: <RadioTowerIcon size={12} color="#A78BFA" /> },
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
      icon: <GearIcon size={22} color="#5EEAD4" />,
      accentColor: '#2DD4BF',
      accentGlow: 'rgba(45, 212, 191, 0.25)',
      borderColor: 'rgba(45, 212, 191, 0.35)',
      badge: 'Type-Safe Bus',
      stats: [
        { label: 'Type Safety', val: 'End-to-End tRPC' },
        { label: 'Deployments', val: 'Vercel / Edge Functions' },
      ],
      techChips: [
        { name: 'React / Vite', icon: <AtomIcon size={12} color="#2DD4BF" /> },
        { name: 'Node.js', icon: <ServerIcon size={12} color="#2DD4BF" /> },
        { name: 'Hono / tRPC', icon: <RocketIcon size={12} color="#2DD4BF" /> },
        { name: 'Supabase', icon: <DatabaseIcon size={12} color="#2DD4BF" /> },
        { name: 'MongoDB Atlas', icon: <LeafIcon size={12} color="#2DD4BF" /> },
        { name: 'REST & WebSockets', icon: <RefreshCwIcon size={12} color="#2DD4BF" /> },
        { name: 'Tailwind CSS', icon: <PaletteIcon size={12} color="#2DD4BF" /> },
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
      icon: <Cube3dIcon size={22} color="#F2B49A" />,
      accentColor: '#E8956D',
      accentGlow: 'rgba(232, 149, 109, 0.25)',
      borderColor: 'rgba(232, 149, 109, 0.35)',
      badge: '60 FPS Viewport',
      stats: [
        { label: 'Renderer', val: 'R3F / Three.js r180' },
        { label: 'Performance', val: 'Sub-millisecond Frames' },
      ],
      techChips: [
        { name: 'Three.js / R3F', icon: <RulerIcon size={12} color="#E8956D" /> },
        { name: 'WebGL Shaders (GLSL)', icon: <SparklesIcon size={12} color="#E8956D" /> },
        { name: 'Canvas 2D Physics', icon: <OrbitIcon size={12} color="#E8956D" /> },
        { name: 'Audio Reactive Visuals', icon: <MusicIcon size={12} color="#E8956D" /> },
        { name: 'Viewport Projection', icon: <VideoCameraIcon size={12} color="#E8956D" /> },
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
        background: 'transparent', // Let 3D Planetary Environment show through
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

      {/* Atmospheric radial gradient */}
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
              Capabilities // Your Small World
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
                Three specialized technical tracks built with verified modern toolchains. Hover or focus any system to interact with its orbiting body.
              </p>
            </div>

            <div style={{
              fontSize: '0.62rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontFamily: 'monospace'
            }}>
              PLANETARY SYSTEM · 3 ORBITING BODIES
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
                onMouseEnter={() => notify3DFocus(sys.id)}
                onMouseLeave={() => notify3DFocus(null)}
                onFocus={() => notify3DFocus(sys.id)}
                onBlur={() => notify3DFocus(null)}
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
                      display: 'flex',
                      alignItems: 'center',
                      transform: isHovered ? 'scale(1.2)' : 'none',
                      transition: 'transform 0.2s ease, color 0.2s ease'
                    }}>
                      <SparklesIcon size={14} color={isHovered ? sys.accentColor : 'var(--muted)'} />
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
                            gap: '0.4rem',
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
                          <span>{chip.icon}</span>
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
