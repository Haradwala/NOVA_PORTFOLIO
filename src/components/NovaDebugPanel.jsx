import { useState, useEffect } from 'react';
import { getAnalyserValues } from '../lib/audioAnalyser';

export default function NovaDebugPanel() {
  const [debugData, setDebugData] = useState({
    duplexState: 'idle',
    microphonePermission: 'undetermined',
    recognitionActive: false,
    transcript: '',
    interimTranscript: '',
    lastError: '',
  });
  const [logs, setLogs] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const [audioValues, setAudioValues] = useState({
    isActive: false,
    voiceAmplitude: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  useEffect(() => {
    const handleUpdate = () => {
      if (window.__NOVA_DEBUG__) {
        setDebugData({ ...window.__NOVA_DEBUG__ });
      }
      if (window.__NOVA_DEBUG_LOGS__) {
        setLogs([...window.__NOVA_DEBUG_LOGS__]);
      }
    };

    const handleAudioUpdate = () => {
      setAudioValues(getAnalyserValues());
    };

    window.addEventListener('nova-debug-update', handleUpdate);
    window.addEventListener('nova-audio-update', handleAudioUpdate);
    handleUpdate(); // Initial load
    setAudioValues(getAnalyserValues());

    return () => {
      window.removeEventListener('nova-debug-update', handleUpdate);
      window.removeEventListener('nova-audio-update', handleAudioUpdate);
    };
  }, []);

  if (minimized) {
    return (
      <button
        id="nova-debug-panel-toggle"
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          background: 'rgba(17, 17, 27, 0.85)',
          color: '#2DD4BF',
          border: '1px solid rgba(45, 212, 191, 0.4)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.65rem',
          fontFamily: "'JetBrains Mono', monospace",
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        🛰️ NOVA STT DEBUG
      </button>
    );
  }

  return (
    <div
      id="nova-debug-panel"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '320px',
        maxHeight: '420px',
        zIndex: 9999,
        background: 'rgba(10, 10, 18, 0.88)',
        color: '#E0E0E6',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#A78BFA' }}>🛰️ NOVA STT MONITOR</span>
        <button
          onClick={() => setMinimized(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Grid Status */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9CA3AF' }}>duplexState:</span>
          <span
            style={{
              fontWeight: 'bold',
              color:
                debugData.duplexState === 'listening'
                  ? '#E8956D'
                  : debugData.duplexState === 'speaking'
                  ? '#2DD4BF'
                  : debugData.duplexState === 'thinking'
                  ? '#A78BFA'
                  : '#9CA3AF',
            }}
          >
            {debugData.duplexState}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9CA3AF' }}>mic permission:</span>
          <span
            style={{
              fontWeight: 'bold',
              color: debugData.microphonePermission === 'granted' ? '#4ADE80' : '#F87171',
            }}
          >
            {debugData.microphonePermission}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9CA3AF' }}>recognition active:</span>
          <span
            style={{
              fontWeight: 'bold',
              color: debugData.recognitionActive ? '#4ADE80' : '#F87171',
            }}
          >
            {debugData.recognitionActive
              ? debugData.interimTranscript ? '🎤 CAPTURING' : '🎤 ACTIVE'
              : 'INACTIVE'}
          </span>
        </div>

        {/* Interim transcript — live as user speaks */}
        {debugData.interimTranscript ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
            <span style={{ color: '#9CA3AF' }}>interim:</span>
            <div
              style={{
                background: 'rgba(251, 191, 36, 0.07)',
                padding: '6px',
                borderRadius: '4px',
                minHeight: '22px',
                wordBreak: 'break-word',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                color: '#FDE68A',
                fontStyle: 'italic',
                animation: 'nova-pulse-border 1s ease-in-out infinite',
              }}
            >
              {debugData.interimTranscript}
            </div>
          </div>
        ) : null}

        {/* Final transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
          <span style={{ color: '#9CA3AF' }}>transcript:</span>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '6px',
              borderRadius: '4px',
              minHeight: '28px',
              wordBreak: 'break-word',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              color: debugData.transcript ? '#F3F4F6' : undefined,
            }}
          >
            {debugData.transcript || <span style={{ color: '#4B5563', fontStyle: 'italic' }}>[empty]</span>}
          </div>
        </div>

        {debugData.lastError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#F87171' }}>
            <span>last error:</span>
            <div
              style={{
                background: 'rgba(248, 113, 113, 0.08)',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(248, 113, 113, 0.2)',
              }}
            >
              {debugData.lastError}
            </div>
          </div>
        )}

        {/* Audio Analyser Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>🎙️ AUDIO ANALYSER:</span>
            <span style={{
              fontWeight: 'bold',
              color: audioValues.isActive ? '#4ADE80' : '#F87171',
              background: audioValues.isActive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.55rem'
            }}>
              {audioValues.isActive ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          {/* Mic Active */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <span style={{ color: '#9CA3AF' }}>Mic Active:</span>
            <span style={{
              fontWeight: 'bold',
              color: audioValues.isActive ? '#4ADE80' : '#F87171',
            }}>
              {String(audioValues.isActive)}
            </span>
          </div>

          {/* Voice Amplitude */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Voice Amplitude:</span>
              <span style={{ fontWeight: 'bold', color: '#4ADE80' }}>{audioValues.voiceAmplitude.toFixed(4)}</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${audioValues.voiceAmplitude * 100}%`,
                height: '100%',
                background: '#4ADE80',
                boxShadow: '0 0 6px #4ADE80',
                transition: 'width 0.05s ease-out'
              }} />
            </div>
          </div>

          {/* Bass */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Bass:</span>
              <span style={{ fontWeight: 'bold', color: '#60A5FA' }}>{audioValues.bass.toFixed(4)}</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${audioValues.bass * 100}%`,
                height: '100%',
                background: '#60A5FA',
                boxShadow: '0 0 6px #60A5FA',
                transition: 'width 0.05s ease-out'
              }} />
            </div>
          </div>

          {/* Mid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Mid:</span>
              <span style={{ fontWeight: 'bold', color: '#FBBF24' }}>{audioValues.mid.toFixed(4)}</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${audioValues.mid * 100}%`,
                height: '100%',
                background: '#FBBF24',
                boxShadow: '0 0 6px #FBBF24',
                transition: 'width 0.05s ease-out'
              }} />
            </div>
          </div>

          {/* Treble */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Treble:</span>
              <span style={{ fontWeight: 'bold', color: '#F472B6' }}>{audioValues.treble.toFixed(4)}</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${audioValues.treble * 100}%`,
                height: '100%',
                background: '#F472B6',
                boxShadow: '0 0 6px #F472B6',
                transition: 'width 0.05s ease-out'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: '120px',
        }}
      >
        <div style={{ padding: '6px 10px', background: 'rgba(0, 0, 0, 0.2)', color: '#9CA3AF', fontSize: '0.6rem' }}>
          EVENT LOGS
        </div>
        <div
          style={{
            padding: '8px 10px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#4B5563', textAlign: 'center', marginTop: '20px' }}>No events logged yet</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ display: 'flex', gap: '6px', lineHeight: '1.2' }}>
                <span style={{ color: '#6B7280', flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: log.message.includes('error') ? '#F87171' : '#D1D5DB' }}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
