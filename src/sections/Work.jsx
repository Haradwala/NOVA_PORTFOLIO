import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProjectDeepDive, { CASE_STUDIES } from '../components/ProjectDeepDive';
import { registerSection } from '../utils/sectionRegistry';


// Project id maps to CASE_STUDIES keys in ProjectDeepDive
const PROJECTS = [
  {
    id: 'nova', cat: 'brand', height: 220,
    bg: 'linear-gradient(135deg,#1a0a2e,#2d1060)',
    preview: (
      <div style={{ textAlign:'center', zIndex:1, position:'relative' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.5rem', fontWeight:800, background:'linear-gradient(135deg,#E8956D,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>NŌVA</div>
        <div style={{ fontSize:'.58rem', letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(167,139,250,.6)', marginTop:'.3rem' }}>Brand Identity</div>
      </div>
    ),
    tag: 'Brand Identity · 2025', name: 'Nōva — Luxury E-commerce',
    desc: 'Full identity system. 3× conversion lift post-launch.', year: '6 weeks',
  },
  {
    id: 'bloom', cat: 'app', height: 190,
    bg: 'linear-gradient(135deg,#061a0c,#0a2e14)',
    preview: (
      <div style={{ textAlign:'center', zIndex:1, position:'relative' }}>
        <div style={{ fontSize:'2.2rem', marginBottom:'.3rem' }}>🌿</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.3rem', fontWeight:700, color:'#2DD4BF' }}>Bloom</div>
        <div style={{ fontSize:'.6rem', letterSpacing:'.14em', color:'rgba(45,212,191,.5)', textTransform:'uppercase' }}>Wellness App</div>
      </div>
    ),
    tag: 'Mobile App · 2025', name: 'Bloom — Wellness',
    desc: 'Gesture-first UX for daily mindfulness. 4.9★ App Store.', year: 'iOS & Android',
  },
  {
    id: null, cat: 'brand', isText: true,
    tag: 'Case Study · 2024', name: 'Verdant Studio\nRebrand',
    desc: 'Full identity overhaul for a Berlin-based studio.',
    highlight: '2× engagement lift.',
    stats: [{ val: '2×', lbl: 'Engagement' }, { val: '18', lbl: 'Deliverables' }],
  },
  {
    id: 'folio', cat: 'web', height: 200,
    bg: 'linear-gradient(135deg,#100a1f,#1a1035)',
    preview: (
      <div style={{ textAlign:'center', zIndex:1, position:'relative', padding:'0 1.5rem', width:'100%' }}>
        <div style={{ width:'100%', height:48, background:'rgba(139,92,246,.15)', border:'1px solid rgba(139,92,246,.25)', borderRadius:10, display:'flex', alignItems:'center', padding:'0 .75rem', gap:'.5rem', marginBottom:'.6rem' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#E8956D' }} />
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#A78BFA' }} />
          <div style={{ flex:1, height:7, background:'rgba(255,255,255,.07)', borderRadius:4 }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.4rem' }}>
          <div style={{ height:24, background:'rgba(232,149,109,.1)', borderRadius:6, border:'1px solid rgba(232,149,109,.2)' }} />
          <div style={{ height:24, background:'rgba(139,92,246,.1)', borderRadius:6, border:'1px solid rgba(139,92,246,.2)' }} />
        </div>
      </div>
    ),
    tag: 'Web Design · 2024', name: 'Folio — Portfolio System',
    desc: 'Modular design system used by 200+ designers globally.', year: 'Webflow + Figma',
  },
  {
    id: null, cat: 'app', isImpact: true,
    tag: 'Impact', bigNum: '40+',
    desc: 'Projects across brand, product & web for clients in 8 countries.',
    quote: '"Shadab delivered beyond expectations."', quoteBy: '— Client, Nōva',
  },
  {
    id: 'pulse', cat: 'app', height: 175,
    bg: 'linear-gradient(135deg,#0f0a20,#1a1035)',
    preview: (
      <div style={{ textAlign:'center', zIndex:1, position:'relative' }}>
        <div style={{ fontSize:'1.8rem', marginBottom:'.3rem' }}>💳</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:700, color:'#A78BFA' }}>Pulse</div>
        <div style={{ fontSize:'.58rem', letterSpacing:'.14em', color:'rgba(167,139,250,.5)', textTransform:'uppercase' }}>Finance Tracker</div>
      </div>
    ),
    tag: 'App Design · 2023', name: 'Pulse — Finance Tracker',
    desc: 'Dark-mode dashboard with adaptive spending insights.', year: 'iOS · Figma',
  },
];

const cardGlass = { background:'rgba(14,10,35,0.6)', backdropFilter:'blur(20px) saturate(160%)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:18, overflow:'hidden' };

function ProjectCard({ p, onDeepDive }) {
  const [hov, setHov] = useState(false);
  const canDeepDive = !!p.id;

  const handleClick = () => { if (canDeepDive) onDeepDive(p.id); };

  if (p.isText) return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={handleClick}
      style={{ ...cardGlass, breakInside:'avoid', marginBottom:'1.1rem', cursor: canDeepDive ? 'pointer' : 'default',
        background: hov ? 'rgba(20,12,50,.75)' : 'rgba(14,10,38,.65)',
        border:`1px solid ${hov ? 'rgba(139,92,246,.4)' : 'rgba(139,92,246,.18)'}`,
        boxShadow: hov ? '0 20px 50px rgba(0,0,0,.5)' : 'none',
        transform: hov ? 'translateY(-5px)' : 'none', transition:'all .3s',
      }}>
      <div style={{ padding:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.2rem' }}>
          <div style={{ fontSize:'.56rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--violet2)' }}>{p.tag}</div>
          <div style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(232,149,109,.35)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--rose)', fontSize:'.85rem' }}>↗</div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.2rem', fontWeight:700, color:'var(--text)', lineHeight:1.2, marginBottom:'.75rem', whiteSpace:'pre-line' }}>{p.name}</div>
        <div style={{ fontSize:'.7rem', color:'var(--muted)', lineHeight:1.8, marginBottom:'1.2rem' }}>{p.desc} <span style={{ color:'var(--rose2)', fontWeight:500 }}>{p.highlight}</span></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.6rem' }}>
          {p.stats.map(s => (
            <div key={s.lbl} style={{ background:'rgba(232,149,109,.08)', borderRadius:10, padding:'.65rem', textAlign:'center', border:'1px solid rgba(232,149,109,.15)' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.3rem', fontWeight:800, background:'linear-gradient(135deg,var(--rose),var(--violet2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.val}</div>
              <div style={{ fontSize:'.55rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginTop:2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (p.isImpact) return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...cardGlass, breakInside:'avoid', marginBottom:'1.1rem', cursor:'default', background:'rgba(20,14,42,.7)', transform: hov ? 'translateY(-5px)' : 'none', transition:'all .3s' }}>
      <div style={{ padding:'2rem' }}>
        <div style={{ fontSize:'.56rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--violet2)', marginBottom:'1.2rem' }}>{p.tag}</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'3.2rem', fontWeight:800, lineHeight:.9, background:'linear-gradient(135deg,var(--rose),var(--violet2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'.75rem' }}>{p.bigNum}</div>
        <div style={{ fontSize:'.8rem', color:'var(--textd)', lineHeight:1.8, marginBottom:'1.2rem' }}>{p.desc}</div>
        <div style={{ borderLeft:'2px solid rgba(232,149,109,.4)', paddingLeft:'1rem' }}>
          <div style={{ fontSize:'.76rem', fontStyle:'italic', color:'var(--textd)', lineHeight:1.7 }}>{p.quote}</div>
          <div style={{ fontSize:'.6rem', color:'var(--muted)', marginTop:'.5rem' }}>{p.quoteBy}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={handleClick}
      style={{ ...cardGlass, breakInside:'avoid', marginBottom:'1.1rem', cursor: canDeepDive ? 'pointer' : 'default',
        border:`1px solid ${hov ? 'rgba(139,92,246,.45)' : 'rgba(139,92,246,.18)'}`,
        boxShadow: hov ? '0 24px 60px rgba(0,0,0,.55), 0 0 40px rgba(139,92,246,.15)' : 'none',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none', transition:'all .3s cubic-bezier(.25,.46,.45,.94)',
      }}>
      <div style={{ height:p.height, background:p.bg, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {p.preview}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%,rgba(139,92,246,.12),transparent 65%)' }} />
        {hov && (
          <div style={{ position:'absolute', inset:0, background:'rgba(7,5,20,.88)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'1.1rem', backdropFilter:'blur(4px)' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'.35rem', fontSize:'.62rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--rose2)', border:'1px solid rgba(242,180,154,.3)', borderRadius:50, padding:'.3rem .8rem', width:'fit-content' }}>
              {canDeepDive ? 'Deep Dive ↗' : 'View Project ↗'}
            </span>
            {canDeepDive && <div style={{ fontSize:'.56rem', color:'rgba(255,255,255,.35)', marginTop:'.3rem', letterSpacing:'.08em' }}>Full case study inside</div>}
          </div>
        )}
      </div>
      <div style={{ padding:'1.1rem 1.2rem 1.2rem' }}>
        <div style={{ fontSize:'.56rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--violet2)', marginBottom:'.3rem' }}>{p.tag}</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.98rem', fontWeight:700, color:'var(--text)', marginBottom:'.28rem' }}>{p.name}</div>
        <div style={{ fontSize:'.7rem', color:'var(--muted)', lineHeight:1.65 }}>{p.desc}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'.7rem', paddingTop:'.7rem', borderTop:'1px solid rgba(139,92,246,.1)' }}>
          <span style={{ fontSize:'.6rem', color:'var(--muted)' }}>{p.year}</span>
          <div style={{ display:'flex', alignItems:'center', gap:'.3rem' }}>
            {canDeepDive && <span style={{ fontSize:'.52rem', color:'rgba(139,92,246,.5)', letterSpacing:'.08em' }}>3D dive</span>}
            <div style={{ width:26, height:26, borderRadius:'50%', border:`1px solid ${hov ? 'var(--rose)' : 'rgba(139,92,246,.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', color: hov ? 'var(--rose)' : 'var(--muted)', fontSize:'.75rem', transition:'all .2s' }}>→</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  const [filter,    setFilter]    = useState('all');
  const [activeId,  setActiveId]  = useState(null);
  const sectionRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unregister = registerSection('projects', sectionRef);
    if (window.__pendingScroll === 'projects') {
      window.__pendingScroll = null;
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
    return unregister;
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      const { projectId } = e.detail;
      if (projectId && CASE_STUDIES[projectId]) {
        setActiveId(projectId);
      }
    };
    window.addEventListener('nova-open-project', handleOpen);
    return () => window.removeEventListener('nova-open-project', handleOpen);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectParam = params.get('project');
    if (projectParam && CASE_STUDIES[projectParam]) {
      setActiveId(projectParam);
    }
  }, [location.search]);

  const handleCloseDeepDive = () => {
    setActiveId(null);
    const params = new URLSearchParams(location.search);
    if (params.has('project')) {
      params.delete('project');
      const searchStr = params.toString();
      navigate(location.pathname + (searchStr ? `?${searchStr}` : ''), { replace: true });
    }
  };

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal') || [];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const filters = ['all','brand','app','web'];
  const shown   = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.cat === filter);

  return (
    <>
      <section id="work" ref={sectionRef} style={{ position:'relative', zIndex:2, padding:'7rem 3.5rem', background:'transparent' }}>
        <div style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(7,7,15,.5) 0%, rgba(7,7,15,.72) 100%)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div className="reveal" style={{ maxWidth:1100, margin:'0 auto 3rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ fontSize:'.6rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--rose)', display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'.7rem' }}>
                <span style={{ display:'block', width:'1.2rem', height:1, background:'var(--rose)' }} />Selected Work
              </div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3.5vw,2.8rem)', color:'var(--text)', textShadow:'0 0 30px rgba(139,92,246,.3)' }}>
                Projects that{' '}
                <span style={{ background:'linear-gradient(90deg,var(--rose),var(--violet2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>define</span>
                {' '}the craft
              </h2>
              <p style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:'.5rem', letterSpacing:'.04em' }}>Click any card to explore the full 3D case study ↗</p>
            </div>
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding:'.35rem .9rem', borderRadius:50, border:`1px solid ${filter===f ? 'rgba(232,149,109,.5)' : 'rgba(139,92,246,.2)'}`, background: filter===f ? 'rgba(232,149,109,.1)' : 'rgba(139,92,246,.06)', backdropFilter:'blur(8px)', color: filter===f ? 'var(--rose)' : 'var(--muted)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s' }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ maxWidth:1100, margin:'0 auto', columns:3, columnGap:'1.1rem' }}>
            {shown.map((p, i) => <ProjectCard key={i} p={p} onDeepDive={setActiveId} />)}
          </div>
        </div>
      </section>

      {/* 3D Deep-Dive Portal */}
      {activeId && (
        <ProjectDeepDive projectId={activeId} onClose={handleCloseDeepDive} />
      )}
    </>
  );
}
