import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const CASE_STUDIES = {
  nova: {
    title: 'Nōva — Luxury E-commerce',
    color: 0x8B5CF6,
    accent: '#8B5CF6',
    tag: 'Brand Identity · 2025',
    overview: 'Full identity system for a luxury e-commerce platform. Logo, typography, colour tokens, motion guidelines, and a complete design system.',
    challenge: 'The brand needed to feel premium yet approachable. Every touchpoint had to whisper "luxury" without shouting it.',
    process: ['Discovery & competitive audit', 'Moodboard & direction', 'Logo exploration (40+ concepts)', 'Typography & colour system', 'Motion guidelines', 'Handoff & documentation'],
    outcome: '3× conversion lift in the first 90 days post-launch. 18 deliverables in 6 weeks.',
    metrics: [{ val: '3×', lbl: 'Conversion' }, { val: '18', lbl: 'Deliverables' }, { val: '6', lbl: 'Weeks' }],
    tech: ['Figma', 'After Effects', 'Principle', 'Notion'],
  },
  bloom: {
    title: 'Bloom — Wellness App',
    color: 0x2DD4BF,
    accent: '#2DD4BF',
    tag: 'Mobile App · 2025',
    overview: 'Calm, gesture-first iOS/Android UX for daily mindfulness. Designed for people who think they don\'t have time to meditate.',
    challenge: 'Most wellness apps feel clinical. Bloom had to feel like a warm friend, not a productivity tool.',
    process: ['User research (24 interviews)', 'Jobs-to-be-done mapping', 'Low-fi wireframes', 'Gesture prototype', 'Usability testing (3 rounds)', 'Dev handoff'],
    outcome: '4.9★ on App Store launch day. Featured by Apple in "Apps We Love."',
    metrics: [{ val: '4.9★', lbl: 'App Store' }, { val: '24', lbl: 'Interviews' }, { val: '3', lbl: 'Test Rounds' }],
    tech: ['Figma', 'Protopie', 'Lottie', 'SwiftUI'],
  },
  folio: {
    title: 'Folio — Portfolio System',
    color: 0xE8956D,
    accent: '#E8956D',
    tag: 'Web Design · 2024',
    overview: 'A modular design system for creative portfolios — components, tokens, templates, and documentation. Used by 200+ designers globally.',
    challenge: 'Designers spend weeks on their portfolio instead of client work. Folio needed to be powerful enough for senior designers yet simple for juniors.',
    process: ['Market research', 'Component inventory', 'Design tokens system', 'Figma library build', 'Webflow implementation', 'Documentation'],
    outcome: '200+ active users. Covered by Design Milk and The Brand Identity.',
    metrics: [{ val: '200+', lbl: 'Users' }, { val: '80+', lbl: 'Components' }, { val: '2', lbl: 'Press Features' }],
    tech: ['Figma', 'Webflow', 'Notion', 'Lottie'],
  },
  pulse: {
    title: 'Pulse — Finance Tracker',
    color: 0xA78BFA,
    accent: '#A78BFA',
    tag: 'App Design · 2023',
    overview: 'Dark-mode iOS dashboard with adaptive spending insights. Turns raw bank data into visual stories you actually understand.',
    challenge: 'Finance apps are either too simple (useless) or too complex (ignored). Pulse had to sit in the sweet spot.',
    process: ['Data viz research', 'Information architecture', 'Dark mode system', 'Chart component library', 'Micro-interaction design', 'iOS handoff'],
    outcome: 'Acquired by a FinTech startup 8 months after launch. Used by 12,000+ people.',
    metrics: [{ val: '12k+', lbl: 'Users' }, { val: '4.8★', lbl: 'Rating' }, { val: '8mo', lbl: 'To Acquisition' }],
    tech: ['Figma', 'Principle', 'Swift Charts', 'D3.js'],
  },
};

function ThreeScene({ color, isOpen }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el || !isOpen) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    cam.position.z = 3.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl1 = new THREE.PointLight(color, 8, 12); pl1.position.set(-2, 2, 3); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xffffff, 3, 10); pl2.position.set(2, -2, 2); scene.add(pl2);

    // Main shape — unique per project
    const geo = new THREE.TorusKnotGeometry(0.9, 0.28, 120, 16, 2, 3);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.9, emissive: color, emissiveIntensity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Wireframe overlay
    const wMat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.08 });
    const wire = new THREE.Mesh(new THREE.TorusKnotGeometry(0.92, 0.29, 60, 8, 2, 3), wMat);
    scene.add(wire);

    // Orbiting particles
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const r = 2 + Math.random() * 1.5;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pPos[i*3] = r*Math.sin(ph)*Math.cos(th); pPos[i*3+1] = r*Math.sin(ph)*Math.sin(th); pPos[i*3+2] = r*Math.cos(ph);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color, size: 0.04, transparent: true, opacity: 0.6 })));

    let t = 0, rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate); t += 0.008;
      mesh.rotation.x = t * 0.3; mesh.rotation.y = t * 0.5;
      wire.rotation.copy(mesh.rotation);
      pl1.position.set(Math.sin(t * 0.5) * 3, Math.cos(t * 0.4) * 2, 3);
      renderer.render(scene, cam);
    };
    animate();
    return () => { cancelAnimationFrame(rafId); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, [color, isOpen]);
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

export default function ProjectDeepDive({ projectId, onClose }) {
  const [phase, setPhase]     = useState('entering'); // entering | open | closing
  const [step, setStep]       = useState(0);          // 0=overview 1=process 2=outcome
  const cs = CASE_STUDIES[projectId];

  useEffect(() => {
    const t = setTimeout(() => setPhase('open'), 50);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setPhase('closing');
    setTimeout(onClose, 500);
  }, [onClose]);

  // Keyboard ESC
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  if (!cs) return null;

  const isOpen = phase === 'open';

  const steps = [
    { label: 'Overview',  icon: '◎' },
    { label: 'Process',   icon: '⟳' },
    { label: 'Outcome',   icon: '✦' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      transition: 'opacity .5s ease, transform .5s cubic-bezier(.34,1.1,.64,1)',
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? 'scale(1)' : 'scale(.94)',
    }}>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(4,3,15,.92)',
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Main card — flies toward viewer */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 1000,
        maxHeight: '90vh',
        background: 'rgba(14,10,35,.95)',
        border: `1px solid ${cs.accent}40`,
        borderRadius: 24,
        boxShadow: `0 40px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04), 0 0 80px ${cs.accent}20`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
        transition: 'all .5s cubic-bezier(.34,1.1,.64,1)',
        transform: isOpen ? 'translateZ(0) rotateX(0deg)' : 'translateZ(-200px) rotateX(8deg)',
      }}>

        {/* LEFT — 3D scene */}
        <div style={{ background: 'rgba(8,5,20,.8)', position: 'relative', minHeight: 480 }}>
          <ThreeScene color={cs.color} isOpen={isOpen} />

          {/* Tag overlay */}
          <div style={{
            position: 'absolute', top: '1.2rem', left: '1.2rem',
            fontSize: '.58rem', letterSpacing: '.16em', textTransform: 'uppercase',
            color: cs.accent, background: `${cs.accent}18`,
            border: `1px solid ${cs.accent}40`,
            borderRadius: 50, padding: '.3rem .85rem',
          }}>{cs.tag}</div>

          {/* Tech pills bottom */}
          <div style={{ position: 'absolute', bottom: '1.2rem', left: '1.2rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {cs.tech.map(t => (
              <span key={t} style={{ fontSize: '.58rem', padding: '.22rem .65rem', borderRadius: 50, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — case study content */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{
            padding: '1.5rem 1.5rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#EEEEF5', lineHeight: 1.2 }}>{cs.title}</h2>
            <button onClick={close} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: '1.2rem', lineHeight: 1, cursor: 'pointer', padding: '0 0 0 .5rem', flexShrink: 0, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,.4)'}>✕</button>
          </div>

          {/* Step nav */}
          <div style={{ display: 'flex', padding: '.75rem 1.5rem', gap: '.4rem', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {steps.map((s, i) => (
              <button key={s.label} onClick={() => setStep(i)} style={{
                padding: '.35rem .9rem', borderRadius: 50, cursor: 'pointer',
                background: step === i ? `${cs.accent}22` : 'rgba(255,255,255,.04)',
                color: step === i ? cs.accent : 'rgba(255,255,255,.4)',
                fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase',
                border: `1px solid ${step === i ? cs.accent + '50' : 'rgba(255,255,255,.08)'}`,
                transition: 'all .2s',
              }}>{s.icon} {s.label}</button>
            ))}
          </div>

          {/* Content panels */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: `${cs.accent}40 transparent` }}>

            {step === 0 && (
              <div style={{ animation: 'msgIn .35s ease both' }}>
                <p style={{ fontSize: '.88rem', lineHeight: 1.9, color: 'rgba(160,160,192,.85)', marginBottom: '1.5rem' }}>{cs.overview}</p>
                <div style={{ background: `${cs.accent}0F`, border: `1px solid ${cs.accent}30`, borderRadius: 14, padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '.58rem', letterSpacing: '.16em', textTransform: 'uppercase', color: cs.accent, marginBottom: '.6rem' }}>The challenge</div>
                  <p style={{ fontSize: '.82rem', lineHeight: 1.8, color: 'rgba(160,160,192,.8)', fontStyle: 'italic' }}>{cs.challenge}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.65rem' }}>
                  {cs.metrics.map(m => (
                    <div key={m.lbl} style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${cs.accent}25`, borderRadius: 12, padding: '.85rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: cs.accent, lineHeight: 1 }}>{m.val}</div>
                      <div style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginTop: 4 }}>{m.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ animation: 'msgIn .35s ease both' }}>
                <div style={{ fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: cs.accent, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ display: 'block', width: '.75rem', height: 1, background: cs.accent }} />Design Process
                </div>
                {cs.process.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.85rem', padding: '.75rem 0', borderBottom: i < cs.process.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${cs.accent}18`, border: `1px solid ${cs.accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 700, color: cs.accent, flexShrink: 0 }}>{i+1}</div>
                    <span style={{ fontSize: '.84rem', color: 'rgba(200,200,220,.85)', paddingTop: 3 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'msgIn .35s ease both' }}>
                <div style={{ fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: cs.accent, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ display: 'block', width: '.75rem', height: 1, background: cs.accent }} />Results & Outcome
                </div>
                <div style={{ background: `linear-gradient(135deg, ${cs.accent}12, rgba(139,92,246,.08))`, border: `1px solid ${cs.accent}30`, borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '.92rem', lineHeight: 1.9, color: 'rgba(230,230,245,.9)' }}>{cs.outcome}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.65rem', marginBottom: '1.5rem' }}>
                  {cs.metrics.map(m => (
                    <div key={m.lbl} style={{ background: `${cs.accent}12`, border: `1px solid ${cs.accent}30`, borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: cs.accent, lineHeight: 1 }}>{m.val}</div>
                      <div style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{m.lbl}</div>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '.9rem', borderRadius: 50, background: `linear-gradient(135deg, ${cs.accent}, #8B5CF6)`, border: 'none', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 8px 24px ${cs.accent}40` }}>
                  View Full Case Study ↗
                </button>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div style={{ padding: '.85rem 1.5rem', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0}
              style={{ padding: '.45rem 1rem', borderRadius: 50, border: '1px solid rgba(255,255,255,.1)', background: 'none', color: step===0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)', fontSize: '.65rem', cursor: step===0 ? 'default' : 'pointer', transition: 'all .2s' }}>← Prev</button>
            <div style={{ display: 'flex', gap: 6 }}>
              {steps.map((_, i) => (
                <div key={i} onClick={() => setStep(i)} style={{ width: step===i ? 18 : 6, height: 6, borderRadius: 3, background: step===i ? cs.accent : 'rgba(255,255,255,.15)', cursor: 'pointer', transition: 'all .3s' }} />
              ))}
            </div>
            <button onClick={() => step < 2 ? setStep(s => s+1) : close()}
              style={{ padding: '.45rem 1rem', borderRadius: 50, border: `1px solid ${cs.accent}50`, background: `${cs.accent}15`, color: cs.accent, fontSize: '.65rem', cursor: 'pointer', transition: 'all .2s' }}>{step < 2 ? 'Next →' : 'Close'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export project IDs so Work.jsx can map them
export { CASE_STUDIES };
