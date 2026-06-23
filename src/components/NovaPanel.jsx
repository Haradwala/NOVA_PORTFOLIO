import { useRef, useEffect, useState } from 'react';
import TypingText from './TypingText';

const QUICK = [
  "Shadab's background?",
  "Best projects?",
  "Technical skills?",
  "Available to hire?",
];

export default function NovaPanel({
  messages, isLoading, onSend, onMarkRead,
  isSpeaking, isListening, onToggleMic,
  isOpen, onToggle,
}) {
  const msgsRef  = useRef(null);
  const inputRef = useRef(null);
  const [val, setVal] = useState('');
  const [fabHov, setFabHov] = useState(false);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    setVal('');
    onSend(t);
  };

  const latestNovaIdx = [...messages]
    .map((m, i) => (m.role === 'nova' ? i : -1))
    .filter(i => i > -1)
    .pop();

  const panelState = isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle';

  const fabGlow = isListening
    ? '0 0 0 4px rgba(232,149,109,.2), 0 8px 32px rgba(232,149,109,.5)'
    : isSpeaking
    ? '0 0 0 4px rgba(139,92,246,.2), 0 8px 32px rgba(139,92,246,.5)'
    : '0 0 0 2px rgba(139,92,246,.15), 0 8px 28px rgba(139,92,246,.35)';

  return (
    <>
      <style>{`
        @keyframes fabRing {
          0%   { transform: scale(1);    opacity: .6; }
          50%  { transform: scale(1.22); opacity: 0;  }
          100% { transform: scale(1);    opacity: .6; }
        }
        @keyframes panelSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes panelSlideOut {
          from { opacity: 1; transform: translateY(0)    scale(1);   }
          to   { opacity: 0; transform: translateY(16px) scale(.97); }
        }
        @keyframes speakOrb {
          0%,100% { transform: scale(1);    }
          50%      { transform: scale(1.12); }
        }
        @keyframes listenOrb {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(232,149,109,0);   }
          50%      { transform: scale(1.09); box-shadow: 0 0 0 8px rgba(232,149,109,0.15); }
        }
      `}</style>

      {/* ── FAB Button ─────────────────────────── */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setFabHov(true)}
        onMouseLeave={() => setFabHov(false)}
        title="Chat with NOVA"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          width: 62, height: 62, borderRadius: '50%', border: 'none',
          background: isListening
            ? 'linear-gradient(135deg,#E8956D,#C0392B)'
            : 'linear-gradient(135deg,#E8956D,#8B5CF6)',
          cursor: 'pointer',
          boxShadow: fabHov
            ? '0 0 0 4px rgba(139,92,246,.3), 0 12px 44px rgba(139,92,246,.6)'
            : fabGlow,
          transform: fabHov ? 'scale(1.08)' : 'scale(1)',
          transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2,
        }}
      >
        {/* Ripple ring */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `1.5px solid ${isListening ? 'rgba(232,149,109,.5)' : 'rgba(139,92,246,.4)'}`,
          animation: 'fabRing 2.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Icon */}
        {isListening ? (
          /* animated mic bars */
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 22 }}>
            {[10, 18, 14, 22, 12, 16].map((h, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2, background: '#fff',
                height: h,
                animation: `voiceBar ${.5 + i * .08}s ${i * .09}s ease-in-out infinite`,
                transformOrigin: 'bottom',
              }} />
            ))}
          </div>
        ) : isSpeaking ? (
          <div style={{ fontSize: '1.5rem', animation: 'speakOrb .6s ease-in-out infinite' }}>✦</div>
        ) : (
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>✦</div>
        )}

        {/* Unread dot when closed */}
        {!isOpen && messages.length > 0 && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 10, height: 10, borderRadius: '50%',
            background: '#4ADE80',
            boxShadow: '0 0 6px #4ADE80',
            border: '1.5px solid rgba(7,7,15,.8)',
          }} />
        )}
      </button>

      {/* ── Panel ─────────────────────────────── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 999,
          width: 380, maxWidth: 'calc(100vw - 2rem)',
          background: 'rgba(14,12,30,.92)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: `1px solid ${
            panelState === 'listening' ? 'rgba(232,149,109,.35)'
            : panelState === 'speaking' ? 'rgba(139,92,246,.4)'
            : 'rgba(139,92,246,.22)'
          }`,
          borderRadius: 22,
          boxShadow: `
            0 32px 80px rgba(0,0,0,.6),
            0 0 0 1px rgba(255,255,255,.04),
            inset 0 1px 0 rgba(255,255,255,.05),
            ${panelState === 'listening' ? '0 0 40px rgba(232,149,109,.15)' : '0 0 40px rgba(139,92,246,.12)'}
          `,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          maxHeight: 560,
          animation: 'panelSlideIn .3s cubic-bezier(.34,1.56,.64,1) both',
          transition: 'border-color .4s',
        }}>

          {/* Header */}
          <div style={{
            padding: '.9rem 1.1rem',
            background: 'linear-gradient(135deg,rgba(139,92,246,.12),rgba(232,149,109,.06))',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {/* NOVA avatar orb */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#E8956D,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700,
              boxShadow: isSpeaking
                ? '0 0 0 3px rgba(139,92,246,.3), 0 0 20px rgba(139,92,246,.5)'
                : isListening
                ? '0 0 0 3px rgba(232,149,109,.3), 0 0 20px rgba(232,149,109,.5)'
                : '0 0 12px rgba(139,92,246,.4)',
              animation: isSpeaking ? 'speakOrb .5s ease-in-out infinite' : isListening ? 'listenOrb .8s ease-in-out infinite' : 'none',
            }}>✦</div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                fontSize: '.85rem', color: 'var(--text)',
              }}>NOVA</div>
              <div style={{
                fontSize: '.54rem', letterSpacing: '.1em', textTransform: 'uppercase',
                color: panelState === 'listening' ? 'var(--rose)' : panelState === 'speaking' ? 'var(--violet2)' : '#4ADE80',
                display: 'flex', alignItems: 'center', gap: 4, transition: 'color .3s',
              }}>
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: panelState === 'listening' ? 'var(--rose)' : panelState === 'speaking' ? 'var(--violet2)' : '#4ADE80',
                  boxShadow: `0 0 4px ${panelState === 'listening' ? 'var(--rose)' : panelState === 'speaking' ? 'var(--violet2)' : '#4ADE80'}`,
                  transition: 'all .3s',
                }} />
                {panelState === 'listening' ? 'Listening...' : panelState === 'speaking' ? 'Speaking...' : 'AI Assistant • Online'}
              </div>
            </div>

            {/* Mic btn */}
            <button
              onClick={onToggleMic}
              title={isListening ? 'Stop' : 'Voice input'}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isListening ? 'rgba(232,149,109,.2)' : 'rgba(139,92,246,.12)',
                border: `1px solid ${isListening ? 'rgba(232,149,109,.5)' : 'rgba(139,92,246,.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isListening ? 'var(--rose)' : 'var(--violet2)',
                fontSize: '.8rem', transition: 'all .2s',
                animation: isListening ? 'micPulse .8s ease-in-out infinite' : 'none',
              }}
            >{isListening ? '⏹' : '🎤'}</button>

            <button
              onClick={onToggle}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1, padding: '2px 4px', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >✕</button>
          </div>

          {/* Listening bar */}
          {isListening && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.6rem',
              padding: '.45rem 1rem',
              background: 'rgba(232,149,109,.07)',
              borderBottom: '1px solid rgba(232,149,109,.12)',
              fontSize: '.68rem', color: 'var(--rose2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
                {[6, 14, 10, 18, 8, 13].map((h, i) => (
                  <div key={i} style={{
                    width: 2.5, height: h, borderRadius: 2,
                    background: 'var(--rose)',
                    animation: `voiceBar ${.5 + i * .07}s ${i * .08}s ease-in-out infinite`,
                    transformOrigin: 'bottom',
                  }} />
                ))}
              </div>
              Listening — speak now
            </div>
          )}

          {/* Messages */}
          <div
            ref={msgsRef}
            style={{
              flex: 1, overflowY: 'auto', padding: '.85rem',
              display: 'flex', flexDirection: 'column', gap: '.6rem',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,.3) transparent',
            }}
          >
            {messages.length === 0 && !isLoading && (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: 'var(--muted)', fontSize: '.78rem', lineHeight: 1.7,
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '.75rem', opacity: .6 }}>✦</div>
                Ask me anything about Shadab —<br />his work, skills, or availability.
              </div>
            )}

            {messages.map((m, i) => {
              const isNova = m.role === 'nova';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    flexDirection: isNova ? 'row' : 'row-reverse',
                    animation: 'msgIn .3s ease both',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: isNova
                      ? 'linear-gradient(135deg,var(--rose),var(--violet))'
                      : 'rgba(255,255,255,.07)',
                    border: isNova ? 'none' : '1px solid rgba(255,255,255,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.65rem', color: isNova ? '#fff' : 'var(--muted)', fontWeight: 700,
                  }}>
                    {isNova ? '✦' : 'S'}
                  </div>
                  <div style={{
                    maxWidth: '82%', padding: '.65rem .9rem',
                    borderRadius: isNova ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: isNova ? 'rgba(139,92,246,.1)' : 'rgba(232,149,109,.08)',
                    border: isNova ? '1px solid rgba(139,92,246,.2)' : '1px solid rgba(232,149,109,.18)',
                    fontSize: '.76rem', lineHeight: 1.7, color: 'var(--text)',
                  }}>
                    {isNova && m.isNew && i === latestNovaIdx
                      ? <TypingText text={m.content} onDone={() => onMarkRead(i)} />
                      : m.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'msgIn .3s ease both' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,var(--rose),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#fff', fontWeight: 700 }}>✦</div>
                <div style={{ padding: '.65rem .9rem', background: 'rgba(139,92,246,.1)', borderRadius: '4px 16px 16px 16px', border: '1px solid rgba(139,92,246,.2)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, .15, .3].map((d, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet2)', animation: `dotBounce 1.2s ${d}s ease infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick chips — shown before first message */}
          {messages.filter(m => m.role === 'user').length === 0 && (
            <div style={{
              padding: '.55rem .85rem',
              display: 'flex', gap: '.35rem', flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,.04)',
            }}>
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  style={{
                    padding: '.28rem .72rem', borderRadius: 50,
                    border: '1px solid var(--border)',
                    fontSize: '.58rem', color: 'var(--muted)',
                    background: 'none', transition: 'all .2s', whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,.4)'; e.currentTarget.style.color = 'var(--violet2)'; e.currentTarget.style.background = 'rgba(139,92,246,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '.7rem .85rem',
            borderTop: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(7,7,15,.55)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask NOVA anything..."
              style={{
                flex: 1,
                background: 'rgba(139,92,246,.08)',
                border: '1px solid rgba(139,92,246,.18)',
                borderRadius: 50,
                padding: '.52rem 1rem',
                color: 'var(--text)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '.75rem',
                outline: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,.18)'}
            />
            <button
              onClick={send}
              style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--rose),var(--violet))',
                border: 'none', color: '#fff', fontSize: '.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(139,92,246,.4)',
                transition: 'transform .15s, box-shadow .15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(139,92,246,.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,.4)'; }}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
