import { useState, useEffect } from 'react';
import NovaCoreV2 from '../../sections/Hero/NovaCoreV2';
import { useFullDuplex } from '../../hooks/useFullDuplex';
import { useNovaVoiceState } from '../../sections/Hero/useNovaVoiceState';
import NovaPanel from '../../components/NovaPanel';
import { useNOVA } from '../../hooks/useNOVA';

export function NOVAHeroV3() {
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, isLoading, sendMessage, markRead } = useNOVA();
  const [forcedState, setForcedState] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get('state');
    if (s && ['idle', 'listening', 'thinking', 'speaking', 'awareness'].includes(s)) {
      setForcedState(s);
    }
  }, []);

  const handleSend = async (text) => {
    if (!text?.trim()) return null;
    return await sendMessage(text);
  };

  const duplex = useFullDuplex({
    onReply: (text) => handleSend(text),
  });

  const ds = duplex.duplexState;
  const { voiceState: rawVoiceState, isSpeaking, isListening } = useNovaVoiceState(ds);
  
  const voiceState = forcedState || rawVoiceState;

  return (
    <section className="min-h-screen bg-[#07070F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_25%,rgba(7,7,15,0.4)_65%,rgba(7,7,15,0.78)_100%)]" />

      <div className="absolute top-24 right-10 z-10 font-mono text-[9px] tracking-wider text-[#A78BFA]/60 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
        NOVA.OS v3.0 (Living AI Core)
      </div>

      <div className="z-5 flex flex-col items-center gap-8 w-full max-w-4xl">
        <NovaCoreV2
          duplexState={voiceState}
          onClickNode={(label) => {
            console.log('Clicked node:', label);
          }}
          activeSubNodes={[]}
          highlightedNode={null}
        />

        <div className="flex flex-col items-center gap-3">
          <button
            onPointerDown={duplex.isSupported ? duplex.handlePressStart : undefined}
            onPointerUp={duplex.isSupported ? duplex.handlePressEnd : undefined}
            onPointerLeave={duplex.isSupported ? duplex.handlePressEnd : undefined}
            onMouseDown={duplex.isSupported ? duplex.handlePressStart : undefined}
            onMouseUp={duplex.isSupported ? duplex.handlePressEnd : undefined}
            onMouseLeave={duplex.isSupported ? duplex.handlePressEnd : undefined}
            onTouchStart={duplex.isSupported ? duplex.handlePressStart : undefined}
            onTouchEnd={duplex.isSupported ? duplex.handlePressEnd : undefined}
            className={`w-14 h-14 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 border-2 select-none z-10
              ${voiceState === 'listening' || voiceState === 'awareness'
                ? 'border-[#E8956D] bg-[radial-gradient(circle,rgba(232,149,109,0.3),rgba(180,40,40,0.2))] shadow-[0_0_0_5px_rgba(232,149,109,0.15),0_0_30px_rgba(232,149,109,0.6)] animate-pulse'
                : voiceState === 'speaking'
                ? 'border-[#2DD4BF] bg-[radial-gradient(circle,rgba(45,212,191,0.2),rgba(139,92,246,0.15))] shadow-[0_0_0_5px_rgba(45,212,191,0.15),0_0_30px_rgba(45,212,191,0.4)]'
                : 'border-rose/40 bg-[radial-gradient(circle,rgba(232,149,109,0.12),rgba(139,92,246,0.07))] shadow-[0_0_14px_rgba(232,149,109,0.2)]'
              }`}
          >
            {voiceState === 'listening' || voiceState === 'awareness' ? '⏹' : voiceState === 'thinking' ? '⏳' : voiceState === 'speaking' ? '🔊' : '🎤'}
          </button>
          <span className={`text-[9px] font-mono tracking-widest uppercase
            ${voiceState === 'idle' ? 'text-muted' : voiceState === 'listening' || voiceState === 'awareness' ? 'text-rose' : 'text-teal'}`}>
            {voiceState === 'idle' ? 'Hold to talk' : voiceState === 'listening' ? 'Listening... release to send' : voiceState === 'awareness' ? 'Awareness Active (Clap/Sound)' : voiceState === 'thinking' ? 'Processing...' : 'NOVA is speaking...'}
          </span>
        </div>
      </div>

      <NovaPanel
        messages={messages}
        isLoading={isLoading}
        onSend={handleSend}
        onMarkRead={markRead}
        isSpeaking={isSpeaking || voiceState === 'speaking'}
        isListening={isListening || ds === 'listening' || voiceState === 'listening' || voiceState === 'awareness'}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </section>
  );
}
