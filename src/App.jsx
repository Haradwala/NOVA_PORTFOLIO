import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Cursor from './components/Cursor';
import Welcome from './components/Welcome';
import Navbar from './components/Navbar';
import UniverseCanvas from './components/UniverseCanvas';
import Hero from './sections/Hero';
import About from './sections/About';
import Work from './sections/Work';
import Contact from './sections/Contact';

const ClientChat = lazy(() => import('./pages/ClientChat.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const NOVAHero = lazy(() => import('./features/nova/NOVAHero').then(m => ({ default: m.NOVAHero })));
const NOVAHeroV2 = lazy(() => import('./features/nova-v2/NOVAHeroV2').then(m => ({ default: m.NOVAHeroV2 })));
const NOVAHeroV3 = lazy(() => import('./features/nova-v3/NOVAHeroV3').then(m => ({ default: m.NOVAHeroV3 })));


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

function PortfolioShell({ showWelcome, onWelcomeDone, novaTrigger, onAskNova }) {
  return (
    <>
      {showWelcome && <Welcome onDone={onWelcomeDone} />}
      <PageFade>
        <Routes>
          <Route path="/" element={
            <>
              <Hero novaPanelOpen={novaTrigger} onOpenNova={onAskNova} />
              <About />
              <Work />
              <Contact />
            </>
          } />
          <Route path="/about"   element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><About /></div>} />
          <Route path="/work"    element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Work /></div>} />
          <Route path="/contact" element={<div style={{ minHeight:'100vh', paddingTop:'5rem' }}><Contact /></div>} />
        </Routes>
      </PageFade>
    </>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [novaTrigger, setNovaTrigger] = useState(0);
  const location = useLocation();

  const onWelcomeDone = useCallback(() => setShowWelcome(false), []);
  const onAskNova     = useCallback(() => setNovaTrigger(n => n + 1), []);

  const isStandalone = ['/chat', '/admin'].includes(location.pathname);

  return (
    <>
      {!isStandalone && <UniverseCanvas />}
      {!isStandalone && <WarpBar />}
      <Cursor />

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
          userSelect: 'none'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#A78BFA',
            marginRight: '12px',
            display: 'inline-block',
            boxShadow: '0 0 8px #A78BFA'
          }} />
          Loading interface...
        </div>
      }>
        <Routes>
          <Route path="/novatest" element={<NOVAHero />} />
          <Route path="/novatest2" element={<NOVAHeroV2 />} />
          <Route path="/novatest3" element={<NOVAHeroV3 />} />
          <Route path="/chat"  element={<ClientChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/*" element={
            <PortfolioShell
              showWelcome={showWelcome}
              onWelcomeDone={onWelcomeDone}
              novaTrigger={novaTrigger}
              onAskNova={onAskNova}
            />
          } />
        </Routes>
      </Suspense>
    </>
  );
}
