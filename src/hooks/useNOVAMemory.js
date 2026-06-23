import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'nova_visitor_memory';
const MAX_TOPICS  = 12;

/**
 * useNOVAMemory
 * Persists conversation highlights in localStorage.
 * Returns memory object + helpers to read/write it.
 */
export function useNOVAMemory() {
  const [memory, setMemory] = useState(null);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMemory(parsed);
      } else {
        // First-time visitor
        const fresh = {
          visitCount : 1,
          firstVisit : new Date().toISOString(),
          lastVisit  : new Date().toISOString(),
          topics     : [],          // topics the visitor asked about
          lastName   : null,        // if visitor told NOVA their name
          lastQuestion: null,       // last question asked
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        setMemory(fresh);
      }
    } catch {
      setMemory(null);
    }
  }, []);

  // Call this on every new page load after first
  const bumpVisit = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const m = JSON.parse(raw);
      m.visitCount = (m.visitCount || 0) + 1;
      m.lastVisit  = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
      setMemory({ ...m });
    } catch {}
  }, []);

  // Record a topic from user message
  const recordTopic = useCallback((userMessage) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const m = JSON.parse(raw);

      // Extract topic keywords
      const lower = userMessage.toLowerCase();
      const topicMap = [
        { key: 'pricing',    words: ['price', 'cost', 'rate', 'charge', 'budget', 'pricing', 'fee'] },
        { key: 'projects',   words: ['project', 'work', 'portfolio', 'case', 'bloom', 'nova', 'folio', 'pulse', 'verdant'] },
        { key: 'skills',     words: ['skill', 'tool', 'figma', 'react', 'three', 'python', 'tech', 'stack'] },
        { key: 'experience', words: ['experience', 'background', 'years', 'history', 'worked', 'career'] },
        { key: 'contact',    words: ['contact', 'hire', 'available', 'email', 'reach', 'book'] },
        { key: 'about',      words: ['about', 'who', 'shadab', 'person', 'life', 'interest'] },
      ];

      const matched = topicMap.find(t => t.words.some(w => lower.includes(w)));
      if (matched && !m.topics.includes(matched.key)) {
        m.topics = [...m.topics.slice(-(MAX_TOPICS - 1)), matched.key];
      }

      // Try to extract name if visitor says "I'm X" or "my name is X"
      const nameMatch = lower.match(/(?:i'm|i am|my name is)\s+([a-z]+)/);
      if (nameMatch) m.lastName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);

      m.lastQuestion = userMessage.slice(0, 120);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
      setMemory({ ...m });
    } catch {}
  }, []);

  // Build a personal greeting based on memory
  const buildGreeting = useCallback((memory) => {
    if (!memory) return null;

    const isReturning = memory.visitCount > 1;
    if (!isReturning) return null;

    const name     = memory.lastName;
    const topics   = memory.topics || [];
    const lastQ    = memory.lastQuestion;
    const visits   = memory.visitCount;

    const nameStr  = name ? `, ${name}` : '';
    const visitStr = visits >= 5 ? `You've visited ${visits} times now` : visits === 2 ? 'Welcome back' : `Back again`;

    if (topics.length === 0) {
      return `${visitStr}${nameStr}! 👋 Great to see you again. What can I help you with today?`;
    }

    const topicLabels = {
      pricing:    'pricing & rates',
      projects:   "Shadab's projects",
      skills:     'his technical skills',
      experience: 'his background',
      contact:    'getting in touch',
      about:      'who Shadab is',
    };

    const lastTopic = topicLabels[topics[topics.length - 1]] || 'the portfolio';

    if (lastQ && topics.length >= 2) {
      return `${visitStr}${nameStr}! Last time you were digging into ${lastTopic}. Want to pick up where you left off, or is there something new I can help with?`;
    }

    return `${visitStr}${nameStr}! Last time you asked about ${lastTopic}. Anything else you'd like to explore?`;
  }, []);

  const clearMemory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMemory(null);
  }, []);

  return { memory, bumpVisit, recordTopic, buildGreeting, clearMemory };
}
