/**
 * About.jsx — "Constellation Timeline" Identity Section
 *
 * Implements the chronological constellation journey:
 *   1. Identity Overview: Bio, Title, verified stats with custom SVG line icons.
 *   2. Constellation Milestone Nodes: Chronological entries from experience.json
 *      (American Education International Sept 2023-May 2024 → GTU Start ~May 2024 →
 *       Tech Smart Coordinator Oct 2024 → AEI Honor Society President 2024 →
 *       Edu-Champs 3.0 Instructor 2024 → GTU Expected Graduation May 2028).
 *   3. Camera Travel: As user scrolls through, camera moves along 3D Catmull-Rom spline.
 *   4. Zero emojis: all replaced with bespoke line-icon SVGs.
 *   5. Subtle celestial map indicator replacing the generic numbered pill bar.
 */

import { useEffect, useRef, useState } from 'react';
import { useScene } from '../features/scene-engine/SceneContext';
import { registerSection, highlightSection } from '../utils/sectionRegistry';
import {
  GraduationCapIcon,
  TrophyIcon,
  OrbitIcon,
  BrainIcon,
  LightningIcon,
  SparklesIcon,
  ScrollIcon,
  TerminalIcon,
  BoxIcon,
  ShoppingBagIcon,
  GlobeIcon,
  Cube3dIcon,
} from '../components/LineIcons';

export default function About() {
  const sectionRef = useRef(null);
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);

  // 1. Register with Scene Engine for 3D Camera / Canvas tracking
  const { registerSection: registerSceneSection, sceneProgress } = useScene();
  useEffect(() => {
    if (sectionRef.current) {
      registerSceneSection('identity', sectionRef.current);
    }
    return () => registerSceneSection('identity', null);
  }, [registerSceneSection]);

  // Track active node based on continuous sceneProgress
  const progress = sceneProgress['identity'] ?? 0;
  useEffect(() => {
    if (progress < 0.14) {
      setActiveNodeIdx(0);
    } else {
      const norm = (progress - 0.14) / 0.86;
      const idx = Math.min(5, Math.floor(norm * 6));
      setActiveNodeIdx(Math.max(0, idx));
    }
  }, [progress]);

  // 2. Register with DOM Section Registry for backward-compatible scroll & highlight
  useEffect(() => {
    const unregisterIdentity = registerSection('identity', sectionRef);

    if (window.__pendingScroll === 'identity') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.__pendingHighlight === 'identity') {
          window.__pendingHighlight = null;
          highlightSection('identity');
        }
      }, 350);
    }

    return () => {
      unregisterIdentity();
    };
  }, []);

  // Reveal observer for scroll animations
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

  // Chronological timeline data matching experience.json
  const timeline = [
    {
      id: 'aei-diploma',
      index: '01',
      shortLabel: 'AEI Diploma',
      period: 'Sept 2023 — May 2024',
      role: 'American High School Dual Diploma (Rank 1)',
      institution: 'American Education International',
      note: 'Graduated #1 in class ranking across dual diploma academic curriculum with highest academic honors.',
      badge: 'Honor Graduate · Rank 1',
      category: 'Education & Honors',
      accentColor: '#A78BFA',
      glowColor: 'rgba(167,139,250,0.22)',
      isFuture: false,
    },
    {
      id: 'gtu-start',
      index: '02',
      shortLabel: 'GTU CS Start',
      period: '~May 2024 (Start)',
      role: 'B.E. in Computer Science',
      institution: 'Gujarat Technological University (GTU)',
      note: 'Approximate start date. Core focus: applied algorithms, distributed architectures & AI systems.',
      badge: 'Academic Major',
      category: 'Degree Program',
      accentColor: '#8B5CF6',
      glowColor: 'rgba(139,92,246,0.22)',
      isFuture: false,
    },
    {
      id: 'techsmart-aei',
      index: '03',
      shortLabel: 'Tech Smart',
      period: 'Oct 2024 (~1.5 yrs · Former)',
      role: 'Student Coordinator',
      institution: 'Tech Smart / American Education International',
      note: 'Coordinated academic initiatives & student developer support (lasted approx. 1.5 years — no longer current; exact end date unconfirmed).',
      badge: 'Former Role',
      category: 'Technical Coordination',
      accentColor: '#2DD4BF',
      glowColor: 'rgba(45,212,191,0.22)',
      isFuture: false,
    },
    {
      id: 'aei-honors',
      index: '04',
      shortLabel: 'Honor Society',
      period: '2024 (Term Completed)',
      role: 'President & Student Mentor',
      institution: 'AEI International Honor Society',
      note: 'Led chapter initiatives and mentored students in academic excellence, computer science, and career development.',
      badge: 'Leadership',
      category: 'Mentorship',
      accentColor: '#E8956D',
      glowColor: 'rgba(232,149,109,0.22)',
      isFuture: false,
    },
    {
      id: 'educhamps',
      index: '05',
      shortLabel: 'Edu-Champs',
      period: '2024',
      role: 'Online Web Dev Instructor & Project Manager',
      institution: 'Edu-Champs 3.0',
      note: 'Instructed intensive 1-month curriculum covering HTML, CSS, and modern JavaScript fundamentals.',
      badge: 'Bootcamp Instruction',
      category: 'Instruction',
      accentColor: '#F2B49A',
      glowColor: 'rgba(242,180,154,0.22)',
      isFuture: false,
    },
    {
      id: 'gtu-grad',
      index: '06',
      shortLabel: 'GTU Grad 2028',
      period: 'May 2028 (Expected)',
      role: 'B.E. in Computer Science (Expected Graduation)',
      institution: 'Gujarat Technological University (GTU)',
      note: 'Undergraduate student in Computer Science at GTU with expected graduation of May 2028. Future milestone in distributed software and AI.',
      badge: 'Degree Candidate · Upcoming',
      category: 'Upcoming Milestone',
      accentColor: '#C4B5FD',
      glowColor: 'rgba(196,181,253,0.22)',
      isFuture: true,
    },
  ];

  // Verified honest metrics from confirmed data with custom SVG line icons
  const stats = [
    {
      val: 'GTU',
      lbl: "CS '28",
      detail: 'Degree Candidate',
      border: 'rgba(232,149,109,0.22)',
      bg: 'rgba(232,149,109,0.06)',
      glow: 'rgba(232,149,109,0.15)',
      icon: <GraduationCapIcon size={20} color="#E8956D" />,
      subIcons: [
        <GraduationCapIcon key="1" size={13} color="#E8956D" />,
        <LightningIcon key="2" size={13} color="#F2B49A" />,
        <TerminalIcon key="3" size={13} color="#E8956D" />
      ],
    },
    {
      val: '#1',
      lbl: 'AEI Rank',
      detail: 'Dual Diploma Valedictorian',
      border: 'rgba(139,92,246,0.25)',
      bg: 'rgba(139,92,246,0.07)',
      glow: 'rgba(139,92,246,0.18)',
      icon: <TrophyIcon size={20} color="#C4B5FD" />,
      subIcons: [
        <TrophyIcon key="1" size={13} color="#C4B5FD" />,
        <SparklesIcon key="2" size={13} color="#A78BFA" />,
        <ScrollIcon key="3" size={13} color="#C4B5FD" />
      ],
    },
    {
      val: '4',
      lbl: 'Core Projects',
      detail: 'NOVA · FORGE · Commerce · Desktop',
      border: 'rgba(45,212,191,0.22)',
      bg: 'rgba(45,212,191,0.06)',
      glow: 'rgba(45,212,191,0.16)',
      icon: <OrbitIcon size={20} color="#2DD4BF" />,
      subIcons: [
        <OrbitIcon key="1" size={13} color="#2DD4BF" />,
        <BoxIcon key="2" size={13} color="#5EEAD4" />,
        <ShoppingBagIcon key="3" size={13} color="#2DD4BF" />
      ],
    },
    {
      val: 'Full',
      lbl: 'Stack & AI',
      detail: 'Local-First & WebGL Systems',
      border: 'rgba(242,180,154,0.22)',
      bg: 'rgba(242,180,154,0.06)',
      glow: 'rgba(242,180,154,0.15)',
      icon: <BrainIcon size={20} color="#F2B49A" />,
      subIcons: [
        <BrainIcon key="1" size={13} color="#F2B49A" />,
        <GlobeIcon key="2" size={13} color="#E8956D" />,
        <Cube3dIcon key="3" size={13} color="#F2B49A" />
      ],
    },
  ];

  const scrollToMilestone = (idx) => {
    setActiveNodeIdx(idx);
    const targetEl = document.getElementById(`constellation-node-${idx}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="identity"
      data-section="identity"
      ref={sectionRef}
      className="identity-constellation-section"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: '8rem 3.5rem 10rem',
        overflow: 'hidden',
        background: 'transparent', // Clear WebGL background visibility
      }}
    >
      <style>{`
        .identity-constellation-section {
          padding-top: calc(8rem + env(safe-area-inset-top)) !important;
          padding-bottom: calc(10rem + env(safe-area-inset-bottom)) !important;
          padding-left: calc(3.5rem + env(safe-area-inset-left)) !important;
          padding-right: calc(3.5rem + env(safe-area-inset-right)) !important;
        }

        .constellation-intro-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 4.5rem;
          align-items: start;
          margin-bottom: 6rem;
        }

        .constellation-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.8rem, 5.2vw, 5.2rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin-bottom: 1.8rem;
        }

        .stat-badge-card {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .stat-badge-card:hover {
          transform: translateY(-3px);
        }

        .constellation-node-card {
          border-radius: 20px;
          background: rgba(12, 10, 30, 0.42);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.16);
          padding: 1.8rem 2rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .constellation-node-card.active {
          border-color: rgba(167, 139, 250, 0.5);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 35px rgba(139,92,246,0.22);
          transform: scale(1.01);
          background: rgba(16, 12, 40, 0.65);
        }

        .constellation-node-card.future {
          border-style: dashed;
          background: rgba(10, 8, 25, 0.38);
        }

        .constellation-timeline-flow {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .constellation-chart-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          position: relative;
          max-width: 580px;
          margin: 0 auto 3.5rem;
          padding: 0.6rem 1rem;
        }

        .constellation-chart-line {
          position: absolute;
          left: 3rem;
          right: 3rem;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, rgba(167,139,250,0.25), rgba(45,212,191,0.35), rgba(232,149,109,0.35), rgba(196,181,253,0.25));
          z-index: 0;
        }

        .constellation-chart-dot-btn {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.4rem 0.65rem;
          outline: none;
          transition: transform 0.2s ease;
        }

        .constellation-chart-dot-btn:hover {
          transform: translateY(-2px);
        }

        .constellation-dot-circle {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 0.25s ease;
        }

        @media (max-width: 960px) {
          .constellation-intro-grid {
            grid-template-columns: 1fr !important;
            gap: 3.5rem !important;
          }
          .identity-constellation-section {
            padding: 5rem 1.5rem 6rem !important;
          }
          .constellation-chart-indicator {
            overflow-x: auto;
            justify-content: flex-start;
          }
        }
      `}</style>

      {/* Atmospheric transparent vignette — keeps text readable while letting stars & glows shine through */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 95% 85% at 50% 30%, rgba(7,7,15,0.12) 0%, rgba(7,7,15,0.45) 100%)',
        }}
      />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Top Horizon Indicator Bar ── */}
        <div className="reveal" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(139,92,246,0.18)',
          paddingBottom: '1rem',
          marginBottom: '4.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#E8956D',
              boxShadow: '0 0 10px #E8956D',
              display: 'inline-block'
            }} />
            <span style={{
              fontSize: '0.68rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--rose)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700
            }}>
              Identity // Constellation Timeline
            </span>
          </div>

          <div style={{
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            fontFamily: 'monospace'
          }}>
            AHMEDABAD, IN · GTU '28
          </div>
        </div>

        {/* ── Stage 1: Narrative Bio Intro & Verified Stats ── */}
        <div className="constellation-intro-grid">
          {/* Left: Biography Narrative */}
          <div>
            <div className="reveal">
              <div className="constellation-title">
                <span style={{ color: 'var(--text)', display: 'block' }}>Shadab</span>
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F2B49A 50%, #C4B5FD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginTop: '0.1rem'
                }}>
                  Haradwala
                </span>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(1.2rem, 2.4vw, 2.2rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  marginTop: '0.8rem',
                  background: 'linear-gradient(110deg, var(--rose) 0%, var(--violet2) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  AI Developer &amp; Designer
                </span>
              </div>

              {/* Bio Narrative */}
              <div style={{
                position: 'relative',
                paddingLeft: '1.5rem',
                borderLeft: '2px solid rgba(139,92,246,0.3)',
                marginBottom: '2.5rem'
              }}>
                <p style={{
                  fontSize: '1.02rem',
                  lineHeight: 1.85,
                  color: '#E2E8F0',
                  marginBottom: '1.1rem',
                  fontWeight: 400
                }}>
                  Independent builder based in <span style={{ color: '#F2B49A', fontWeight: 600 }}>Ahmedabad, India</span>, and a Computer Science student at Gujarat Technological University (GTU, expected graduation May 2028).
                </p>
                <p style={{
                  fontSize: '0.96rem',
                  lineHeight: 1.8,
                  color: '#CBD5E1',
                  marginBottom: '1.4rem'
                }}>
                  Focused on full-stack web applications, AI integrations, and real-time 3D environments — currently engineering <span style={{ color: '#FFFFFF', fontWeight: 600 }}>FORGE</span> (a local-first AI software engineering platform) and this living <span style={{ color: '#FFFFFF', fontWeight: 600 }}>NOVA</span> operating environment.
                </p>
                <div style={{
                  fontSize: '0.82rem',
                  color: '#F2B49A',
                  fontStyle: 'italic',
                  letterSpacing: '0.02em'
                }}>
                  "Intelligent visual systems where clean architectural design and robust engineering converge."
                </div>
              </div>
            </div>
          </div>

          {/* Right: Verified Stats Cards (Styled with SVG Line Icons) */}
          <div className="reveal">
            <div style={{
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <span style={{ width: 14, height: 1, background: 'var(--muted)' }} />
              Verified Milestones &amp; Metrics
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
            }}>
              {stats.map((s) => (
                <div
                  key={s.lbl}
                  className="stat-badge-card"
                  style={{
                    borderRadius: 16,
                    padding: '1.1rem 1rem',
                    border: `1px solid ${s.border}`,
                    background: s.bg,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    boxShadow: `0 8px 24px ${s.glow}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.6rem',
                    opacity: 0.9
                  }}>
                    {s.subIcons}
                  </div>

                  <div style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--text) 0%, var(--rose) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    marginBottom: '0.35rem'
                  }}>
                    {s.val}
                  </div>

                  <div style={{
                    fontSize: '0.66rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#F8FAFC',
                    fontWeight: 700,
                    marginBottom: '0.2rem'
                  }}>
                    {s.lbl}
                  </div>

                  <div style={{
                    fontSize: '0.58rem',
                    color: '#94A3B8',
                    lineHeight: 1.35
                  }}>
                    {s.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Affordance Navigation */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <a
                href="#skills"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.3rem',
                  borderRadius: 50,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  color: 'var(--textd)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
              >
                Explore Capabilities ↓
              </a>
              <a
                href="#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.3rem',
                  borderRadius: 50,
                  background: 'linear-gradient(135deg, var(--rose) 0%, var(--violet) 100%)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontWeight: 600,
                  boxShadow: '0 6px 20px rgba(232,149,109,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                Initiate Inquiry <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Stage 2: Constellation Flight Heading & Subtle Celestial Indicator ── */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--violet2)',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            marginBottom: '0.6rem'
          }}>
            <SparklesIcon size={14} color="#A78BFA" />
            3D Constellation Trajectory
          </div>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 0.8rem 0',
            letterSpacing: '-0.02em'
          }}>
            Chronological Journey Through 3D Space
          </h3>
          <p style={{
            fontSize: '0.86rem',
            color: '#94A3B8',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            The camera travels through the constellation as you scroll. Explore the milestone stars below.
          </p>
        </div>

        {/* Subtle Constellation Star Chart Map Indicator */}
        <div className="constellation-chart-indicator reveal" role="navigation" aria-label="Constellation Star Map">
          <div className="constellation-chart-line" />
          {timeline.map((item, idx) => {
            const isActive = activeNodeIdx === idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToMilestone(idx)}
                aria-label={`Go to ${item.shortLabel}`}
                className="constellation-chart-dot-btn"
              >
                <span
                  className="constellation-dot-circle"
                  style={{
                    background: isActive ? item.accentColor : 'rgba(255,255,255,0.25)',
                    boxShadow: isActive ? `0 0 12px ${item.accentColor}` : 'none',
                    transform: isActive ? 'scale(1.4)' : 'scale(1)',
                    border: item.isFuture ? '1px dashed #C4B5FD' : 'none'
                  }}
                />
                <span style={{
                  fontSize: '0.58rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
                  color: isActive ? item.accentColor : 'var(--muted)',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap'
                }}>
                  {item.index}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Stage 3: Constellation Milestones Flow ── */}
        <div className="constellation-timeline-flow">
          {timeline.map((item, idx) => {
            const isActive = activeNodeIdx === idx;

            return (
              <div
                key={item.id}
                id={`constellation-node-${idx}`}
                className={`constellation-node-card reveal ${isActive ? 'active' : ''} ${item.isFuture ? 'future' : ''}`}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: item.accentColor,
                }}
              >
                {/* Milestone Node Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: item.accentColor,
                      letterSpacing: '0.1em'
                    }}>
                      NODE // {item.index}
                    </span>
                    <span style={{
                      fontSize: '0.58rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.18rem 0.55rem',
                      borderRadius: 20,
                      background: item.glowColor,
                      border: `1px solid ${item.accentColor}`,
                      color: '#FFFFFF',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.66rem',
                    letterSpacing: '0.08em',
                    color: item.isFuture ? '#C4B5FD' : 'var(--rose)',
                    fontFamily: 'monospace',
                    fontWeight: 600
                  }}>
                    {item.period}
                  </span>
                </div>

                {/* Role Title */}
                <h4 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 0.3rem 0',
                  lineHeight: 1.25
                }}>
                  {item.role}
                </h4>

                {/* Institution */}
                <div style={{
                  fontSize: '0.85rem',
                  color: item.accentColor,
                  fontWeight: 600,
                  marginBottom: '0.85rem'
                }}>
                  {item.institution}
                </div>

                {/* Detailed Summary Note */}
                <p style={{
                  fontSize: '0.82rem',
                  lineHeight: 1.65,
                  color: '#CBD5E1',
                  margin: 0
                }}>
                  {item.note}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
