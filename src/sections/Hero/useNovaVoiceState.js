import { useMemo } from 'react';

export function useNovaVoiceState(duplexState) {
  const isListening = useMemo(() => duplexState === 'listening', [duplexState]);
  const isThinking = useMemo(() => duplexState === 'thinking', [duplexState]);
  const isSpeaking = useMemo(() => duplexState === 'speaking', [duplexState]);

  return {
    isListening,
    isThinking,
    isSpeaking,
    voiceState: duplexState || 'idle'
  };
}
