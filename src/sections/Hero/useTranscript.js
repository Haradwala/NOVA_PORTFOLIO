import { useEffect, useState } from 'react';

export function useTranscript({ duplexState }) {
  const [liveText, setLiveText] = useState('');

  useEffect(() => {
    const handleDebugUpdate = () => {
      if (window.__NOVA_DEBUG__) {
        const text = window.__NOVA_DEBUG__.interimTranscript || window.__NOVA_DEBUG__.transcript || '';
        setLiveText(text);
      }
    };
    
    window.addEventListener('nova-debug-update', handleDebugUpdate);
    
    if (duplexState === 'idle') {
      setLiveText('');
    }

    return () => {
      window.removeEventListener('nova-debug-update', handleDebugUpdate);
    };
  }, [duplexState]);

  return {
    liveText,
  };
}
