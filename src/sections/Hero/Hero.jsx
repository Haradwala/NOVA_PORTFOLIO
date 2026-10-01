import { useState, useEffect, useRef, useCallback } from 'react';
import NovaCoreV2 from './NovaCoreV2';
import { ConversationBubble } from './ConversationBubble';
import { NovaCards } from './NovaCards';
import { useNovaContext } from './useNovaContext';
import { useNovaVoiceState } from './useNovaVoiceState';
import { useNovaNavigation, detectReferencedSection } from './useNovaNavigation';
import NovaPanel from '../../components/NovaPanel';
import { useNOVA } from '../../hooks/useNOVA';
import { useNOVAMemory } from '../../hooks/useNOVAMemory';
import { useFullDuplex } from '../../hooks/useFullDuplex';
import { useSTT } from '../../hooks/useSTT';
import NovaDebugPanel from '../../components/NovaDebugPanel';
import { scrollToSection, highlightSection } from '../../utils/sectionRegistry';
import { useScene } from '../../features/scene-engine/SceneContext';

const FIRST_GREETING = "Hey! I'm NOVA 👋 Shadab's AI assistant. Ask me about my projects, skills, or experience!";

export default function Hero({ novaPanelOpen, onOpenNova, onEnterCore }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [time,     setTime]     = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const greeted    = useRef(false);
  const bumpedRef  = useRef(false);
  const sectionRef = useRef(null);

  // Register this section as 'arrival' in the SceneContext for scroll progress tracking
  const { registerSection } = useScene();
  useEffect(() => {
    registerSection('arrival', sectionRef.current);
    return () => registerSection('arrival', null);
  }, [registerSection]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setShowDebug(params.get('debug') === 'true');
    }
  }, []);

  // Parallax cursor tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => {
      setMouseOffset({
        x: (e.clientX / window.innerWidth - 0.5),
        y: (e.clientY / window.innerHeight - 0.5)
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Context & Database lookups
  const novaContext = useNovaContext();
  const { messages, isLoading, sendMessage, addExchange, markRead, addGreeting, setTopicRecorder } = useNOVA();
  const { memory, bumpVisit, recordTopic, buildGreeting } = useNOVAMemory();

  useEffect(() => { setTopicRecorder(recordTopic); }, [setTopicRecorder, recordTopic]);
  useEffect(() => {
    if (memory && !bumpedRef.current) {
      bumpedRef.current = true;
      bumpVisit();
    }
  }, [memory, bumpVisit]);

  const speakFnRef = useRef(null);
  const navigationRef = useRef(null);
  const lastReferencedSectionRef = useRef(null);
  
  // Custom send handler routing local intents first
  const handleSend = useCallback(async (text, options = {}) => {
    const { speakReply = true } = options;
    if (!text?.trim()) return null;
    setInteracted(true);
    setChatOpen(true);
    greeted.current = true;

    const localReply = await navigationRef.current?.handleQueryIntent(text);
    if (localReply) {
      addExchange(text, localReply);
      if (speakReply && speakFnRef.current) {
        speakFnRef.current(localReply);
      }
      return localReply;
    }

    const reply = await sendMessage(text);
    if (reply) {
      const section = detectReferencedSection(reply);
      if (section) {
        lastReferencedSectionRef.current = section;
      }

      if (speakReply && speakFnRef.current) {
        speakFnRef.current(reply);
      }
    }
    return reply;
  }, [sendMessage, addExchange]);

  const duplex = useFullDuplex({
    onReply: (text) => handleSend(text, { speakReply: false }),
  });

  const speakReply = duplex.speakReply;
  const navigation = useNovaNavigation({
    novaContext,
    speakReply,
    lastReferencedSectionRef,
  });
  navigationRef.current = navigation;

  const { isListening, toggleListening, isSupported: sttSupported, lastError: sttError, mode: sttMode } = useSTT({
    onResult: (text) => handleSend(text),
    onError:  (msg)  => { addGreeting(`⚠️ ${msg}`); setChatOpen(true); },
  });

  const ds             = duplex.duplexState;
  const spokenText     = duplex.spokenText;
  const { isSpeaking, isThinking, voiceState } = useNovaVoiceState(ds);

  useEffect(() => {
    if (voiceState !== 'idle') {
      setInteracted(true);
    }
  }, [voiceState]);

  useEffect(() => {
    const iv = setInterval(() =>
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })), 1000);
    return () => clearInterval(iv);
  }, []);

  const doGreet = useCallback(() => {
    if (greeted.current) return;
    greeted.current = true;
    setTimeout(() => {
      const text = (memory ? buildGreeting(memory) : null) || FIRST_GREETING;
      addGreeting(text);
      duplex.speakReply(text);
    }, 350);
  }, [memory, buildGreeting, addGreeting, duplex]);

  useEffect(() => {
    if (novaPanelOpen > 0) { setChatOpen(true); doGreet(); }
  }, [novaPanelOpen]); // eslint-disable-line

  useEffect(() => {
    speakFnRef.current = duplex.speakReply;
  }, [duplex.speakReply]);

  // ENTER NOVA interaction: pulse the core + scroll to about
  const handleEnterNova = useCallback(() => {
    // Dispatch pulse event for NovaCoreV2 to react to
    window.dispatchEvent(new CustomEvent('nova-enter'));
    // Brief delay then scroll
    setTimeout(() => {
      const aboutEl = document.getElementById('section-about') || document.querySelector('[data-section="about"]');
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 320);
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="arrival"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '5rem',
        paddingBottom: '3rem',
      }}
    >
      <style>{`
        @keyframes pulseDots { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes novaPulseRing {
          0%   { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        @keyframes heroNameReveal {
          from { opacity: 0; transform: translateY(28px) skewY(1deg); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes heroLineReveal {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes heroCoreReveal {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .hero-enter-btn:hover {
          background: rgba(139,92,246,0.22) !important;
          box-shadow: 0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.12) !important;
          border-color: rgba(167,139,250,0.5) !important;
        }
        .hero-view-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.18) !important;
        }
        @media (max-width: 900px) {
          .hero-grid { flex-direction: column-reverse !important; align-items: center !important; padding: 1rem 1.2rem !important; gap: 2.5rem !important; }
          .hero-left  { align-items: center !important; text-align: center !important; max-width: 100% !important; width: 100% !important; }
          .hero-name  { font-size: clamp(1.65rem, 8vw, 3.2rem) !important; letter-spacing: -0.02em !important; }
          .hero-headline { font-size: clamp(1.05rem, 4.2vw, 1.8rem) !important; }
          .hero-right { width: min(88vw, 340px) !important; height: min(75vw, 280px) !important; margin-bottom: 2rem !important; }
          .hero-hud-bottom { display: none !important; }
        }
      `}</style>

      {/* Radial vignette over the background canvas */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 80% 80% at 60% 50%, transparent 20%, rgba(7,7,15,.35) 60%, rgba(7,7,15,.8) 100%)',
      }} />

      {/* ── Two-column hero grid ── */}
      <div
        className="hero-grid"
        style={{
          position: 'relative', zIndex: 5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(2rem, 6vw, 7rem)',
          gap: 'clamp(2rem, 5vw, 6rem)',
        }}
      >
        {/* ──── LEFT COLUMN — Editorial text ──── */}
        <div
          className="hero-left"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            gap: '1.6rem', flex: '1 1 auto', maxWidth: '620px',
          }}
        >
          {/* System status tag */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            animation: 'heroLineReveal 0.5s 0.1s ease both', opacity: 0,
          }}>
            <span className="system-tag">SYSTEM STATUS: ONLINE</span>
          </div>

          {/* SHADAB HARADWALA — display headline */}
          <div style={{ animation: 'heroNameReveal 0.7s 0.25s ease both', opacity: 0 }}>
            <h1
              className="hero-name"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 6.8vw, 7.2rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              SHADAB<br />
              <span style={{
                background: 'linear-gradient(135deg, #EEEEF5 10%, #A78BFA 55%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 0 32px rgba(139,92,246,0.35))',
              }}>HARADWALA</span>
            </h1>
          </div>

          {/* Role subtitle — 3 pillars */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.68rem, 1.4vw, 0.85rem)',
            letterSpacing: '0.22em',
            color: 'rgba(167,139,250,0.85)',
            textTransform: 'uppercase',
            animation: 'heroLineReveal 0.5s 0.4s ease both', opacity: 0,
          }}>
            AI ENGINEER &nbsp;·&nbsp; SOFTWARE ENGINEER &nbsp;·&nbsp; SYSTEM BUILDER
          </div>

          {/* Main editorial headline */}
          <div style={{ animation: 'heroLineReveal 0.6s 0.55s ease both', opacity: 0 }}>
            <p
              className="hero-headline"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(1.4rem, 3.4vw, 2.7rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
                margin: 0,
                maxWidth: '560px',
              }}
            >
              I BUILD INTELLIGENT SOFTWARE SYSTEMS,<br />
              <span style={{ color: 'var(--violet2)' }}>FROM FINANCIAL ENGINES TO AUTONOMOUS AI.</span>
            </p>
          </div>

          {/* Supporting copy */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.85rem, 1.4vw, 1.02rem)',
            color: 'rgba(160,160,192,0.85)',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: 0,
            animation: 'heroLineReveal 0.5s 0.7s ease both', opacity: 0,
          }}>
            The portfolio is the visible layer. My engineering systems are the hidden layer behind it.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.9rem',
            animation: 'heroLineReveal 0.5s 0.85s ease both', opacity: 0,
          }}>
            {/* EXPLORE MY WORK — primary visible action */}
            <button
              className="hero-view-btn"
              onClick={() => {
                const workEl = document.getElementById('work') || document.getElementById('section-work') || document.querySelector('[data-section="work"]');
                if (workEl) workEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label="Explore My Work — scroll to selected work"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.9rem 2rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '4px',
                color: '#EEEEF5',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.74rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
              }}
            >
              EXPLORE MY WORK
            </button>

            {/* ENTER THE ENGINEERING CORE — secondary intriguing depth action */}
            <button
              className="hero-enter-btn"
              onClick={onEnterCore}
              aria-label="Enter the Engineering Core — transition to hidden systems layer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.9rem 2rem',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(56,189,248,0.18) 100%)',
                border: '1px solid rgba(167,139,250,0.5)',
                borderRadius: '4px',
                color: 'var(--text)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 25px rgba(139,92,246,0.25)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8', flexShrink: 0 }} />
              ENTER THE ENGINEERING CORE →
            </button>
          </div>

          {/* Bottom scroll indicator — desktop only */}
          <div
            className="hero-hud-bottom"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem', marginTop: '1rem',
              animation: 'heroLineReveal 0.5s 1.1s ease both', opacity: 0,
            }}
          >
            <div style={{
              width: 1, height: 36,
              background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.6))',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.55rem', letterSpacing: '0.2em',
              color: 'rgba(139,92,246,0.45)', textTransform: 'uppercase',
            }}>
              SCROLL TO EXPLORE
            </span>
          </div>
        </div>

        {/* ──── RIGHT COLUMN — NOVA Core ──── */}
        <div
          className="hero-right"
          style={{
            position: 'relative',
            width: 'clamp(300px, 38vw, 560px)',
            height: 'clamp(300px, 38vw, 560px)',
            flexShrink: 0,
            animation: 'heroCoreReveal 0.9s 0.3s ease both', opacity: 0,
          }}
        >
          {/* HUD frame corners around the core */}
          {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => {
            const isTop    = corner.startsWith('top');
            const isLeft   = corner.endsWith('Left');
            return (
              <div key={corner} style={{
                position: 'absolute',
                [isTop ? 'top' : 'bottom']: '8%',
                [isLeft ? 'left' : 'right']: '8%',
                width: 20, height: 20,
                borderTop:    isTop    ? '1px solid rgba(139,92,246,0.35)' : 'none',
                borderBottom: !isTop   ? '1px solid rgba(139,92,246,0.35)' : 'none',
                borderLeft:   isLeft   ? '1px solid rgba(139,92,246,0.35)' : 'none',
                borderRight:  !isLeft  ? '1px solid rgba(139,92,246,0.35)' : 'none',
                pointerEvents: 'none', zIndex: 10,
              }} />
            );
          })}

          {/* NOVA Core label — top right */}
          <div style={{
            position: 'absolute', top: 'calc(8% - 20px)', right: '8%', zIndex: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.52rem', letterSpacing: '0.18em',
            color: 'rgba(139,92,246,0.45)', textTransform: 'uppercase',
          }}>
            NOVA CORE v2
          </div>

          {/* Neural link status — bottom left */}
          <div style={{
            position: 'absolute', bottom: 'calc(8% - 18px)', left: '8%', zIndex: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.5rem', letterSpacing: '0.15em',
            color: 'rgba(45,212,191,0.55)', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 5px #4ADE80' }} />
            NEURAL LINK: ACTIVE
          </div>

          {/* HUD Clock */}
          <div style={{
            position: 'absolute', bottom: 'calc(8% - 18px)', right: '8%', zIndex: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.5rem', letterSpacing: '0.12em',
            color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase',
          }}>
            {time}
          </div>

          {/* Conversation + NOVA Core (both untouched) */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <ConversationBubble
              text={spokenText} isSpeaking={isSpeaking} isThinking={isThinking}
              previewCard={novaContext.previewCard}
              onOpenPreview={(route, name) => navigation.executeNavigation(route, name)}
            />
            <NovaCoreV2
              duplexState={voiceState}
              onCoreClick={duplex.isSupported
                ? duplex.handleTap
                : () => { setChatOpen(true); doGreet(); }
              }
              onClickNode={(label) => {
                novaContext.setHighlightedNode(label);
                setTimeout(() => {
                  novaContext.setHighlightedNode((current) => (current === label ? null : current));
                }, 3000);
                window.dispatchEvent(new CustomEvent('nova-nav', { detail: { label } }));
                setTimeout(() => {
                  if (label === 'About') {
                    scrollToSection('about');
                  } else if (label === 'Skills') {
                    scrollToSection('skills');
                    highlightSection('skills');
                  } else if (label === 'Projects') {
                    scrollToSection('projects');
                  } else if (label === 'Contact') {
                    scrollToSection('contact');
                  }
                }, 300);
              }}
              activeSubNodes={novaContext.activeSubNodes}
              highlightedNode={novaContext.highlightedNode}
              setHighlightedNode={novaContext.setHighlightedNode}
            />
          </div>
        </div>
      </div>

      {/* ── NOVA Panel (chat) ── */}
      <NovaPanel
        messages={messages} isLoading={isLoading} onSend={handleSend} onMarkRead={markRead}
        isSpeaking={isSpeaking} isListening={isListening || ds === 'listening'}
        onToggleMic={sttSupported ? toggleListening : () => { addGreeting('⚠️ Voice input needs Chrome.'); setChatOpen(true); }}
        isOpen={chatOpen} onToggle={() => setChatOpen(c => !c)}
      />
      {showDebug && <NovaDebugPanel />}
    </section>
  );
}


