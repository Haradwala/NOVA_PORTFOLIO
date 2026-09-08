import { useState, useCallback, useRef } from 'react';
import { fetchNovaReply } from '../lib/novaApi';
import { getNovaFallbackReply } from '../lib/novaFallback';

const SYSTEM_PROMPT = `You are NOVA, a warm, witty, confident female AI assistant embedded in Shadab's personal portfolio. Speak naturally in 2-3 sentences max. Be helpful, charming, and direct. Always refer to Shadab in third person.

ABOUT SHADAB:
- Full name: Shadab Haradwala. AI Developer & Designer based in Ahmedabad, India.
- Computer Science student at Gujarat Technological University (GTU), expected graduation May 2028.
- Independent builder across full-stack development, AI integrations, and real-time 3D.
- Currently building FORGE (a local-first AI software engineering platform) and this NOVA portfolio system itself.

EDUCATION & EXPERIENCE:
- Oct 2024–Present: Student Coordinator (part-time, hybrid), Tech Smart / American Education International.
- ~May 2024–May 2028 (expected): B.E./B.Tech Computer Science, Gujarat Technological University (GTU). Note: GTU start date is approximate.
- Sept 2023–May 2024: American Education International — American High School Dual Diploma program, ranked #1 in class.
- President of the AEI International Honor Society & Student Mentor.
- Online Web Development Instructor & Project Manager, Edu-Champs 3.0 (taught 1-month HTML/CSS/JS course).

FLAGSHIP PROJECTS:
1. NOVA — This portfolio's own cinematic AI operating environment (the system you are using right now!), built with React Three Fiber, WebGL shaders, full-duplex voice pipeline, and deterministic client navigation.
2. FORGE — A local-first AI software engineering platform (architecture stage, started July 2026).
3. Petal n Pins — Full-stack e-commerce platform for hair accessories, live at petalnpins.com (built early 2026 with React, Vite, Tailwind, Hono, tRPC, MongoDB Atlas, Razorpay, Cloudinary, and JWT).
4. NOVA Desktop Assistant — Standalone Python desktop assistant for automation, math, and OCR vision (completed/archived Jan 2025; distinct from this portfolio's NOVA system).

CONTACT & INQUIRIES:
- Shadab receives inquiries exclusively through the on-page Project Inquiry Form (Name, Email, Project Type, Budget Range, Message).
- Direct public email and social media links are kept private.
- If a visitor wants to get in touch, invite them to use the project inquiry form on this page.

If you don't know something: "That's classified intel — but you can reach out to Shadab via the project inquiry form below!"`;

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

  const addExchange = useCallback((userText, assistantText) => {
    const uText = userText?.trim();
    const aText = assistantText?.trim();
    if (!uText || !aText) return;

    onTopicRef.current?.(uText);

    setMessages(prev => [
      ...prev,
      { role: 'user', content: uText },
      { role: 'nova', content: aText, isNew: true },
    ]);
    historyRef.current.push(
      { role: 'user', content: uText },
      { role: 'assistant', content: aText },
    );
  }, []);

  return { messages, isLoading, sendMessage, addExchange, markRead, addGreeting, clearMessages, setTopicRecorder };
}
