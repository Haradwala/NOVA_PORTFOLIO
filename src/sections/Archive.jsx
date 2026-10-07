/**
 * Archive.jsx — "The Archive Is Always Growing" Section
 *
 * NOVA // ENTER THE SYSTEM — Phase 8
 *
 * A lightweight, interactive knowledge archive grid.
 * Shows 5 categories of actual tools, concepts, and
 * skills explored — no fabricated publications.
 *
 * Clicking a category highlights it and reveals its tags.
 * Registers with SceneContext as 'archive' (uses ArrivalObservatory).
 */

import { useEffect, useRef, useState } from 'react';
import { registerSection } from '../utils/sectionRegistry';
import { useScene } from '../features/scene-engine/SceneContext';

const ARCHIVE_CATEGORIES = [
  {
    id: 'ai-llms',
    label: 'AI & LLMs',
    desc: 'APIs, patterns, and tools explored building AI-powered products.',
    color: 'var(--violet2)',
    glowColor: 'rgba(167,139,250,0.2)',
    borderColor: 'rgba(167,139,250,0.3)',
    items: [
      'Gemini API', 'GPT-4o', 'Claude Sonnet', 'Whisper STT',
      'Web Speech API', 'Function Calling', 'RAG Pipelines',
      'Agentic Loops', 'Context Windows', 'Streaming Completions',
      'Prompt Engineering', 'Tool Use / MCP',
    ],
  },
  {
    id: 'software-engineering',
    label: 'Software Engineering',
    desc: 'Backend systems, architecture patterns, and developer tooling.',
    color: 'var(--teal)',
    glowColor: 'rgba(45,212,191,0.15)',
    borderColor: 'rgba(45,212,191,0.25)',
    items: [
      'Node.js', 'TypeScript', 'Hono', 'tRPC',
      'Supabase', 'MongoDB Atlas', 'REST APIs', 'WebSockets',
      'JWT Auth', 'Razorpay Webhooks', 'Cloudinary', 'Vite',
    ],
  },
  {
    id: '3d-webgl',
    label: '3D & WebGL',
    desc: 'Three.js, shaders, and browser-native 3D graphics.',
    color: '#F472B6',
    glowColor: 'rgba(244,114,182,0.15)',
    borderColor: 'rgba(244,114,182,0.25)',
    items: [
      'Three.js', 'React Three Fiber', '@react-three/drei',
      'GLSL Vertex Shaders', 'GLSL Fragment Shaders',
      'Particle Systems', 'Catmull-Rom Splines',
      'Instanced Mesh', 'Canvas 2D Physics',
      'WebGL Buffers', 'SVG Projection',
    ],
  },
  {
    id: 'design-systems',
    label: 'Design Systems',
    desc: 'Systematic UI engineering: tokens, motion, and component architecture.',
    color: 'var(--rose)',
    glowColor: 'rgba(232,149,109,0.15)',
    borderColor: 'rgba(232,149,109,0.25)',
    items: [
      'Figma', 'Design Tokens', 'Motion Design',
      'Micro-interactions', 'CSS Animations', 'Tailwind CSS',
      'Glassmorphism', 'Dark Mode Systems',
      'UX Research', 'Component Architecture',
    ],
  },
  {
    id: 'current-learning',
    label: 'Currently Learning',
    desc: 'Active exploration — what\'s on the horizon.',
    color: '#4ADE80',
    glowColor: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.2)',
    isActive: true,
    items: [
      'Rust (learning)', 'WASM Interfaces', 'Multi-Agent Systems',
      'Local LLM Orchestration', 'Electron / Tauri',
      'GPU Compute Shaders', 'WebGPU (spec)', 'Neuro-symbolic AI',
    ],
  },
];

function ArchivePill({ label, color }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.62rem',
        letterSpacing: '0.08em',
        padding: '0.28rem 0.7rem',
        borderRadius: '2px',
        border: `1px solid ${hov ? color : `${color}40`}`,
        color: hov ? color : `${color}99`,
        background: hov ? `${color}12` : 'transparent',
        transition: 'all 0.18s ease',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function Archive() {
  const sectionRef = useRef(null);
  const { registerSection: registerSceneSection } = useScene();
  const [activeCategory, setActiveCategory] = useState(null);
  const [sectionVisible, setSectionVisible] = useState(false);

  // Register with section registry
  useEffect(() => {
    const unregister = registerSection('archive', sectionRef);
    return unregister;
  }, []);

  // Register with SceneContext
  useEffect(() => {
    if (sectionRef.current) {
      registerSceneSection('archive', sectionRef.current);
    }
    return () => registerSceneSection('archive', null);
  }, [registerSceneSection]);

  // Section visibility observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleCategoryClick = (id) => {
    setActiveCategory(prev => prev === id ? null : id);
  };

  return (
    <section
      ref={sectionRef}
      data-section="archive"
      id="archive"
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
          <span className="system-tag">THE ARCHIVE</span>
        </div>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4vw, 3.8rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            margin: '0 0 1rem',
            maxWidth: '680px',
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          THE ARCHIVE<br />
          <span style={{ color: 'var(--violet2)' }}>IS ALWAYS GROWING.</span>
        </h2>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.62rem',
          letterSpacing: '0.12em',
          color: 'rgba(160,160,192,0.5)',
          textTransform: 'uppercase',
          opacity: sectionVisible ? 1 : 0,
          transition: 'opacity 0.6s 0.2s ease',
        }}>
          Select a category to explore // tools &amp; concepts encountered in the build
        </p>
      </div>

      {/* Categories */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
      }}>
        {ARCHIVE_CATEGORIES.map((cat, i) => {
          const isActive   = activeCategory === cat.id;
          const isInactive = activeCategory !== null && !isActive;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                padding: 'clamp(1.2rem, 2.5vh, 1.8rem) 1.6rem',
                border: '1px solid transparent',
                borderColor: isActive ? cat.borderColor : 'rgba(139,92,246,0.08)',
                borderRadius: '3px',
                background: isActive ? cat.glowColor : 'rgba(7,7,15,0.3)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: isActive ? 'scale(1.005)' : 'scale(1)',
                opacity: sectionVisible ? (isInactive ? 0.45 : 1) : 0,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              {/* Category header row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Category number */}
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    color: `${cat.color}60`,
                    letterSpacing: '0.12em',
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Label + desc */}
                  <div>
                    <div style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
                      color: isActive ? cat.color : 'var(--text)',
                      transition: 'color 0.2s ease',
                      lineHeight: 1.2,
                    }}>
                      {cat.label}
                      {cat.isActive && (
                        <span style={{
                          marginLeft: '0.6rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.48rem',
                          letterSpacing: '0.15em',
                          color: cat.color,
                          border: `1px solid ${cat.color}50`,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '2px',
                          verticalAlign: 'middle',
                        }}>
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    {!isActive && (
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.72rem',
                        color: 'rgba(160,160,192,0.5)',
                        marginTop: '0.2rem',
                        lineHeight: 1.4,
                      }}>
                        {cat.desc}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item count + expand indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.55rem',
                    color: `${cat.color}60`,
                    letterSpacing: '0.1em',
                  }}>
                    {cat.items.length} items
                  </span>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: `1px solid ${isActive ? cat.borderColor : 'rgba(139,92,246,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? cat.color : 'rgba(139,92,246,0.4)',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'rotate(45deg)' : 'none',
                  }}>
                    +
                  </div>
                </div>
              </div>

              {/* Expanded tags */}
              {isActive && (
                <div style={{
                  marginTop: '1.2rem',
                  paddingTop: '1.2rem',
                  borderTop: `1px solid ${cat.borderColor}`,
                }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.8rem',
                    color: 'rgba(160,160,192,0.7)',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                  }}>
                    {cat.desc}
                  </p>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    {cat.items.map((item) => (
                      <ArchivePill key={item} label={item} color={cat.color} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: 'clamp(2rem, 4vh, 3.5rem)',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(139,92,246,0.08)',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.55rem', letterSpacing: '0.16em',
          color: 'rgba(139,92,246,0.3)', textTransform: 'uppercase',
        }}>
          // This archive reflects genuine exploration, not a résumé. It grows with every build.
        </span>
      </div>
    </section>
  );
}
