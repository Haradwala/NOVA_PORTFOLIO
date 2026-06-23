import { useEffect, useRef } from 'react';
import { registerSection, highlightSection } from '../utils/sectionRegistry';

const glass = {
  background:    'rgba(14, 10, 35, 0.55)',
  backdropFilter:'blur(18px) saturate(160%)',
  border:        '1px solid rgba(139,92,246,0.15)',
  borderRadius:  20,
};

const glassLight = {
  background:    'rgba(20, 14, 48, 0.45)',
  backdropFilter:'blur(14px)',
  border:        '1px solid rgba(139,92,246,0.12)',
  borderRadius:  16,
};

export default function About() {
  const sectionRef = useRef(null);
  const skillsRef = useRef(null);

  useEffect(() => {
    const unregister = registerSection('skills', skillsRef);
    if (window.__pendingScroll === 'skills') {
      window.__pendingScroll = null;
      setTimeout(() => {
        skillsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.__pendingHighlight === 'skills') {
          window.__pendingHighlight = null;
          highlightSection('skills');
        }
      }, 350);
    }
    return unregister;
  }, []);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal') || [];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const skills = [
    ['Figma / Prototyping', 95], ['UX Research', 85], ['Brand Identity', 90],
    ['Motion Design', 75],       ['Design Systems', 88], ['Webflow / Code', 70],
  ];
  const exp = [
    { year: '2023 — Present', role: 'Senior Product Designer', where: 'Freelance · Global', active: true },
    { year: '2021 — 2023',    role: 'UI/UX Designer',          where: 'Razorpay · Bangalore' },
    { year: '2019 — 2021',    role: 'Visual Designer',          where: 'Lollypop Design Studio' },
    { year: '2015 — 2019',    role: 'B.Des Visual Comm.',       where: 'NID Ahmedabad' },
  ];
  const nums = [
    { val: '40+', lbl: 'Projects',   border: 'rgba(232,149,109,.25)', bg: 'rgba(232,149,109,.08)' },
    { val: '18',  lbl: 'Clients',    border: 'rgba(139,92,246,.25)',  bg: 'rgba(139,92,246,.08)'  },
    { val: '6+',  lbl: 'Years',      border: 'rgba(45,212,191,.25)',  bg: 'rgba(45,212,191,.08)'  },
    { val: '8',   lbl: 'Countries',  border: 'rgba(242,180,154,.25)', bg: 'rgba(242,180,154,.08)' },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        position: 'relative', zIndex: 2,
        padding: '7rem 3.5rem',
        overflow: 'hidden',
        background: 'transparent', // let universe show through
      }}
    >
      {/* Subtle section darkening overlay so text stays readable */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(7,7,15,.55) 0%, rgba(7,7,15,.75) 100%)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Marquee ── */}
        <div className="reveal" style={{
          overflow: 'hidden',
          borderTop: '1px solid rgba(139,92,246,.18)',
          borderBottom: '1px solid rgba(139,92,246,.18)',
          padding: '.7rem 0', marginBottom: '5rem',
        }}>
          <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {[0,1].map(k => (
              <span key={k} aria-hidden={k===1} style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: 'clamp(1rem,2.5vw,1.8rem)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(232,149,109,.3)',
                letterSpacing: '.08em', textTransform: 'uppercase',
                animation: 'marquee 20s linear infinite', display: 'inline-block',
              }}>
                Design is a Conversation &nbsp;✦&nbsp; Design is a Conversation &nbsp;✦&nbsp; Design is a Conversation &nbsp;✦&nbsp; Design is a Conversation &nbsp;✦&nbsp; Design is a Conversation &nbsp;✦&nbsp; Design is a Conversation &nbsp;✦&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ── Top split ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '5rem', alignItems: 'start', marginBottom: '4rem',
        }}>
          {/* Big type */}
          <div className="reveal">
            <div style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 'clamp(3.2rem,5.5vw,6rem)', lineHeight: .92, letterSpacing: '-.04em',
            }}>
              <span style={{ color: 'var(--text)', display: 'block' }}>I make</span>
              <span style={{ display: 'block', WebkitTextStroke: '1.5px rgba(232,149,109,.55)', WebkitTextFillColor: 'transparent' }}>things</span>
              <span style={{ display: 'block', background: 'linear-gradient(100deg,var(--rose),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>that last.</span>
            </div>
          </div>

          {/* Bio glass card */}
          <div className="reveal" style={{ ...glass, padding: '2rem' }}>
            <div style={{ fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', width: '1.2rem', height: 1, background: 'var(--rose)' }} />About Me
            </div>
            <p style={{ fontSize: '.88rem', lineHeight: 2, color: 'var(--textd)', marginBottom: '1rem' }}>
              I'm <span style={{ color: 'var(--rose2)', fontWeight: 500 }}>Shadab</span>, an AI Developer & Designer from <span style={{ color: 'var(--rose2)', fontWeight: 500 }}>Ahmedabad, India</span>. Six years in, the best design isn't just beautiful — it's <em>invisible</em>.
            </p>
            <p style={{ fontSize: '.88rem', lineHeight: 2, color: 'var(--textd)', marginBottom: '1rem' }}>
              I build AI-powered apps, brand identities, and product interfaces that scale beautifully.
            </p>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)', fontStyle: 'italic', borderLeft: '2px solid rgba(232,149,109,.35)', paddingLeft: '1rem', marginTop: '1rem' }}>
              "Great design removes noise until only the essential remains."
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.85rem', flexWrap: 'wrap' }}>
              <a href="#contact" style={{ padding: '.7rem 1.5rem', borderRadius: 50, background: 'linear-gradient(135deg,var(--rose),var(--violet))', color: '#fff', fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 6px 20px rgba(232,149,109,.3)' }}>Work With Me</a>
              <a href="#" style={{ padding: '.7rem 1.5rem', borderRadius: 50, color: 'var(--textd)', fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,.12)', textDecoration: 'none' }}>Download CV →</a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="reveal" style={{ height: 1, background: 'linear-gradient(90deg,var(--rose),var(--violet),transparent)', opacity: .25, margin: '3rem 0' }} />

        {/* ── Bottom 3-col (glass cards) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>

          {/* Skills */}
          <div ref={skillsRef} className="reveal" style={{ ...glass, padding: '1.5rem' }}>
            <div style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ display: 'block', width: '.75rem', height: 1, background: 'var(--muted)' }} />Toolkit
            </div>
            {skills.map(([name, pct]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '1px solid rgba(139,92,246,.1)' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--textd)' }}>{name}</span>
                <div style={{ width: 52, height: 2, background: 'rgba(255,255,255,.08)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--rose),var(--violet))', borderRadius: 1 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="reveal" style={{ ...glass, padding: '1.5rem' }}>
            <div style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ display: 'block', width: '.75rem', height: 1, background: 'var(--muted)' }} />Experience
            </div>
            {exp.map(e => (
              <div key={e.year} style={{ padding: '.75rem 0 .75rem 1rem', borderBottom: '1px solid rgba(139,92,246,.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: '1rem', width: 5, height: 5, borderRadius: '50%', background: e.active ? 'var(--rose)' : 'var(--muted)', boxShadow: e.active ? '0 0 8px rgba(232,149,109,.7)' : 'none' }} />
                <div style={{ fontSize: '.55rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.2rem' }}>{e.year}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 500, color: 'var(--text)' }}>{e.role}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--muted)' }}>{e.where}</div>
              </div>
            ))}
          </div>

          {/* Numbers */}
          <div className="reveal" style={{ ...glass, padding: '1.5rem' }}>
            <div style={{ fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ display: 'block', width: '.75rem', height: 1, background: 'var(--muted)' }} />By the Numbers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
              {nums.map(n => (
                <div key={n.lbl} style={{ borderRadius: 14, padding: '1rem', textAlign: 'center', border: `1px solid ${n.border}`, background: n.bg, backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--rose),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: '.3rem' }}>{n.val}</div>
                  <div style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{n.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
