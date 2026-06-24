import { useState, useRef, useCallback, useEffect } from 'react';
import { startAudioCapture } from '../lib/audio';
import { transcribeAudio } from '../lib/novaApi';
import { useTTS } from './useTTS';

/**
 * useFullDuplex — Tap-to-listen voice pipeline.
 *
 * State machine:  idle → listening → thinking → speaking → idle
 *
 * Activation:     single tap starts SpeechRecognition.
 * Deactivation:   browser auto-ends on end-of-speech.
 * Cancel:         second tap while listening aborts without processing.
 * Interrupt:      tap while speaking/thinking cancels TTS and returns to idle.
 *
 * No hold-to-talk. No press/release handlers. No mobile/desktop branching.
 */
export function useFullDuplex({ onReply }) {
  const [duplexState, setDuplexState] = useState('idle');
  const [spokenText,  setSpokenText]  = useState('');
  const [micPermission, setMicPermission] = useState('undetermined');

  const stateRef        = useRef('idle'); // shadow ref — avoids stale closure reads
  const recognitionRef  = useRef(null);
  const recorderRef     = useRef(null);
  const transcriptRef   = useRef('');

  const { speak, cancel } = useTTS();

  const hasBrowserSTT = typeof window !== 'undefined'
    && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const hasRecordedSTT = typeof window !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined';

  const isSupported = typeof window !== 'undefined'
    && (hasBrowserSTT || hasRecordedSTT)
    && typeof Audio !== 'undefined';

  // ─── Diagnostics ──────────────────────────────────────────────────────────

  const addLog = useCallback((msg) => {
    console.log(`[NOVA] ${msg}`);
    if (typeof window === 'undefined') return;
    if (!window.__NOVA_DEBUG_LOGS__) window.__NOVA_DEBUG_LOGS__ = [];
    window.__NOVA_DEBUG_LOGS__.unshift({ time: new Date().toLocaleTimeString(), message: msg });
    if (window.__NOVA_DEBUG_LOGS__.length > 40) window.__NOVA_DEBUG_LOGS__.pop();
    window.dispatchEvent(new CustomEvent('nova-debug-update'));
  }, []);

  const updateDebug = useCallback((updates) => {
    if (typeof window === 'undefined') return;
    window.__NOVA_DEBUG__ = { ...window.__NOVA_DEBUG__, ...updates };
    window.dispatchEvent(new CustomEvent('nova-debug-update'));
  }, []);

  // ─── Permission query (fire-and-forget — never blocks recognition.start) ──

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
        addLog(`Mic permission changed: ${status.state}`);
      };
      return status.state;
    } catch {
      setMicPermission('unknown');
      updateDebug({ microphonePermission: 'unknown' });
      return 'unknown';
    }
  }, [addLog, updateDebug]);

  // ─── State machine ────────────────────────────────────────────────────────

  const goState = useCallback((s) => {
    stateRef.current = s;
    setDuplexState(s);
    addLog(`state → ${s}`);
    updateDebug({ duplexState: s });
  }, [addLog, updateDebug]);

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

  // ─── TTS Speaker ──────────────────────────────────────────────────────────

  const speakReply = useCallback((text) => {
    return new Promise((resolve) => {
      if (!text) { resolve(); return; }

      addLog(`Speaking: "${text.substring(0, 50)}…"`);
      setSpokenText(text);
      goState('speaking');
      speak(text, {
        voice: 'nova',
        instructions: 'Speak warmly, clearly, and naturally like a confident premium AI assistant.',
        onStart: () => {
          addLog('TTS playback started');
          window.dispatchEvent(new CustomEvent('nova-word'));
        },
        onEnd:  () => { addLog('TTS playback ended');  goState('idle'); resolve(); },
        onError: (err) => { addLog(`TTS error: ${err}`); goState('idle'); resolve(); },
      });
    });
  }, [goState, speak, addLog]);

  // ─── Transcript → AI → TTS ────────────────────────────────────────────────

  const processTranscript = useCallback(async (transcript) => {
    if (!transcript?.trim()) {
      addLog('No transcript captured — returning to idle');
      goState('idle');
      return;
    }

    goState('thinking');
    addLog(`Sending to NOVA: "${transcript}"`);

    try {
      const reply = await onReply?.(transcript);
      addLog(`NOVA replied: "${reply ? reply.substring(0, 50) : 'null'}…"`);
      if (reply && stateRef.current === 'thinking') {
        await speakReply(reply);
      } else {
        addLog('No reply or state interrupted — idle');
        goState('idle');
      }
    } catch (err) {
      addLog(`Reply processing error: ${err.message}`);
      goState('idle');
    }
  }, [goState, onReply, speakReply, addLog]);

  // ─── Browser SpeechRecognition ────────────────────────────────────────────

  const startBrowserSR = useCallback(() => {
    // Mutex guard — prevent dual STT sessions
    if (window.__NOVA_STT_ACTIVE__) {
      addLog('[SR] Mutex held — another STT session active, aborting.');
      return false;
    }

    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognitionRef.current = recognition;
      updateDebug({ recognitionActive: true });

      recognition.lang            = 'en-IN';
      recognition.continuous      = false;  // browser auto-ends on end-of-speech
      recognition.interimResults  = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        addLog('[SR] onstart — recognition engine live');
        window.__NOVA_STT_ACTIVE__ = true;
        goState('listening');
      };

      recognition.onaudiostart  = () => addLog('[SR] onaudiostart');
      recognition.onsoundstart  = () => addLog('[SR] onsoundstart');
      recognition.onspeechstart = () => addLog('[SR] onspeechstart');
      recognition.onspeechend   = () => addLog('[SR] onspeechend');
      recognition.onsoundend    = () => addLog('[SR] onsoundend');
      recognition.onaudioend    = () => addLog('[SR] onaudioend');

      recognition.onresult = (event) => {
        addLog('[SR] onresult');
        let interimText  = '';
        let newFinalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const seg = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalText += seg;
          } else {
            interimText += seg;
          }
        }

        if (newFinalText) {
          const trimmed = newFinalText.trim();
          transcriptRef.current += (transcriptRef.current ? ' ' : '') + trimmed;
          addLog(`[SR] FINAL: "${trimmed}" | total: "${transcriptRef.current}"`);
        }
        if (interimText) addLog(`[SR] INTERIM: "${interimText.trim()}"`);

        updateDebug({
          transcript: transcriptRef.current,
          interimTranscript: interimText,
        });
      };

      recognition.onerror = (event) => {
        addLog(`[SR] onerror: "${event.error}"`);
        if (event.error === 'aborted') return;
        const msgs = {
          'not-allowed':         'Microphone access denied.',
          'audio-capture':       'No microphone found.',
          'network':             'STT network error.',
          'service-not-allowed': 'Speech recognition blocked.',
          'no-speech':           'No speech detected — tap to try again.',
        };
        updateDebug({ lastError: msgs[event.error] || `STT error: ${event.error}` });
      };

      recognition.onend = async () => {
        addLog('[SR] onend — session complete');
        window.__NOVA_STT_ACTIVE__ = false;
        recognitionRef.current = null;
        updateDebug({ recognitionActive: false, interimTranscript: '' });

        const captured = transcriptRef.current;
        transcriptRef.current = '';
        addLog(`[SR] captured: "${captured}" | state: ${stateRef.current}`);

        // Only process if we're still in listening state.
        // (If cancelled, goState('idle') was already called — skip.)
        if (stateRef.current === 'listening') {
          await processTranscript(captured);
        } else {
          addLog('[SR] onend — cancelled or interrupted, skipping transcript.');
        }
      };

      addLog('[SR] recognition.start() — tap-to-listen');
      recognition.start();
      return true;
    } catch (err) {
      addLog(`[SR] init error: ${err.message}`);
      updateDebug({ lastError: err.message });
      window.__NOVA_STT_ACTIVE__ = false;
      recognitionRef.current = null;
      return false;
    }
  }, [addLog, goState, processTranscript, updateDebug]);

  // ─── startRecording — synchronous entry point ─────────────────────────────

  const startRecording = useCallback(() => {
    cancel();
    addLog('startRecording() — tap-to-listen');
    updateDebug({ transcript: '', interimTranscript: '', lastError: '' });
    transcriptRef.current = '';

    // Permission query is informational only. Fire-and-forget so we never
    // lose the synchronous user-gesture context required by mobile browsers.
    queryMicPermission().then((perm) => addLog(`Mic permission: ${perm}`));

    if (hasBrowserSTT) {
      const started = startBrowserSR();
      if (started) return;
    }

    // ── Whisper / MediaRecorder fallback ──────────────────────────────────
    addLog('Falling back to MediaRecorder + Whisper');
    startAudioCapture()
      .then((session) => {
        recorderRef.current = session;
        updateDebug({ recognitionActive: true });
        session.recorder.start();
        goState('listening');
      })
      .catch((err) => {
        addLog(`Audio capture failed: ${err.message}`);
        updateDebug({ lastError: err.message, recognitionActive: false });
        goState('idle');
      });
  }, [cancel, goState, hasBrowserSTT, queryMicPermission, startBrowserSR, addLog, updateDebug]);

  // ─── cancelRecording — abort without processing transcript ────────────────

  const cancelRecording = useCallback(() => {
    addLog('cancelRecording() — user tapped to cancel');
    // Set state to idle FIRST so onend ignores the captured transcript.
    goState('idle');
    window.__NOVA_STT_ACTIVE__ = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {
        addLog(`[SR] cancel stop error: ${e.message}`);
      }
    }
    if (recorderRef.current) {
      try { recorderRef.current.stop(); } catch (e) {}
      recorderRef.current = null;
    }
  }, [goState, addLog]);

  // ─── handleTap — single public toggle ────────────────────────────────────

  const handleTap = useCallback((e) => {
    e?.preventDefault?.();
    const s = stateRef.current;
    addLog(`handleTap() — state: ${s}`);

    if (s === 'idle') {
      startRecording();
    } else if (s === 'listening') {
      cancelRecording();
    } else if (s === 'speaking' || s === 'thinking') {
      // Interrupt TTS / cancel pending reply
      cancel();
      goState('idle');
    }
  }, [startRecording, cancelRecording, cancel, goState, addLog]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
      try { recorderRef.current?.stop?.(); }  catch {}
      window.__NOVA_STT_ACTIVE__ = false;
      cancel();
    };
  }, [cancel]);

  return {
    duplexState,
    spokenText,
    isSupported,
    handleTap,
    speakReply,
    micPermission,
  };
}
