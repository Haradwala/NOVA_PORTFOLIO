import { useEffect, useRef } from 'react';
import { registerSection } from '../utils/sectionRegistry';

export default function Contact() {
  const sectionRef = useRef(null);

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

        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{
            fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '.7rem',
            justifyContent: 'center', marginBottom: '.7rem',
          }}>
            <span style={{ display: 'block', width: '1.2rem', height: 1, background: 'var(--rose)' }} />Get In Touch
          </div>

          <h2 className="reveal" style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: 'var(--text)',
            marginBottom: '2.5rem',
            textShadow: '0 0 40px rgba(139,92,246,.3)',
          }}>
            Let's build something{' '}
            <span style={{ background: 'linear-gradient(90deg,var(--rose),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              remarkable
            </span>
          </h2>

          {/* Glass contact card */}
          <div className="reveal" style={{
            background: 'rgba(14,10,35,0.6)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(139,92,246,.22)',
            borderRadius: 28, padding: '3.5rem',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05)',
          }}>
            {/* Inner glow */}
            <div style={{ position: 'absolute', inset: -1, borderRadius: 28, background: 'linear-gradient(135deg,rgba(232,149,109,.1),rgba(139,92,246,.1))', zIndex: -1 }} />

            <p style={{ fontSize: '.88rem', color: 'var(--textd)', lineHeight: 1.9, marginBottom: '2rem' }}>
              Have a project in mind? Let's make it happen — or just ask NOVA, she knows everything about me.
            </p>

            <a href="mailto:hello@shadab.design" style={{
              fontFamily: "'Syne',sans-serif", fontSize: '1.25rem', fontWeight: 700,
              background: 'linear-gradient(90deg,var(--rose),var(--violet2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', textDecoration: 'none',
              display: 'inline-block', marginBottom: '2rem',
              filter: 'drop-shadow(0 0 10px rgba(139,92,246,.3))',
            }}>
              hello@shadab.design
            </a>

            <br />

            <a href="mailto:hello@shadab.design" style={{
              display: 'inline-block', padding: '.85rem 2.1rem', borderRadius: 50,
              background: 'linear-gradient(135deg,var(--rose),var(--violet))',
              color: '#fff', fontSize: '.7rem', letterSpacing: '.12em',
              textTransform: 'uppercase', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(232,149,109,.3)',
              transition: 'transform .2s, box-shadow .2s',
            }}>
              Start a Project
            </a>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
              {['Behance', 'Dribbble', 'LinkedIn', 'Instagram'].map(s => (
                <a key={s} href="#" style={{
                  fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--rose2)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer — also transparent */}
      <footer style={{
        position: 'relative', zIndex: 2,
        padding: '1.4rem 3.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        background: 'rgba(7,7,15,0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(139,92,246,.12)',
      }}>
        <span style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.06em' }}>© 2026 Shadab — AI Developer & Designer</span>
        <span style={{ fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.06em' }}>Powered by NOVA ✦ Ahmedabad, India</span>
      </footer>
    </>
  );
}
