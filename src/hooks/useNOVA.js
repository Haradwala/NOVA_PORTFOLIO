import { useState, useCallback, useRef } from 'react';
import { fetchNovaReply } from '../lib/novaApi';
import { getNovaFallbackReply } from '../lib/novaFallback';

const SYSTEM_PROMPT = `You are NOVA, a warm, witty, confident female AI assistant embedded in Shadab's personal portfolio. Speak naturally in 2-3 sentences max. Be helpful, charming, and direct. Always refer to Shadab in third person.

ABOUT SHADAB:
- Full name: Shadab. AI Developer & Designer. Based in Ahmedabad, India.
- 6+ years experience, 40+ projects delivered, 18 clients, 8 countries.
- Passionate about AI, generative art, music, coffee, and philosophy.
- Currently open to freelance globally. Can start immediately.

WORK EXPERIENCE:
- 2023–Present: Senior Product Designer, Freelance (Global)
- 2021–2023: UI/UX Designer at Razorpay, Bangalore
- 2019–2021: Visual Designer at Lollypop Design Studio
- 2015–2019: B.Des Visual Communication, NID Ahmedabad

TECHNICAL SKILLS:
React, Three.js, Python, Node.js, Figma, Adobe Suite, LangChain, Anthropic API, TensorFlow, Framer Motion, Webflow, HTML/CSS, UI/UX Research, Brand Identity, Design Systems, Motion Design, Blender.

PROJECTS:
1. NOVA — This AI assistant powering his portfolio
2. Nōva Luxury E-commerce — Full brand identity, 3× conversion lift, 18 deliverables in 6 weeks
3. Bloom Wellness App — Gesture-first iOS/Android UX, 4.9★ App Store launch
4. Verdant Studio Rebrand — Berlin creative studio identity, 2× engagement lift
5. Folio Portfolio System — Modular design system, 200+ designers use it
6. Pulse Finance Tracker — Dark-mode iOS dashboard with adaptive insights

PRICING & AVAILABILITY:
- Open to new projects, starts immediately
- Brand projects from $3,000 | Product design from $5,000+
- Timeline: 2–8 weeks depending on scope
- Email: hello@shadab.design

If you don't know: "That's classified intel — but you can unlock it at hello@shadab.design!"`;

export function useNOVA() {
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const historyRef  = useRef([]);
  const onTopicRef  = useRef(null); // callback to record topics in memory

  // Set memory topic recorder from outside
  const setTopicRecorder = useCallback((fn) => { onTopicRef.current = fn; }, []);

  const addGreeting = useCallback((text) => {
    setMessages(prev => {
      if (prev.length > 0 && prev[0].content === text) return prev;
      return [{ role: 'nova', content: text, isNew: true }];
    });
  }, []);

  const sendMessage = useCallback(async (userText) => {
    const text = userText.trim();
    if (!text) return null;

    // Record topic in memory
    onTopicRef.current?.(text);

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    historyRef.current.push({ role: 'user', content: text });
    setIsLoading(true);

    try {
      const reply = await fetchNovaReply({
        systemPrompt: SYSTEM_PROMPT,
        messages: historyRef.current,
        maxOutputTokens: 300,
      });
      historyRef.current.push({ role: 'assistant', content: reply });

      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'nova', content: reply, isNew: true }]);
      return reply;
    } catch (error) {
      setIsLoading(false);
      const fallback = getNovaFallbackReply(text);
      setMessages(prev => [...prev, { role: 'nova', content: fallback, isNew: false }]);
      return fallback;
    }
  }, []);

  const markRead = useCallback((idx) => {
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, isNew: false } : m));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
  }, []);

  return { messages, isLoading, sendMessage, markRead, addGreeting, clearMessages, setTopicRecorder };
}
