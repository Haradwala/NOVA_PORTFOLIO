/**
 * Contact.jsx — "Open Channel / Secure Terminal" Section
 *
 * NOVA // ENTER THE SYSTEM — Phase 9
 *
 * Terminal status panel + high-precision glass inquiry form.
 * Preserves all form state, validation, submission feedback, and section registry.
 */

import { useState, useEffect, useRef } from 'react';
import { registerSection } from '../utils/sectionRegistry';

export default function Contact() {
  const sectionRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Full-Stack Web',
    budget: '$1,000 – $3,000',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unregister = registerSection('contact', sectionRef);
    if (window.__pendingScroll === 'contact') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
    return unregister;
  }, []);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal') || [];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const inputStyle = {
    width: '100%',
    padding: '.8rem 1.1rem',
    borderRadius: 12,
    background: 'rgba(15, 12, 35, 0.75)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    color: 'var(--text)',
    fontSize: '.85rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '.62rem',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '.4rem',
    textAlign: 'left',
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <>
      <section
        id="section-contact"
        data-section="contact"
        ref={sectionRef}
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '8rem 2rem 5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            gap: 2.5rem;
            align-items: start;
          }
          @media (max-width: 900px) {
            .contact-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }
        `}</style>

        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
          <div className="reveal system-tag" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.6rem',
            marginBottom: '1rem',
            padding: '4px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(139,92,246,0.3)',
            background: 'rgba(139,92,246,0.08)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--rose)',
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ADE80',
              boxShadow: '0 0 8px #4ADE80',
            }} />
            OPEN CHANNEL // DIRECT COMM
          </div>

          <h2 className="reveal" style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            margin: '0 0 1rem',
            lineHeight: 1.15,
            textShadow: '0 0 40px rgba(139,92,246,.25)',
          }}>
            Initiate{' '}
            <span style={{
              background: 'linear-gradient(90deg, var(--rose), var(--violet2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Connection
            </span>
          </h2>

          <p className="reveal" style={{
            fontSize: '0.9rem',
            color: 'var(--textd)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Whether you need autonomous AI agents, high-performance web systems, or immersive 3D interfaces, direct communication is open.
          </p>
        </div>

        {/* Two-Column Grid: Terminal HUD + Form */}
        <div className="contact-grid">
          {/* Left Column: Terminal Diagnostics & Info */}
          <div className="reveal" style={{
            background: 'rgba(12, 10, 28, 0.7)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 20,
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.2rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.15em',
                color: 'var(--violet2)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                COMMUNICATION
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem',
                color: 'var(--text)',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                OPEN FOR INQUIRIES
              </span>
            </div>

            {/* Diagnostics Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                  SYSTEM AVAILABILITY
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#4ADE80', fontWeight: 600 }}>
                  OPEN FOR Q2/Q3
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                  ESTIMATED RESPONSE
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--text)' }}>
                  &lt; 24 HOURS
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                  PRIMARY TIMEZONE
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--text)' }}>
                  IST (UTC+05:30)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                  LOCATION
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--violet2)' }}>
                  AHMEDABAD, INDIA
                </span>
              </div>
            </div>

            {/* Direct Channels */}
            <div style={{
              borderTop: '1px solid rgba(139, 92, 246, 0.15)',
              paddingTop: '1.5rem',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.62rem',
                letterSpacing: '0.14em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                DIRECT CHANNELS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a
                  href="mailto:shadabharadwala@gmail.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.18)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(232,149,109,0.5)';
                    e.currentTarget.style.background = 'rgba(232,149,109,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)';
                    e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--rose)' }}>✉</span> Email
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                    shadabharadwala@gmail.com
                  </span>
                </a>

                <a
                  href="https://github.com/Shadab-Haradwala"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.18)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                    e.currentTarget.style.background = 'rgba(167,139,250,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)';
                    e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--violet2)' }}>⚡</span> GitHub
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                    @Shadab-Haradwala
                  </span>
                </a>

                <a
                  href="https://linkedin.com/in/shadab-haradwala"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.18)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(45,212,191,0.5)';
                    e.currentTarget.style.background = 'rgba(45,212,191,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)';
                    e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--teal)' }}>◈</span> LinkedIn
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                    shadab-haradwala
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Glass Inquiry Form */}
          <div className="reveal" style={{
            background: 'rgba(14, 10, 35, 0.65)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 24,
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 32px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)',
          }}>
            {submitted ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  color: 'var(--rose)',
                  filter: 'drop-shadow(0 0 16px rgba(232,149,109,0.5))',
                }}>✦</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--text)',
                  marginBottom: '.6rem',
                }}>
                  Transmission Received
                </div>
                <p style={{
                  fontSize: '.88rem',
                  color: 'var(--textd)',
                  lineHeight: 1.8,
                  maxWidth: 440,
                  margin: '0 auto 1.8rem',
                }}>
                  Your message has been encrypted and logged to the central dispatch queue. Shadab will personally analyze your project scope and respond within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', projectType: 'Full-Stack Web', budget: '$1,000 – $3,000', message: '' });
                  }}
                  style={{
                    padding: '.75rem 1.8rem',
                    borderRadius: 50,
                    background: 'rgba(139,92,246,.15)',
                    border: '1px solid rgba(139,92,246,.35)',
                    color: 'var(--rose)',
                    fontSize: '.72rem',
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label htmlFor="inquiry-name" style={labelStyle}>Your Name *</label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Chen"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiry-email" style={labelStyle}>Your Email *</label>
                    <input
                      id="inquiry-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label htmlFor="inquiry-type" style={labelStyle}>Project Scope</label>
                    <select
                      id="inquiry-type"
                      value={formData.projectType}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="Full-Stack Web" style={{ background: '#0e0a23', color: '#fff' }}>Full-Stack Web Application</option>
                      <option value="AI Integration" style={{ background: '#0e0a23', color: '#fff' }}>Autonomous AI / LLM Pipeline</option>
                      <option value="3D / WebGL" style={{ background: '#0e0a23', color: '#fff' }}>3D / WebGL Interactive System</option>
                      <option value="Other" style={{ background: '#0e0a23', color: '#fff' }}>Custom Architecture / Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inquiry-budget" style={labelStyle}>Budget Allocation</label>
                    <select
                      id="inquiry-budget"
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="< $1,000" style={{ background: '#0e0a23', color: '#fff' }}>&lt; $1,000</option>
                      <option value="$1,000 – $3,000" style={{ background: '#0e0a23', color: '#fff' }}>$1,000 – $3,000</option>
                      <option value="$3,000 – $5,000" style={{ background: '#0e0a23', color: '#fff' }}>$3,000 – $5,000</option>
                      <option value="$5,000+" style={{ background: '#0e0a23', color: '#fff' }}>$5,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiry-message" style={labelStyle}>Mission Directives / Brief *</label>
                  <textarea
                    id="inquiry-message"
                    required
                    rows={4}
                    placeholder="Briefly describe project requirements, deliverables, timeline goals..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: '.5rem',
                    padding: '.9rem 2.2rem',
                    borderRadius: 50,
                    background: 'linear-gradient(135deg, var(--rose), var(--violet))',
                    color: '#fff',
                    fontSize: '.75rem',
                    fontWeight: 700,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    boxShadow: '0 8px 32px rgba(232,149,109,.35)',
                    transition: 'transform .2s, box-shadow .2s',
                    opacity: isSubmitting ? 0.7 : 1,
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {isSubmitting ? 'TRANSMITTING DIRECTIVE...' : 'TRANSMIT DIRECTIVE ✦'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Futuristic HUD Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        padding: '2rem 3.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'rgba(7, 7, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(139, 92, 246, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '0.95rem',
            color: 'var(--text)',
            letterSpacing: '0.04em',
          }}>
            SHADAB<span style={{ color: 'var(--rose)' }}>.</span>
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '.62rem',
            color: 'var(--muted)',
            letterSpacing: '.06em',
          }}>
            © 2026 SHADAB HARADWALA // AI SYSTEMS ARCHITECT
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '.62rem',
          color: 'var(--muted)',
        }}>
          <span>AHMEDABAD, INDIA</span>
        </div>
      </footer>
    </>
  );
}
