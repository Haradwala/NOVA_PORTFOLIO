import { useState, useRef, useCallback, useEffect } from 'react';
import { startAudioCapture } from '../lib/audio';
import { transcribeAudio } from '../lib/novaApi';
import { useTTS } from './useTTS';

/**
 * useFullDuplex — Hold-to-talk pipeline with robust lifecycle diagnostics
 *
 * State machine:  idle → listening → thinking → speaking → idle
 */
export function useFullDuplex({ onReply }) {
  const [duplexState, setDuplexState] = useState('idle');
  const [spokenText, setSpokenText] = useState('');
  const [micPermission, setMicPermission] = useState('undetermined');
  
  const stateRef = useRef('idle'); // shadow ref to avoid stale closures
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const holdTimer = useRef(null);
  const isHolding = useRef(false);
  const transcriptRef = useRef('');
  const shouldStopOnStartRef = useRef(false);
  const retryCountRef = useRef(0);       // no-speech auto-retry counter
  
  const { speak, cancel } = useTTS();

  const hasBrowserSTT = typeof window !== 'undefined'
    && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const hasRecordedSTT = typeof window !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined';

  const isSupported = typeof window !== 'undefined'
    && (hasBrowserSTT || hasRecordedSTT)
    && typeof Audio !== 'undefined';

  // Helper: Append a diagnostic log to global window list
  const addLog = useCallback((msg) => {
    console.log(`[NOVA Debug] ${msg}`);
    if (typeof window === 'undefined') return;
    if (!window.__NOVA_DEBUG_LOGS__) window.__NOVA_DEBUG_LOGS__ = [];
    window.__NOVA_DEBUG_LOGS__.unshift({
      time: new Date().toLocaleTimeString(),
      message: msg
    });
    if (window.__NOVA_DEBUG_LOGS__.length > 40) {
      window.__NOVA_DEBUG_LOGS__.pop();
    }
    window.dispatchEvent(new CustomEvent('nova-debug-update'));
  }, []);

  // Helper: Sync state parameters to window global
  const updateDebug = useCallback((updates) => {
    if (typeof window === 'undefined') return;
    window.__NOVA_DEBUG__ = {
      ...window.__NOVA_DEBUG__,
      ...updates,
    };
    window.dispatchEvent(new CustomEvent('nova-debug-update'));
  }, []);

  // Query microphone permissions state
  const queryMicPermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      setMicPermission('unknown');
      updateDebug({ microphonePermission: 'unknown' });
      return 'unknown';
    }
    try {
      const status = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(status.state);
      updateDebug({ microphonePermission: status.state });
      
      status.onchange = () => {
        setMicPermission(status.state);
        updateDebug({ microphonePermission: status.state });
        addLog(`Microphone permission state changed to: ${status.state}`);
      };
      return status.state;
    } catch (e) {
      setMicPermission('unknown');
      updateDebug({ microphonePermission: 'unknown' });
      return 'unknown';
    }
  }, [addLog, updateDebug]);

  // Sync state & log changes
  const goState = useCallback((s) => {
    stateRef.current = s;
    setDuplexState(s);
    addLog(`duplexState transition: -> ${s}`);
    updateDebug({ duplexState: s });
  }, [addLog, updateDebug]);

  // Initialize debug state on mount
  useEffect(() => {
    updateDebug({
      duplexState: 'idle',
      microphonePermission: 'undetermined',
      recognitionActive: false,
      transcript: '',
      interimTranscript: '',
      lastError: '',
    });
    queryMicPermission();
  }, [queryMicPermission, updateDebug]);

  // ─── TTS Speaker ──────────────────────────────────────────
  const speakReply = useCallback((text) => {
    return new Promise((resolve) => {
      if (!text) {
        resolve();
        return;
      }

      addLog(`Speaking response: "${text.substring(0, 40)}..."`);
      setSpokenText(text);
      goState('speaking');
      speak(text, {
        voice: 'nova',
        instructions: 'Speak warmly, clearly, and naturally like a confident premium AI assistant.',
        onStart: () => {
          addLog('TTS Playback started');
          window.dispatchEvent(new CustomEvent('nova-word'));
        },
        onEnd: () => {
          addLog('TTS Playback ended');
          goState('idle');
          resolve();
        },
        onError: (err) => {
          addLog(`TTS Playback error: ${err}`);
          goState('idle');
          resolve();
        },
      });
    });
  }, [goState, speak, addLog]);

  const processTranscript = useCallback(async (transcript) => {
    if (!transcript) {
      addLog('Empty transcript, returning to idle');
      goState('idle');
      return;
    }

    goState('thinking');
    addLog(`Sending transcript to AI: "${transcript}"`);

    try {
      const reply = await onReply?.(transcript);
      addLog(`AI responded: "${reply ? reply.substring(0, 40) : 'null'}..."`);
      if (reply && stateRef.current === 'thinking') {
        await speakReply(reply);
      } else {
        addLog('No reply returned or user interrupted thinking state');
        goState('idle');
      }
    } catch (err) {
      addLog(`Error processing chat reply: ${err.message}`);
      goState('idle');
    }
  }, [goState, onReply, speakReply, addLog]);

  // ─── STT Recorder ─────────────────────────────────────────
  const startRecording = useCallback(async () => {
    cancel();
    addLog('startRecording() initialized');
    updateDebug({ transcript: '', interimTranscript: '', lastError: '' });
    shouldStopOnStartRef.current = false;
    retryCountRef.current = 0;

    const perm = await queryMicPermission();
    addLog(`Microphone permission state: ${perm}`);

    if (hasBrowserSTT) {
      addLog('SpeechRecognition is supported. Initializing...');

      // Defined as inner function so onend can call it to retry on no-speech
      const startBrowserSR = () => {
        try {
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SR();
          recognitionRef.current = recognition;
          updateDebug({ recognitionActive: true });

          // ── Recognition config ──────────────────────────────────────────────
          const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          recognition.lang            = 'en-IN'; // Indian English — better for local accent
          recognition.continuous      = !isMobile; // no auto-timeout / no-speech cutoff
          recognition.interimResults  = true;     // live partial results
          recognition.maxAlternatives = 3;        // broader matching

          // ── onstart ────────────────────────────────────────────────────────
          recognition.onstart = () => {
            addLog('[SR] onstart — recognition engine started');
            // Claim the global STT mutex — held until onend fires.
            window.__NOVA_STT_ACTIVE__ = true;
            if (shouldStopOnStartRef.current) {
              addLog('[SR] Early release flagged — stopping immediately.');
              shouldStopOnStartRef.current = false;
              try { recognition.stop(); } catch (e) { addLog(`[SR] Early stop err: ${e.message}`); }
              return;
            }
            goState('listening');
          };

          // ── onaudiostart ───────────────────────────────────────────────────
          recognition.onaudiostart = () => {
            addLog('[SR] onaudiostart — audio stream opened by recognition engine');
          };

          // ── onsoundstart ───────────────────────────────────────────────────
          recognition.onsoundstart = () => {
            addLog('recognition.onsoundstart');
          };

          // ── onspeechstart ──────────────────────────────────────────────────
          recognition.onspeechstart = () => {
            addLog('recognition.onspeechstart');
          };

          // ── onspeechend ────────────────────────────────────────────────────
          recognition.onspeechend = () => {
            addLog('recognition.onspeechend');
          };

          // ── onsoundend ─────────────────────────────────────────────────────
          recognition.onsoundend = () => {
            addLog('recognition.onsoundend');
          };

          // ── onaudioend ─────────────────────────────────────────────────────
          recognition.onaudioend = () => {
            addLog('[SR] onaudioend — audio capture stream closed');
          };

          // ── onresult — handles both interim and final segments ─────────────
          recognition.onresult = (event) => {
            addLog('recognition.onresult');

            for (let i = event.resultIndex; i < event.results.length; i++) {
              addLog(`event.results[${i}][0].transcript: "${event.results[i][0].transcript}"`);
            }

            let interimText = '';
            let newFinalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const segment = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                newFinalText += segment;
              } else {
                interimText += segment;
              }
            }

            if (newFinalText) {
              const trimmed = newFinalText.trim();
              transcriptRef.current += (transcriptRef.current ? ' ' : '') + trimmed;
              addLog(`[SR] onresult [FINAL]: "${trimmed}" | accumulated: "${transcriptRef.current}"`);
            }
            if (interimText) {
              addLog(`[SR] onresult [INTERIM]: "${interimText.trim()}"`);
            }

            updateDebug({
              transcript: transcriptRef.current,
              interimTranscript: interimText,
            });
          };

          // ── onerror ────────────────────────────────────────────────────────
          recognition.onerror = (event) => {
            addLog(`[SR] onerror: "${event.error}" | message: "${event.message || 'none'}"`)
            if (event.error === 'aborted') return;

            if (event.error === 'no-speech') {
              // Don't go idle — let onend handle a retry while user holds
              addLog('[SR] no-speech: engine received audio but detected no speech patterns');
              updateDebug({ lastError: 'No speech yet — hold and speak clearly' });
              return;
            }

            const errorMessages = {
              'not-allowed':         'Microphone access denied.',
              'audio-capture':       'No microphone found on this device.',
              'network':             'Browser STT network error — Whisper fallback next.',
              'service-not-allowed': 'Speech recognition blocked in this browser.',
            };
            const msg = errorMessages[event.error] || `STT error: ${event.error}`;
            console.warn('[FullDuplex] Browser STT error:', event.error);
            updateDebug({ lastError: msg });
            // Let onend transition state
          };

          // ── onend ──────────────────────────────────────────────────────────
          recognition.onend = async () => {
            addLog('[SR] onend fired — recognition session terminated');
            // Release the global STT mutex.
            window.__NOVA_STT_ACTIVE__ = false;
            recognitionRef.current = null;
            updateDebug({ recognitionActive: false, interimTranscript: '' });

            const capturedTranscript = transcriptRef.current;
            transcriptRef.current = '';
            shouldStopOnStartRef.current = false;

            const wasListening = stateRef.current === 'listening';
            addLog(`[SR] onend — wasListening:${wasListening} | capturedTranscript:"${capturedTranscript}" | isHolding:${isHolding.current} | retries:${retryCountRef.current}`);

            // ── Auto-retry on no-speech while user is still holding ────────
            if (
              wasListening &&
              !capturedTranscript &&
              isHolding.current &&
              retryCountRef.current < 3
            ) {
              retryCountRef.current++;
              addLog(`[SR] Auto-retrying (attempt ${retryCountRef.current}/3)...`);
              startBrowserSR();
              return;
            }

            if (wasListening) {
              await processTranscript(capturedTranscript);
            } else {
              addLog('[SR] onend — ended outside active listening state, ignoring.');
            }
          };

          addLog(`[SR] recognition.start() → lang:en-IN continuous:true interimResults:true maxAlternatives:3`);

          // Guard: abort if another STT hook already owns the microphone.
          if (window.__NOVA_STT_ACTIVE__) {
            addLog('[SR] Aborted — another STT session is active (mutex held). Preventing mic collision.');
            recognitionRef.current = null;
            return false;
          }

          recognition.start();
          return true;
        } catch (err) {
          addLog(`[SR] init error: ${err.message}`);
          console.warn('[FullDuplex] Browser STT init failed:', err);
          updateDebug({ lastError: err.message });
          return false;
        }
      };

      const started = startBrowserSR();
      if (started) return;
    }

    // ─── Whisper fallback (MediaRecorder + OpenAI /api/stt) ────────────────
    addLog('Falling back to mediaRecorder + Whisper transcription');
    try {
      const session = await startAudioCapture();
      recorderRef.current = session;
      updateDebug({ recognitionActive: true });
      session.recorder.start();
      goState('listening');
    } catch (err) {
      addLog(`Whisper fallback audio capture failed: ${err.message}`);
      console.warn('[FullDuplex] Could not start any recording:', err);
      updateDebug({ lastError: err.message, recognitionActive: false });
      goState('idle');
    }
  }, [cancel, goState, hasBrowserSTT, processTranscript, queryMicPermission, addLog, updateDebug]);

  const stopRecording = useCallback(async () => {
    addLog('stopRecording() initialized');
    if (recognitionRef.current) {
      addLog('Halting SpeechRecognition capturing');
      try {
        recognitionRef.current.stop();
      } catch (err) {
        addLog(`Error halting recognition: ${err.message}`);
      }
      return;
    }

    const session = recorderRef.current;
    if (!session) {
      addLog('No active recorder session found');
      return;
    }

    addLog('Stopping mediaRecorder session');
    recorderRef.current = null;
    updateDebug({ recognitionActive: false });

    try {
      const blob = await session.stop();
      addLog(`Audio blob saved (${blob.size} bytes). Requesting API transcription...`);
      goState('thinking');
      const transcript = await transcribeAudio(blob);
      addLog(`API transcription response: "${transcript}"`);
      updateDebug({ transcript });
      await processTranscript(transcript);
    } catch (error) {
      addLog(`Fallback transcription failed: ${error.message}`);
      console.warn('[FullDuplex] STT error:', error);
      updateDebug({ lastError: error.message });
      goState('idle');
    }
  }, [goState, processTranscript, addLog, updateDebug]);

  // ─── Hold / Release handlers ───────────────────────────────
  const lastPressTime = useRef(0);
  const lastReleaseTime = useRef(0);

  const handlePressStart = useCallback((e) => {
    e?.preventDefault?.();
    const now = Date.now();
    if (now - lastPressTime.current < 100) return;
    lastPressTime.current = now;

    if (!isSupported) return;

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      if (stateRef.current === 'idle') {
        startRecording();
      } else if (stateRef.current === 'listening') {
        stopRecording();
      }
      return;
    }

    addLog('handlePressStart() user press down');
    isHolding.current = true;

    // 250 ms debounce — short taps open chat instead
    holdTimer.current = setTimeout(() => {
      if (isHolding.current && stateRef.current === 'idle') {
        startRecording();
      } else {
        addLog(`Debounce finished. isHolding=${isHolding.current}, state=${stateRef.current}`);
      }
    }, 250);
  }, [isSupported, startRecording, stopRecording, addLog]);

  const handlePressEnd = useCallback((e) => {
    e?.preventDefault?.();
    const now = Date.now();
    if (now - lastReleaseTime.current < 100) return;
    lastReleaseTime.current = now;

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      return;
    }

    addLog('handlePressEnd() user release');
    isHolding.current = false;
    clearTimeout(holdTimer.current);

    if (stateRef.current === 'listening') {
      stopRecording();
    } else if (recognitionRef.current || recorderRef.current) {
      addLog('Released during initialization! Set stop-on-start flag.');
      shouldStopOnStartRef.current = true;
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (err) {
        addLog(`Error stopping recognition instance: ${err.message}`);
      }
    } else {
      addLog('Released while idle (no active recording)');
    }
  }, [stopRecording, addLog]);

  // ─── Cleanup ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(holdTimer.current);
      try { recognitionRef.current?.stop?.(); } catch {}
      try { recorderRef.current?.stop?.(); } catch {}
      cancel();
    };
  }, [cancel]);


  return {
    duplexState,
    spokenText,
    isSupported,
    handlePressStart,
    handlePressEnd,
    speakReply,
    micPermission,
  };
}
