import { useEffect, useRef } from 'react';
import { useScene } from '../features/scene-engine/SceneContext';
import { registerSection, highlightSection } from '../utils/sectionRegistry';

export default function About() {
  const sectionRef = useRef(null);

  // 1. Register with Scene Engine for 3D Camera / Canvas tracking
  const { registerSection: registerSceneSection } = useScene();
  useEffect(() => {
    if (sectionRef.current) {
      registerSceneSection('identity', sectionRef.current);
    }
    return () => registerSceneSection('identity', null);
  }, [registerSceneSection]);

  // 2. Register with DOM Section Registry for backward-compatible scroll & highlight
  useEffect(() => {
    const unregisterAbout = registerSection('about', sectionRef);

    if (window.__pendingScroll === 'about') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.__pendingHighlight === 'about') {
          window.__pendingHighlight = null;
          highlightSection('about');
        }
      }, 350);
    }

    return () => {
      unregisterAbout();
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

  // Confirmed chronological timeline data
  const timeline = [
    {
      period: '~May 2024 — May 2028 (Expected)',
      role: 'B.E. in Computer Science',
      institution: 'Gujarat Technological University (GTU)',
      note: 'Approximate start date. Core focus: applied algorithms, distributed architectures & AI systems.',
      badge: 'Academic Major',
      badgeColor: 'rgba(232,149,109,0.18)',
      badgeBorder: 'rgba(232,149,109,0.35)',
      badgeText: '#F2B49A'
    },
    {
      period: 'Oct 2024 (Lasted ~1.5 yrs · Former)',
      role: 'Student Coordinator',
      institution: 'Tech Smart / American Education International',
      note: 'Coordinated academic initiatives & student developer support (no longer current; exact end date unconfirmed).',
      badge: 'Former Role',
      badgeColor: 'rgba(139,92,246,0.15)',
      badgeBorder: 'rgba(139,92,246,0.3)',
      badgeText: '#C4B5FD'
    },
    {
      period: 'Sept 2023 — May 2024',
      role: 'American High School Dual Diploma · Rank 1',
      institution: 'American Education International',
      note: 'Graduated #1 in class ranking across dual diploma academic curriculum.',
      badge: 'Honor Graduate',
      badgeColor: 'rgba(45,212,191,0.15)',
      badgeBorder: 'rgba(45,212,191,0.3)',
      badgeText: '#5EEAD4'
    },
    {
      period: '2024 (Term Completed)',
      role: 'International Honor Society President & Mentor',
      institution: 'AEI International Honor Society',
      note: 'Led chapter initiatives and mentored students in technical disciplines and academic growth.',
      badge: 'Leadership',
      badgeColor: 'rgba(139,92,246,0.12)',
      badgeBorder: 'rgba(139,92,246,0.25)',
      badgeText: '#A78BFA'
    },
    {
      period: '2024',
      role: 'Online Web Dev Instructor & Project Manager',
      institution: 'Edu-Champs 3.0',
      note: 'Instructed intensive 1-month curriculum covering HTML, CSS, and modern JavaScript fundamentals.',
      badge: 'Bootcamp Instruction',
      badgeColor: 'rgba(232,149,109,0.12)',
      badgeBorder: 'rgba(232,149,109,0.25)',
      badgeText: '#E8956D'
    }
  ];

  // Stacked-icon stat badges (honest metrics from confirmed data)
  const stats = [
    {
      val: 'GTU',
      lbl: "CS '28",
      detail: 'Degree Candidate',
      border: 'rgba(232,149,109,0.22)',
      bg: 'rgba(232,149,109,0.06)',
      glow: 'rgba(232,149,109,0.15)',
      icons: ['🎓', '⚡', '💻'],
    },
    {
      val: '#1',
      lbl: 'AEI Rank',
      detail: 'Dual Diploma Valedictorian',
      border: 'rgba(139,92,246,0.25)',
      bg: 'rgba(139,92,246,0.07)',
      glow: 'rgba(139,92,246,0.18)',
      icons: ['🏆', '✨', '📜'],
    },
    {
      val: '4',
      lbl: 'Core Projects',
      detail: 'NOVA · FORGE · Commerce · Desktop',
      border: 'rgba(45,212,191,0.22)',
      bg: 'rgba(45,212,191,0.06)',
      glow: 'rgba(45,212,191,0.16)',
      icons: ['🌌', '⚙️', '🛍️'],
    },
    {
      val: 'Full',
      lbl: 'Stack & AI',
      detail: 'Local-First & WebGL Systems',
      border: 'rgba(242,180,154,0.22)',
      bg: 'rgba(242,180,154,0.06)',
      glow: 'rgba(242,180,154,0.15)',
      icons: ['🧠', '🌐', '🔮'],
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="identity-chamber-section"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: '8rem 3.5rem',
        overflow: 'hidden',
        background: 'transparent', // Let 3D architectural chamber show through
      }}
    >
      <style>{`
        .identity-chamber-section {
          padding-top: calc(8rem + env(safe-area-inset-top)) !important;
          padding-bottom: calc(8rem + env(safe-area-inset-bottom)) !important;
          padding-left: calc(3.5rem + env(safe-area-inset-left)) !important;
          padding-right: calc(3.5rem + env(safe-area-inset-right)) !important;
        }

        .identity-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 4.5rem;
          align-items: start;
        }

        .architectural-title {
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

        .timeline-item {
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .timeline-item:hover {
          border-left-color: var(--rose) !important;
          background: rgba(139,92,246,0.03);
        }

        @media (max-width: 960px) {
          .identity-grid {
            grid-template-columns: 1fr !important;
            gap: 3.5rem !important;
          }
          .identity-chamber-section {
            padding: 5rem 1.5rem !important;
          }
        }
      `}</style>

      {/* Subtle architectural atmosphere tint (keeps text crisp over 3D columns) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 80% at 50% 25%, rgba(7,7,15,0.45) 0%, rgba(7,7,15,0.75) 100%)',
        }}
      />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Top Architectural Horizon Bar ── */}
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
              Identity Chamber // 01
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

        {/* ── Main Architectural Chamber Split ── */}
        <div className="identity-grid">

          {/* Left Column: Environmental Typography & Narrative */}
          <div>
            <div className="reveal">
              <div className="architectural-title">
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

              {/* Bio Narrative Printed into Chamber */}
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

            {/* Stacked-Icon Stat Badges */}
            <div className="reveal" style={{ marginTop: '3rem' }}>
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
                    {/* Stacked-icon glyph cluster */}
                    <div style={{
                      display: 'flex',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      marginBottom: '0.6rem',
                      opacity: 0.85
                    }}>
                      {s.icons.map((ic, i) => (
                        <span key={i} title={s.detail}>{ic}</span>
                      ))}
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
            </div>
          </div>

          {/* Right Column: Confirmed Experience Chronology */}
          <div className="reveal">
            <div style={{
              background: 'rgba(14, 10, 35, 0.45)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(139,92,246,0.18)',
              borderRadius: 22,
              padding: '2rem 2.2rem',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.8rem',
                borderBottom: '1px solid rgba(139,92,246,0.14)',
                paddingBottom: '0.85rem'
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--violet2)',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚡</span> Education &amp; Leadership Chronology
                </div>
                <span style={{ fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                  VERIFIED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="timeline-item"
                    style={{
                      borderLeft: '2px solid rgba(139,92,246,0.25)',
                      paddingLeft: '1.1rem',
                      paddingTop: '0.2rem',
                      paddingBottom: '0.2rem',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.1em',
                        color: 'var(--rose)',
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}>
                        {item.period}
                      </span>
                      <span style={{
                        fontSize: '0.55rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 20,
                        background: item.badgeColor,
                        border: `1px solid ${item.badgeBorder}`,
                        color: item.badgeText,
                        fontWeight: 600
                      }}>
                        {item.badge}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      marginBottom: '0.2rem'
                    }}>
                      {item.role}
                    </div>

                    <div style={{
                      fontSize: '0.78rem',
                      color: '#C4B5FD',
                      fontWeight: 600,
                      marginBottom: '0.35rem'
                    }}>
                      {item.institution}
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      color: '#94A3B8',
                      lineHeight: 1.55
                    }}>
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Affordance */}
              <div style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(139,92,246,0.12)', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <a
                  href="#contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.4rem',
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
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(232,149,109,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,149,109,0.3)'; }}
                >
                  Initiate Inquiry <span>→</span>
                </a>
                <a
                  href="#skills"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.2rem',
                    borderRadius: 50,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'var(--textd)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                >
                  Explore Capabilities ↓
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
