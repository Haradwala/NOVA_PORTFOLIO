import { useState, useRef, useCallback } from 'react';
import { startAudioCapture } from '../lib/audio';
import { transcribeAudio } from '../lib/novaApi';

/**
 * useSTT — Hybrid Speech-to-Text hook.
 * Uses browser speech recognition first when available, and falls back
 * to recorded audio + OpenAI transcription when needed.
 */
export function useSTT({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastError, setLastError] = useState('');
  const [mode, setMode] = useState('idle');
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const resultReceivedRef = useRef(false);

  const hasBrowserSTT =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const hasRecordedSTT =
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const isSupported = hasBrowserSTT || hasRecordedSTT;

  const handleTranscript = useCallback((text) => {
    const clean = text?.trim();
    if (!clean) return;
    setLastError('');
    setMode('browser');
    setTranscript(clean);
    onResult?.(clean);
  }, [onResult]);

  const startBrowserListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;

    const recognition = new SR();
    recognitionRef.current = recognition;
    resultReceivedRef.current = false;
    setLastError('');
    setMode('browser');
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      resultReceivedRef.current = true;
      setIsListening(false);
      const text = event.results?.[0]?.[0]?.transcript || '';
      handleTranscript(text);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setIsListening(false);

      const messages = {
        'not-allowed': 'Microphone permission denied. Please allow mic access.',
        'audio-capture': 'No microphone was found on this device.',
        'no-speech': 'No speech detected. Try speaking a little closer to the mic.',
        'network': 'Browser speech recognition had a network error.',
        'service-not-allowed': 'Speech recognition service is blocked in this browser profile.',
      };
      const message = messages[event.error] || `Speech recognition error: ${event.error}`;
      setLastError(message);
      onError?.(message);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (!resultReceivedRef.current) {
        const message = 'No speech detected. Try again and speak clearly after tapping the mic.';
        setLastError(message);
        onError?.(message);
      }
    };

    try {
      recognition.start();
      return true;
    } catch (error) {
      recognitionRef.current = null;
      const message = error.message || 'Could not start browser speech recognition.';
      setLastError(message);
      onError?.(message);
      return false;
    }
  }, [handleTranscript, onError]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      const message = 'Voice input is not supported in this browser.';
      setLastError(message);
      onError?.(message);
      return;
    }
    if (isListening) return;

    if (hasBrowserSTT) {
      const started = startBrowserListening();
      if (started) return;
    }

    try {
      const session = await startAudioCapture();
      setLastError('');
      setMode('recording');
      recorderRef.current = session;
      session.recorder.start();
      setIsListening(true);
    } catch (err) {
      setIsListening(false);
      const message = err.message || 'Could not start microphone.';
      setLastError(message);
      onError?.(message);
    }
  }, [hasBrowserSTT, isListening, isSupported, onError, startBrowserListening]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const session = recorderRef.current;
    if (!session) return;

    recorderRef.current = null;
    setIsListening(false);

    try {
      const blob = await session.stop();
      const text = await transcribeAudio(blob);
      handleTranscript(text);
    } catch (err) {
      const message = err.message || 'Could not transcribe audio.';
      setLastError(message);
      onError?.(message);
    }
  }, [handleTranscript, onError]);

  const toggleListening = useCallback(() => {
    isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    lastError,
    mode,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
  };
}
