import { useState, useEffect, useRef, useCallback } from 'react';
import { useNovaContext } from '../sections/Hero/useNovaContext';
import { useNovaVoiceState } from '../sections/Hero/useNovaVoiceState';
import { useNovaNavigation, detectReferencedSection } from '../sections/Hero/useNovaNavigation';
import { useNOVA } from '../hooks/useNOVA';
import { useNOVAMemory } from '../hooks/useNOVAMemory';
import { useFullDuplex } from '../hooks/useFullDuplex';
import { useSTT } from '../hooks/useSTT';
import NovaCoreV2 from '../sections/Hero/NovaCoreV2';

const FIRST_GREETING = "What can I help you with? Ask about Shadab's software systems, experience, or engineering philosophy.";

export default function NovaFloatingAssistant({ novaTrigger = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const greeted = useRef(false);
  const bumpedRef = useRef(false);
  const centerContentRef = useRef(null);
  const inputRef = useRef(null);

  // Resize listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Existing NOVA hooks
  const novaContext = useNovaContext();
  const {
    messages,
    isLoading,
    sendMessage,
    addExchange,
    addGreeting,
    setTopicRecorder,
  } = useNOVA();
  const { memory, bumpVisit, recordTopic, buildGreeting } = useNOVAMemory();

  useEffect(() => {
    setTopicRecorder(recordTopic);
  }, [setTopicRecorder, recordTopic]);

  useEffect(() => {
    if (memory && !bumpedRef.current) {
      bumpedRef.current = true;
      bumpVisit();
    }
  }, [memory, bumpVisit]);

  const speakFnRef = useRef(null);
  const navigationRef = useRef(null);
  const lastReferencedSectionRef = useRef(null);

  const handleSend = useCallback(
    async (text, options = {}) => {
      const { speakReply = true } = options;
      if (!text?.trim()) return null;
      setIsOpen(true);
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
    },
    [sendMessage, addExchange]
  );

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

  const { isListening, toggleListening, isSupported: sttSupported } = useSTT({
    onResult: (text) => handleSend(text),
    onError: (msg) => {
      addGreeting(`⚠️ ${msg}`);
      setIsOpen(true);
    },
  });

  const ds = duplex.duplexState;
  const { isSpeaking, isThinking } = useNovaVoiceState(ds);

  useEffect(() => {
    speakFnRef.current = duplex.speakReply;
  }, [duplex.speakReply]);

  const doGreet = useCallback(() => {
    if (greeted.current) return;
    greeted.current = true;
    setTimeout(() => {
      const text = (memory ? buildGreeting(memory) : null) || FIRST_GREETING;
      addGreeting(text);
      duplex.speakReply(text);
    }, 350);
  }, [memory, buildGreeting, addGreeting, duplex]);

  // Open if triggered externally from Navbar ASK NOVA
  useEffect(() => {
    if (novaTrigger > 0) {
      setIsOpen(true);
      doGreet();
    }
  }, [novaTrigger, doGreet]);

  // Handle ESC and click-outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Duplex state for the orb
  const currentDuplexState = isListening
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  // Toggle open / voice
  const handleOpenClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      doGreet();
      if (sttSupported && !isListening) {
        toggleListening();
      }
    } else {
      if (sttSupported) {
        toggleListening();
      }
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const t = inputVal.trim();
    if (!t) return;
    setInputVal('');
    handleSend(t);
  };

  // Find latest response from NOVA
  const latestNovaMsg = [...messages].reverse().find((m) => m.role === 'nova');
  const latestResponseText = latestNovaMsg
    ? latestNovaMsg.content || latestNovaMsg.text
    : null;

  return (
    <>
      <style>{`
        @keyframes novaFloatBreath {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes novaCenterFadeIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes novaOverlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── 1. Resting Floating Button (Bottom-Right) ── */}
      {!isOpen && (
        <div
          className="nova-floating-button"
          onClick={handleOpenClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenClick();
            }
          }}
          title="Chat with NOVA"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            width: isMobile ? 64 : 78,
            height: isMobile ? 64 : 78,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
            boxShadow: hovered
              ? '0 0 35px rgba(167, 139, 250, 0.4), 0 0 70px rgba(56, 189, 248, 0.2)'
              : '0 0 24px rgba(139, 92, 246, 0.25), 0 0 45px rgba(56, 189, 248, 0.1)',
            animation: 'novaFloatBreath 4.5s ease-in-out infinite',
            background: 'radial-gradient(circle, rgba(20, 20, 36, 0.85) 0%, rgba(10, 10, 20, 0.95) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.28)',
          }}
        >
          {/* Living 3D Orb Inside Button */}
          <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
            <NovaCoreV2
              duplexState={currentDuplexState}
              size={isMobile ? 62 : 76}
              showStateSubtitle={false}
            />
          </div>

          {/* Tiny Hover Label */}
          {hovered && (
            <div
              style={{
                position: 'absolute',
                top: '-26px',
                right: '50%',
                transform: 'translateX(50%)',
                background: 'rgba(10, 10, 20, 0.9)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                borderRadius: '4px',
                padding: '2px 7px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                color: '#C4B5FD',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              NOVA
            </div>
          )}
        </div>
      )}

      {/* ── 2. Full-Viewport Overlay with Centered NOVA Experience ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="NOVA Assistant"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 10, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'novaOverlayFadeIn 0.3s ease both',
          }}
        >
          {/* Centered Assistant Content */}
          <div
            ref={centerContentRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '92vw',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              animation: 'novaCenterFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
              pointerEvents: 'auto',
            }}
          >
            {/* Top Bar: NOVA identifier + Subtle Close */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '420px',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.22em',
                  color: 'rgba(167, 139, 250, 0.85)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background:
                      currentDuplexState === 'listening'
                        ? '#E8956D'
                        : currentDuplexState === 'thinking'
                        ? '#2DD4BF'
                        : currentDuplexState === 'speaking'
                        ? '#38BDF8'
                        : '#A78BFA',
                    boxShadow: `0 0 8px ${
                      currentDuplexState === 'listening'
                        ? '#E8956D'
                        : currentDuplexState === 'speaking'
                        ? '#38BDF8'
                        : '#A78BFA'
                    }`,
                  }}
                />
                NOVA
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close (ESC)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(160, 160, 192, 0.5)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(160, 160, 192, 0.5)')
                }
              >
                ✕ ESC
              </button>
            </div>

            {/* Centered Large Living NOVA Orb */}
            <div
              onClick={handleOpenClick}
              role="button"
              tabIndex={0}
              title={isListening ? 'Listening… tap to pause' : 'Tap to speak'}
              style={{
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              <NovaCoreV2
                duplexState={currentDuplexState}
                size={isMobile ? 220 : 270}
                isActive={true}
              />
            </div>

            {/* State Whisper */}
            {isListening && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.64rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#E8956D',
                  marginBottom: '0.5rem',
                }}
              >
                Listening…
              </div>
            )}
            {isThinking && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.64rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#2DD4BF',
                  marginBottom: '0.5rem',
                }}
              >
                Thinking…
              </div>
            )}

            {/* Editorial Caption Spoken Response */}
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(0.95rem, 1.4vw, 1.08rem)',
                lineHeight: 1.65,
                color: 'rgba(240, 240, 250, 0.95)',
                marginBottom: '1.25rem',
                maxWidth: '460px',
                textAlign: 'center',
                minHeight: '2.8rem',
              }}
            >
              {latestResponseText
                ? `“${latestResponseText}”`
                : isListening
                ? '“Listening to your voice… speak now.”'
                : '“What can I help you with?”'}
            </div>

            {/* Minimal Discreet Text Input Fallback */}
            <form
              onSubmit={handleInputSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                maxWidth: '380px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
                paddingBottom: '0.4rem',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type or tap orb to speak…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.82rem',
                }}
              />
              {sttSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop listening' : 'Speak'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isListening ? '#E8956D' : 'rgba(160, 160, 192, 0.6)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: inputVal.trim() ? '#A78BFA' : 'rgba(255, 255, 255, 0.25)',
                  cursor: inputVal.trim() ? 'pointer' : 'default',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  padding: '2px 4px',
                }}
              >
                ASK →
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
