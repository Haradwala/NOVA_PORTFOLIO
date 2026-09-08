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
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
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
    padding: '.75rem 1rem',
    borderRadius: 12,
    background: 'rgba(20, 14, 45, 0.65)',
    border: '1px solid rgba(139,92,246,.25)',
    color: 'var(--text)',
    fontSize: '.82rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '.58rem',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '.35rem',
    textAlign: 'left',
  };

  return (
    <>
      <section
        id="contact"
        ref={sectionRef}
        style={{ position: 'relative', zIndex: 2, padding: '7rem 3.5rem', textAlign: 'center', background: 'transparent' }}
      >
        {/* Section overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(7,7,15,.5) 0%, rgba(7,7,15,.75) 100%)',
        }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{
            fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '.7rem',
            justifyContent: 'center', marginBottom: '.7rem',
          }}>
            <span style={{ display: 'block', width: '1.2rem', height: 1, background: 'var(--rose)' }} />Project Inquiry
          </div>

          <h2 className="reveal" style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: 'var(--text)',
            marginBottom: '2rem',
            textShadow: '0 0 40px rgba(139,92,246,.3)',
          }}>
            Let's build something{' '}
            <span style={{ background: 'linear-gradient(90deg,var(--rose),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              remarkable
            </span>
          </h2>

          {/* Glass inquiry form card */}
          <div className="reveal" style={{
            background: 'rgba(14,10,35,0.6)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(139,92,246,.22)',
            borderRadius: 24, padding: '2.5rem',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05)',
          }}>
            <div style={{ position: 'absolute', inset: -1, borderRadius: 24, background: 'linear-gradient(135deg,rgba(232,149,109,.08),rgba(139,92,246,.08))', zIndex: -1 }} />

            {submitted ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✦</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose2)', marginBottom: '.5rem' }}>
                  Inquiry Transmitted
                </div>
                <p style={{ fontSize: '.84rem', color: 'var(--textd)', lineHeight: 1.8, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                  Thank you for reaching out. Shadab will personally review your project scope and follow up directly.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', projectType: 'Full-Stack Web', budget: '$1,000 – $3,000', message: '' }); }}
                  style={{
                    padding: '.65rem 1.6rem', borderRadius: 50,
                    background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)',
                    color: 'var(--rose)', fontSize: '.68rem', letterSpacing: '.12em',
                    textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="inquiry-type" style={labelStyle}>Project Type</label>
                    <select
                      id="inquiry-type"
                      value={formData.projectType}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="Full-Stack Web" style={{ background: '#0e0a23', color: '#fff' }}>Full-Stack Web</option>
                      <option value="AI Integration" style={{ background: '#0e0a23', color: '#fff' }}>AI Integration</option>
                      <option value="3D / WebGL" style={{ background: '#0e0a23', color: '#fff' }}>3D / WebGL</option>
                      <option value="Other" style={{ background: '#0e0a23', color: '#fff' }}>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inquiry-budget" style={labelStyle}>Budget Range</label>
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
                  <label htmlFor="inquiry-message" style={labelStyle}>Message / Project Overview *</label>
                  <textarea
                    id="inquiry-message"
                    required
                    rows={4}
                    placeholder="Tell me about what you are building, timeline, and goals..."
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
                    padding: '.85rem 2.2rem',
                    borderRadius: 50,
                    background: 'linear-gradient(135deg,var(--rose),var(--violet))',
                    color: '#fff',
                    fontSize: '.72rem',
                    fontWeight: 600,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    boxShadow: '0 8px 32px rgba(232,149,109,.35)',
                    transition: 'transform .2s, box-shadow .2s',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Transmitting...' : 'Send Inquiry ✦'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 2,
        padding: '1.4rem 3.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        background: 'rgba(7,7,15,0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(139,92,246,.12)',
      }}>
        <span style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.06em' }}>© 2026 Shadab Haradwala — AI Developer & Designer</span>
        <span style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.06em' }}>Powered by NOVA ✦ Ahmedabad, India</span>
      </footer>
    </>
  );
}
