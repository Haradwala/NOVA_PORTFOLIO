import { useCallback, useRef } from 'react';
import { synthesizeSpeech } from '../lib/novaApi';

/**
 * useTTS — Hybrid text-to-speech hook.
 * Uses browser speech synthesis first and falls back to OpenAI audio when needed.
 */
export function useTTS() {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const utteranceRef = useRef(null);

  const hasBrowserTTS =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined';

  const pickBrowserVoice = useCallback(() => {
    if (!hasBrowserTTS) return null;
    const voices = window.speechSynthesis.getVoices() || [];

    // Pre-filter to English voices only. Prevents voices[0] from being a
    // non-English system voice (Hindi, Spanish, etc.) on localized Android devices.
    const enVoices = voices.filter(
      (v) => v.lang?.toLowerCase().startsWith('en')
    );
    // Fall back to full list only if no English voices exist at all.
    const pool = enVoices.length > 0 ? enVoices : voices;

    // Priority: premium named voices first, then lang-based fallbacks.
    return (
      pool.find((v) => /microsoft aria/i.test(v.name)) ||
      pool.find((v) => /microsoft zira/i.test(v.name)) ||
      pool.find((v) => /google uk english female/i.test(v.name)) ||
      pool.find((v) => /samantha/i.test(v.name)) ||
      pool.find((v) => /victoria|karen|moira|tessa|fiona|hazel|ava|susan/i.test(v.name)) ||
      pool.find((v) => v.lang === 'en-US' && /female/i.test(v.name)) ||
      pool.find((v) => v.lang === 'en-GB') ||
      pool.find((v) => v.lang === 'en-US') ||
      pool.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
      pool[0] ||
      null
    );
  }, [hasBrowserTTS]);

  const cleanupAudio = useCallback(() => {
    if (hasBrowserTTS) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [hasBrowserTTS]);

  const speakWithBrowser = useCallback((text, { onStart, onEnd, onError } = {}) => {
    if (!hasBrowserTTS) return false;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickBrowserVoice();
      if (voice) utterance.voice = voice;
      utterance.lang   = voice?.lang || 'en-US';
      utterance.rate   = 0.92;   // slightly slower = more natural, less robotic
      utterance.pitch  = 1.0;    // neutral pitch
      utterance.volume = 1;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        utteranceRef.current = null;
        onEnd?.();
      };
      utterance.onerror = (event) => {
        utteranceRef.current = null;
        onError?.(event.error || 'browser-tts-failed');
      };

      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.speak(utterance);
      } else {
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          if (!utteranceRef.current) return;
          const refreshedVoice = pickBrowserVoice();
          if (refreshedVoice) utterance.voice = refreshedVoice;
          window.speechSynthesis.speak(utterance);
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      }

      return true;
    } catch (error) {
      onError?.(error.message || 'browser-tts-failed');
      return false;
    }
  }, [hasBrowserTTS, pickBrowserVoice]);

  const speak = useCallback(async (text, { onStart, onEnd, onError, voice, instructions } = {}) => {
    if (typeof window === 'undefined') {
      onError?.('not-supported');
      return;
    }

    if (speakWithBrowser(text, { onStart, onEnd, onError })) {
      return;
    }

    if (typeof Audio === 'undefined') {
      onError?.('not-supported');
      return;
    }

    try {
      cleanupAudio();
      const audioBlob = await synthesizeSpeech(text, { voice, instructions });
      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectUrl);

      objectUrlRef.current = objectUrl;
      audioRef.current = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        cleanupAudio();
        onEnd?.();
      };
      audio.onerror = () => {
        cleanupAudio();
        onError?.('audio-playback-failed');
      };

      await audio.play();
    } catch (error) {
      cleanupAudio();
      onError?.(error.message || 'tts-failed');
    }
  }, [cleanupAudio, speakWithBrowser]);

  const cancel = useCallback(() => {
    cleanupAudio();
  }, [cleanupAudio]);

  const isSupported =
    typeof window !== 'undefined' &&
    (hasBrowserTTS || typeof Audio !== 'undefined');

  return { speak, cancel, isSupported };
}
