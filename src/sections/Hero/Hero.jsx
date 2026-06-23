import { useState, useEffect, useRef, useCallback } from 'react';
import NovaCoreV2 from './NovaCoreV2';
import NovaBackground from './NovaBackground';
import { ConversationBubble } from './ConversationBubble';
import { NovaCards } from './NovaCards';
import { useNovaContext } from './useNovaContext';
import { useNovaVoiceState } from './useNovaVoiceState';
import { useNovaNavigation } from './useNovaNavigation';
import NovaPanel from '../../components/NovaPanel';
import { useNOVA } from '../../hooks/useNOVA';
import { useNOVAMemory } from '../../hooks/useNOVAMemory';
import { useFullDuplex } from '../../hooks/useFullDuplex';
import { useSTT } from '../../hooks/useSTT';
import NovaDebugPanel from '../../components/NovaDebugPanel';

const FIRST_GREETING = "Hey! I'm NOVA 👋 Shadab's AI assistant. Ask me about my projects, skills, or experience!";

export default function Hero({ novaPanelOpen }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [time,     setTime]     = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const greeted = useRef(false);
  const bumpedRef = useRef(false);

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
  const { messages, isLoading, sendMessage, markRead, addGreeting, setTopicRecorder } = useNOVA();
  const { memory, bumpVisit, recordTopic, buildGreeting } = useNOVAMemory();

  useEffect(() => { setTopicRecorder(recordTopic); }, [setTopicRecorder, recordTopic]);
  useEffect(() => {
    if (memory && !bumpedRef.current) {
      bumpedRef.current = true;
      bumpVisit();
    }
  }, [memory, bumpVisit]);

  const speakFnRef = useRef(null);
  
  // Custom send handler routing local intents first
  const handleSend = useCallback(async (text, options = {}) => {
    const { speakReply = true } = options;
    if (!text?.trim()) return null;
    setChatOpen(true);
    greeted.current = true;

    const localReply = await navigation.handleQueryIntent(text);
    if (localReply) {
      if (speakReply && speakFnRef.current) {
        speakFnRef.current(localReply);
      }
      return localReply;
    }

    const reply = await sendMessage(text);
    if (reply && speakReply && speakFnRef.current) {
      speakFnRef.current(reply);
    }
    return reply;
  }, [sendMessage]); // eslint-disable-line

  const duplex = useFullDuplex({
    onReply: (text) => handleSend(text, { speakReply: false }),
  });

  const speakReply = duplex.speakReply;
  const navigation = useNovaNavigation({ novaContext, speakReply });

  const { isListening, toggleListening, isSupported: sttSupported, lastError: sttError, mode: sttMode } = useSTT({
    onResult: (text) => handleSend(text),
    onError:  (msg)  => { addGreeting(`⚠️ ${msg}`); setChatOpen(true); },
  });

  const ds             = duplex.duplexState;
  const spokenText     = duplex.spokenText;
  const { isSpeaking, isThinking, voiceState } = useNovaVoiceState(ds);

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

  return (
    <section style={{
      position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      paddingTop: '5rem', paddingBottom: '2rem', gap: '1.2rem',
    }}>
      <style>{`
        @keyframes pulseDots { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        .pulse-dots { animation: pulseDots 1.4s infinite; }
        @media (max-width: 1024px) { .hud-card { display: none !important; } }
        .hud-card:hover {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35) !important;
        }
      `}</style>

      <NovaBackground />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 25%, rgba(7,7,15,.4) 65%, rgba(7,7,15,.78) 100%)',
      }} />

      {/* HUD Clock */}
      <div style={{
        position: 'absolute', top: '5.5rem', right: '2.5rem', zIndex: 10,
        fontFamily: "'JetBrains Mono', monospace", fontSize: '.58rem', letterSpacing: '.14em',
        color: 'rgba(167,139,250,.65)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80', animation: 'pulse 2s infinite' }} />
        {time} &nbsp;|&nbsp; NOVA.OS v2.0
      </div>

      <NovaCards mouseOffset={mouseOffset} />

      {/* Name Title */}
      <div style={{ textAlign: 'center', zIndex: 5, animation: 'fadeUp .8s .2s ease both', opacity: 0 }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
          letterSpacing: '-.02em', lineHeight: 1,
          background: 'linear-gradient(135deg, #EEEEF5 15%, #A78BFA 55%, #E8956D 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(139,92,246,.4))',
        }}>SHADAB</h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, fontSize: 'clamp(.6rem, 1.2vw, .78rem)',
          letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(160,160,192,.6)', marginTop: '.45rem',
          animation: 'shimmer 4s ease infinite',
        }}>
          AI Developer &nbsp;|&nbsp; Building Intelligent Systems
        </p>
      </div>

      {/* Neural Core + Conversational Layers */}
      <div style={{
        zIndex: 5, position: 'relative', animation: 'fadeUp .8s .4s ease both', opacity: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>
        <ConversationBubble
          text={spokenText} isSpeaking={isSpeaking} isThinking={isThinking}
          previewCard={novaContext.previewCard}
          onOpenPreview={(route, name) => navigation.executeNavigation(route, name)}
        />

        <NovaCoreV2
          duplexState={voiceState}
          onClickNode={(label) => navigation.executeNavigation(
            label === 'AI Systems' ? '/chat' : label === 'Contact' ? '/contact' : label === 'Projects' ? '/work' : '/about',
            label
          )}
          activeSubNodes={novaContext.activeSubNodes}
          highlightedNode={novaContext.highlightedNode}
          setHighlightedNode={novaContext.setHighlightedNode}
        />
      </div>

      {/* Voice Status controls */}
      <div style={{
        zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        animation: 'fadeUp .8s .65s ease both', opacity: 0, marginTop: '.5rem',
      }}>
        <button
          onPointerDown={duplex.isSupported ? duplex.handlePressStart : undefined}
          onPointerUp={duplex.isSupported ? duplex.handlePressEnd : undefined}
          onPointerLeave={duplex.isSupported ? duplex.handlePressEnd : undefined}
          onMouseDown={duplex.isSupported ? duplex.handlePressStart : undefined}
          onMouseUp={duplex.isSupported ? duplex.handlePressEnd : undefined}
          onMouseLeave={duplex.isSupported ? duplex.handlePressEnd : undefined}
          onTouchStart={duplex.isSupported ? duplex.handlePressStart : undefined}
          onTouchEnd={duplex.isSupported ? duplex.handlePressEnd : undefined}
          onClick={duplex.isSupported ? undefined : () => { setChatOpen(true); doGreet(); }}
          style={{
            width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
            border: `1.5px solid ${voiceState === 'listening' ? '#E8956D' : voiceState === 'speaking' ? '#2DD4BF' : 'rgba(232,149,109,.45)'}`,
            background: voiceState === 'listening'
              ? 'radial-gradient(circle, rgba(232,149,109,.3), rgba(180,40,40,.2))'
              : voiceState === 'speaking'
              ? 'radial-gradient(circle, rgba(45,212,191,.2), rgba(139,92,246,.15))'
              : 'radial-gradient(circle, rgba(232,149,109,.12), rgba(139,92,246,.07))',
            fontSize: voiceState === 'listening' ? '1rem' : '1.2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s',
            boxShadow: voiceState === 'listening'
              ? '0 0 0 5px rgba(232,149,109,.15), 0 0 30px rgba(232,149,109,.6)'
              : voiceState === 'speaking'
              ? '0 0 0 5px rgba(45,212,191,.15), 0 0 30px rgba(45,212,191,.4)'
              : '0 0 14px rgba(232,149,109,.2)',
            animation: voiceState === 'listening' ? 'micPulse .8s ease-in-out infinite'
                     : voiceState === 'thinking'  ? 'micPulse 1.5s ease-in-out infinite'
                     : 'none',
            userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >
          {voiceState === 'listening' ? '⏹' : voiceState === 'thinking' ? '⏳' : voiceState === 'speaking' ? '🔊' : '🎤'}
        </button>
        <span style={{
          fontSize: '.54rem', letterSpacing: '.14em', textTransform: 'uppercase',
          color: voiceState === 'idle' ? 'rgba(90,90,120,.85)' : voiceState === 'listening' ? '#E8956D' : '#2DD4BF',
          transition: 'color .3s',
        }}>
          {voiceState === 'idle'      ? 'Hold to talk'
          : voiceState === 'listening' ? 'Listening… release to send'
          : voiceState === 'thinking'  ? 'NOVA is processing…'
          : 'NOVA is speaking…'}
        </span>
      </div>

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
