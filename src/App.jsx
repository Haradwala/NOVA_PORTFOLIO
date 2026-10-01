import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Cursor from './components/Cursor';
import BootSequence from './components/BootSequence';
import Navbar from './components/Navbar';
import CinematicUniverseCanvas from './features/scene-engine/CinematicUniverseCanvas';
import { SceneProvider } from './features/scene-engine/SceneContext';
import Hero from './sections/Hero';
import Philosophy from './sections/Philosophy';
import About from './sections/About';
import Capabilities from './sections/Capabilities';
import Work from './sections/Work';
import Process from './sections/Process';
import Archive from './sections/Archive';
import Contact from './sections/Contact';
import WorkProjectPage from './pages/WorkProjectPage';

const ClientChat      = lazy(() => import('./pages/ClientChat.jsx'));
const NOVAHero        = lazy(() => import('./features/nova/NOVAHero').then(m => ({ default: m.NOVAHero })));
const NOVAHeroV2      = lazy(() => import('./features/nova-v2/NOVAHeroV2').then(m => ({ default: m.NOVAHeroV2 })));
const NOVAHeroV3      = lazy(() => import('./features/nova-v3/NOVAHeroV3').then(m => ({ default: m.NOVAHeroV3 })));

// Preserved: the nova-oe WorldEngine experiment — accessible at /world for future work
const WorldEngine = lazy(() => import('./features/nova-oe/WorldEngine'));


// ── Warp scroll indicator bar ─────────────────────────────────────────────────
function WarpBar() {
  const barRef  = useRef(null);
  const animRef = useRef(null);
  const warpVal = useRef(0);
  const target  = useRef(0);
  const lastY   = useRef(0);
  const lastT   = useRef(Date.now());
  const decayT  = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const now = Date.now();
      const dt  = Math.max(1, now - lastT.current);
      const dy  = Math.abs(window.scrollY - lastY.current);
      lastY.current = window.scrollY;
      lastT.current = now;
      target.current = Math.min(dy / dt / 1.8, 1);
      clearTimeout(decayT.current);
      decayT.current = setTimeout(() => { target.current = 0; }, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      const forced = window.__warpForced || 0;
      const t = Math.max(target.current, forced);
      warpVal.current += (t - warpVal.current) * (forced > 0 ? 0.18 : 0.09);
      const w = warpVal.current;
      if (barRef.current) {
        const opacity = Math.min(1, w * 2.5);
        const blur    = w * 8;
        const r = w > 0.6 ? '220,210,255' : w > 0.3 ? '167,139,250' : '139,92,246';
        const color = `rgba(${r},${opacity})`;
        barRef.current.style.opacity    = String(opacity);
        barRef.current.style.background = `linear-gradient(90deg, transparent, ${color}, ${color}, transparent)`;
        barRef.current.style.boxShadow  = `0 0 ${blur}px ${color}, 0 0 ${blur * 2}px ${color}`;
        barRef.current.style.height     = `${1 + w * 2}px`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animRef.current);
      clearTimeout(decayT.current);
    };
  }, []);

  return (
    <div ref={barRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 600,
      height: 1, opacity: 0, pointerEvents: 'none',
    }} />
  );
}

function PageFade({ children }) {
  const location = useLocation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div style={{ opacity: show ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      {children}
    </div>
  );
}

// ── Main Public Portfolio Shell (Hero + Philosophy + Work + About + Capabilities + Contact) ─
function PortfolioShell({ showBoot, onBootDone, novaTrigger, onAskNova }) {
  return (
    <>
      {/* Boot sequence — plays once per session before everything else */}
      {showBoot && <BootSequence onDone={onBootDone} />}
      <PageFade>
        <Routes>
          <Route path="/" element={
            <>
              {/* 01 — IDENTITY */}
              <Hero novaPanelOpen={novaTrigger} onOpenNova={onAskNova} />
              {/* 02 — PHILOSOPHY */}
              <Philosophy />
              {/* 03 — SELECTED WORK */}
              <Work />
              {/* 04 — ABOUT & CAPABILITIES */}
              <About />
              <Capabilities />
              <Process />
              <Archive />
              {/* 05 — CONTACT */}
              <Contact />
            </>
          } />
          {/* Public Portfolio Routes */}
          <Route path="/work"          element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Work /></div>} />
          <Route path="/work/:project" element={<WorkProjectPage />} />
          <Route path="/about"         element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><About /><Capabilities /></div>} />
          <Route path="/capabilities"  element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Capabilities /></div>} />
          <Route path="/skills"        element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Capabilities /></div>} />
          <Route path="/process"       element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Process /></div>} />
          <Route path="/archive"       element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Archive /></div>} />
          <Route path="/contact"       element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Contact /></div>} />
        </Routes>
      </PageFade>
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [showBoot, setShowBoot] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('nowelcome') === 'true' || params.get('skipWelcome') === 'true') return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    const standalone = ['/chat', '/world'];
    if (standalone.includes(window.location.pathname)) return false;
    return true;
  });
  const [novaTrigger, setNovaTrigger] = useState(0);
  const location = useLocation();

  const onBootDone = useCallback(() => setShowBoot(false), []);
  const onAskNova  = useCallback(() => setNovaTrigger(n => n + 1), []);

  // Standalone routes that manage their own full-screen canvas / layout
  const isStandalone = ['/chat', '/world'].includes(location.pathname);

  return (
    <SceneProvider>
      {/* Shared cinematic environment canvas */}
      {!isStandalone && <CinematicUniverseCanvas />}

      {/* Scroll warp indicator */}
      {!isStandalone && <WarpBar />}

      {/* Custom cursor */}
      <Cursor />

      {/* Public Navigation: WORK · ABOUT · CONTACT */}
      {!isStandalone && <Navbar onAskNova={onAskNova} />}

      <Suspense fallback={
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#07070F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: 'rgba(167, 139, 250, 0.75)',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#A78BFA',
            marginRight: '12px',
            display: 'inline-block',
            boxShadow: '0 0 8px #A78BFA',
          }} />
          Loading interface...
        </div>
      }>
        <Routes>
          {/* Main public portfolio */}
          <Route path="/*" element={
            <PortfolioShell
              showBoot={showBoot}
              onBootDone={onBootDone}
              novaTrigger={novaTrigger}
              onAskNova={onAskNova}
            />
          } />

          {/* Test / experiment routes */}
          <Route path="/novatest"  element={<NOVAHero />} />
          <Route path="/novatest2" element={<NOVAHeroV2 />} />
          <Route path="/novatest3" element={<NOVAHeroV3 />} />
          <Route path="/chat"      element={<ClientChat />} />

          {/* WorldEngine experiment — preserved, not active on / */}
          <Route path="/world"     element={<WorldEngine />} />
        </Routes>
      </Suspense>
    </SceneProvider>
  );
}
