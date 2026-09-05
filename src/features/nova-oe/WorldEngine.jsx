import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Command, Mic } from 'lucide-react';
import PortalScene from './components/PortalScene';
import NovaGlassPanel from './components/NovaGlassPanel';
import './world-engine.css';

const commandList = [
  { id: 'forge', label: 'forge', keyHint: 'F' },
  { id: 'projects', label: 'projects', keyHint: 'P' },
  { id: 'skills', label: 'skills', keyHint: 'S' },
  { id: 'contact', label: 'contact', keyHint: 'C' },
  { id: 'story', label: 'story', keyHint: '' },
];

function routeQuery(input) {
  const q = input.toLowerCase().trim();
  if (/forge|operat|engine|arch/.test(q)) return 'forge';
  if (/project|work|built|vault/.test(q)) return 'projects';
  if (/skill|tech|stack|discip/.test(q)) return 'skills';
  if (/contact|email|hire|reach/.test(q)) return 'contact';
  if (/story|about|shadab|bio/.test(q)) return 'story';
  return 'forge';
}

export default function WorldEngine() {
  const [activeWorld, setActiveWorld] = useState(null);
  const [query, setQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTrigger, setPulseTrigger] = useState(false);

  const openWorld = useCallback((targetWorld) => {
    setPulseTrigger(true);
    setActiveWorld(targetWorld);
    setTimeout(() => setPulseTrigger(false), 600);
  }, []);

  const closeWorld = useCallback(() => {
    setActiveWorld(null);
  }, []);

  // Global Keyboard Shortcuts (F, P, S, C, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.target.blur();
          closeWorld();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'F') {
        e.preventDefault();
        openWorld('forge');
      } else if (key === 'P') {
        e.preventDefault();
        openWorld('projects');
      } else if (key === 'S') {
        e.preventDefault();
        openWorld('skills');
      } else if (key === 'C') {
        e.preventDefault();
        openWorld('contact');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeWorld();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openWorld, closeWorld]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      openWorld(routeQuery(query));
      setQuery('');
    }
  };

  return (
    <main className={`nova-portal ${activeWorld ? 'has-panel' : ''}`}>
      {/* 3D Viewport Scene */}
      <div className="portal-scene">
        <PortalScene
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          activeWorld={activeWorld}
          pulseTrigger={pulseTrigger}
          onSelectNode={openWorld}
        />
      </div>

      {/* Atmospheric Vignette Layer */}
      <div className="portal-vignette" />

      {/* Minimal Top Header Bar */}
      <header className="portal-header">
        <div className="portal-brand">
          <span className="brand-dot" />
          NOVA
        </div>
        <div className="portal-subtitle">
          Neural Operating Virtual Architecture
        </div>
        <div className="portal-status" aria-label="System status online">
          <span className="status-dot" />
          System Online
        </div>
      </header>

      {/* Centered Subtitle below Sphere */}
      <section className="portal-idle">
        <p>Enter the NOVA universe</p>
        <span>Touch the sphere or start a conversation</span>
      </section>

      {/* Bottom Command Console */}
      <section className="portal-console" aria-label="NOVA command console">
        <form onSubmit={handleSubmit}>
          <span className="console-prompt">$ NOVA <b>|</b></span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything…"
            aria-label="NOVA command prompt"
          />
          <button type="button" aria-label="Voice input mode">
            <Mic size={15} />
          </button>
          <button type="submit" className="portal-send" aria-label="Execute command">
            <ArrowUpRight size={17} />
          </button>
        </form>

        {/* Shortcut Commands Row */}
        <div className="portal-commands" role="toolbar" aria-label="Command shortcuts">
          {commandList.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => openWorld(cmd.id)}
              className="portal-cmd-btn"
              aria-label={`Open ${cmd.label} panel (${cmd.keyHint ? `Press ${cmd.keyHint}` : 'Click'})`}
            >
              {cmd.keyHint && <span className="cmd-badge">[{cmd.keyHint}]</span>}
              <span className="cmd-name">{cmd.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="portal-footer">
        <span><Command size={12} /> NOVA OS / 2026</span>
        <span>Interactive AI Operating System</span>
      </footer>

      {/* Accessible Glassmorphism Panel Overlay */}
      <AnimatePresence>
        {activeWorld && (
          <NovaGlassPanel
            activeWorld={activeWorld}
            onClose={closeWorld}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
