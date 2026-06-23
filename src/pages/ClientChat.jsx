import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import UniverseCanvas from '../components/UniverseCanvas';
import ClientAuth from './ClientAuth.jsx';
import { fetchNovaReply } from '../lib/novaApi';
import { getNovaFallbackReply } from '../lib/novaFallback';

// ── NOVA system prompt ────────────────────────────────────────────────
const NOVA_SYSTEM = `You are NOVA, the AI assistant for Shadab — an AI Developer & Designer based in Ahmedabad, India.
Be warm, helpful, and conversational. Keep replies to 2-3 sentences unless detail is needed.

ABOUT SHADAB:
- AI Developer & Designer, 6+ years, 40+ projects, 18 clients in 8 countries
- Available for freelance globally, can start immediately

SERVICES & PRICING:
- Brand Identity: from $3,000
- Product/App Design: from $5,000
- AI Integration / Development: from $4,000
- Timeline: 2–8 weeks

CONTACT: hello@shadab.design

When clients want to start a project, encourage them to share details here — Shadab will personally see this chat and reply.`;

// ── Call NOVA API ────────────────────────────────────────────────────
async function callNOVA(history) {
  try {
    return await fetchNovaReply({
      systemPrompt: NOVA_SYSTEM,
      messages: history,
      maxOutputTokens: 350,
    });
  } catch (e) {
    console.error('[NOVA]', e.message);
    return getNovaFallbackReply(history);
  }
}

// ── Build correct message history for Claude ─────────────────────────
// Claude requires: alternating user/assistant, starting with user
function buildHistory(messages) {
  const result = [];
  for (const m of messages) {
    const role = m.role === 'client' ? 'user' : 'assistant';
    if (result.length > 0 && result[result.length - 1].role === role) {
      // Merge consecutive same-role messages
      result[result.length - 1].content += '\n' + m.content;
    } else {
      result.push({ role, content: m.content });
    }
  }
  // Must start with user
  while (result.length > 0 && result[0].role === 'assistant') result.shift();
  return result.slice(-20);
}

// ── Main component ───────────────────────────────────────────────────
export default function ClientChat() {
  const [user,     setUser]     = useState(null);
  const [userName, setUserName] = useState('');
  const [convId,   setConvId]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [typing,   setTyping]   = useState(false);
  const [initErr,  setInitErr]  = useState('');
  const bottomRef  = useRef(null);
  const initDone   = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const n = session.user.user_metadata?.full_name
               || session.user.email?.split('@')[0]
               || 'Friend';
        setUser(session.user);
        setUserName(n);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        const n = session.user.user_metadata?.full_name
               || session.user.email?.split('@')[0]
               || 'Friend';
        setUser(session.user);
        setUserName(n);
      } else {
        setUser(null);
        setUserName('');
        setConvId(null);
        setMessages([]);
        initDone.current = false;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Init conversation once user is known
  useEffect(() => {
    if (!user || initDone.current) return;
    initDone.current = true;
    initConversation(user, userName);
  }, [user, userName]);

  const initConversation = async (u, name) => {
    setInitErr('');
    try {
      // Use .maybeSingle() instead of .single() — returns null instead of error when not found
      const { data: existing, error: findErr } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_token', u.id)
        .maybeSingle();

      if (findErr) throw findErr;

      let convId;

      if (existing) {
        convId = existing.id;
        // Update last_seen
        await supabase
          .from('conversations')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', convId);
      } else {
        // Create new conversation — without client_email to avoid schema issues
        const { data: created, error: createErr } = await supabase
          .from('conversations')
          .insert({
            client_name:  name,
            client_token: u.id,
          })
          .select('id')
          .single();

        if (createErr) throw createErr;
        convId = created.id;

        // Insert NOVA welcome
        const welcome = `Hey ${name}! 👋 I'm NOVA, Shadab's AI assistant. I can answer anything about his work, pricing, and availability. If you have a project in mind, just share the details here — Shadab reads every message and will reply personally. What can I help you with?`;
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'nova',
          content: welcome,
        });
      }

      // Load history
      const { data: msgs, error: msgsErr } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgsErr) throw msgsErr;

      setConvId(convId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('[initConversation]', err);
      setInitErr(err.message || 'Could not connect. Please refresh and try again.');
      initDone.current = false; // allow retry
    }
  };

  // Real-time: new messages (from admin or nova)
  useEffect(() => {
    if (!convId) return;
    const ch = supabase
      .channel(`client:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, ({ new: msg }) => {
        setMessages(prev =>
          prev.find(m => m.id === msg.id) ? prev : [...prev, msg]
        );
        setTyping(false);
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [convId]);

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !convId || sending) return;
    setInput('');
    setSending(true);

    // Optimistic UI — add message locally first
    const tempId = `temp-${Date.now()}`;
    const tempMsg = { id: tempId, role: 'client', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    // Save to DB
    const { data: saved, error: saveErr } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'client', content: text })
      .select('id, role, content, created_at')
      .single();

    if (saveErr) {
      console.error('[send]', saveErr);
      setSending(false);
      return;
    }

    // Replace temp message with real one
    setMessages(prev => prev.map(m => m.id === tempId ? saved : m));

    // Build history for NOVA (all msgs up to now + this new one)
    const allForHistory = [...messages, { role: 'client', content: text }];
    const history = buildHistory(allForHistory);

    // Show typing
    setTyping(true);

    // Call NOVA
    const reply = await callNOVA(history);
    setTyping(false);

    // Save NOVA reply
    await supabase.from('messages').insert({
      conversation_id: convId, role: 'nova', content: reply,
    });

    // Update last_seen
    await supabase.from('conversations')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', convId);

    setSending(false);
  }, [input, convId, sending, messages]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ── States ──────────────────────────────────────────────────────
  if (!user) {
    return <ClientAuth onAuth={(u, n) => { setUser(u); setUserName(n); }} />;
  }

  if (initErr) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <UniverseCanvas />
        <div style={{ zIndex: 5, textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ color: '#F87171', fontSize: '.85rem', marginBottom: '1.2rem', lineHeight: 1.7 }}>{initErr}</div>
          <button onClick={() => { initDone.current = false; initConversation(user, userName); }}
            style={{ padding: '.7rem 1.5rem', borderRadius: 50, background: 'linear-gradient(135deg,var(--rose),var(--violet))', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '.8rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!convId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <UniverseCanvas />
        <div style={{ zIndex: 5, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'pulse 1.2s ease-in-out infinite' }}>✦</div>
          <div style={{ fontSize: '.7rem', letterSpacing: '.18em', textTransform: 'uppercase' }}>Setting up your space…</div>
        </div>
      </div>
    );
  }

  // ── Chat UI ──────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      <UniverseCanvas />

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, zIndex: 100,
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(7,7,15,.93)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,.15)',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--rose),var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.15rem', boxShadow: '0 0 18px rgba(139,92,246,.45)',
          animation: typing ? 'orbFloat .6s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}>✦</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>
            NOVA
            <span style={{ fontSize: '.68rem', color: 'var(--muted)', fontFamily: "'DM Sans',sans-serif", fontWeight: 400, marginLeft: 8 }}>
              Shadab's AI Assistant
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: typing ? 'var(--violet2)' : '#4ADE80', boxShadow: `0 0 5px ${typing ? 'var(--violet2)' : '#4ADE80'}`, transition: 'all .3s' }} />
            <span style={{ fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: typing ? 'var(--violet2)' : '#4ADE80', transition: 'color .3s' }}>
              {typing ? 'Typing…' : `Online · Hi ${userName}!`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <a href="/" style={{
            padding: '.38rem .85rem', borderRadius: 50, textDecoration: 'none',
            border: '1px solid rgba(139,92,246,.2)', color: 'var(--muted)',
            fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--violet2)'; e.currentTarget.style.borderColor='rgba(139,92,246,.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='rgba(139,92,246,.2)'; }}
          >Portfolio ↗</a>
          <button onClick={logout} style={{
            padding: '.38rem .85rem', borderRadius: 50, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.08)', background: 'none',
            color: 'var(--muted)', fontSize: '.62rem', letterSpacing: '.08em',
            textTransform: 'uppercase', transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='#F87171'; e.currentTarget.style.borderColor='rgba(248,113,113,.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; }}
          >Log out</button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1.5rem 1.5rem 1rem',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,.2) transparent',
        zIndex: 5, position: 'relative',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>

          {messages.map((m) => {
            const isMe    = m.role === 'client';
            const isAdmin = m.role === 'admin';

            return (
              <div key={m.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-end',
                flexDirection: isMe ? 'row-reverse' : 'row',
                animation: 'msgIn .3s ease both',
              }}>
                {!isMe && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isAdmin
                      ? 'linear-gradient(135deg,#E8956D,#C0392B)'
                      : 'linear-gradient(135deg,var(--rose),var(--violet))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', fontWeight: 700, color: '#fff',
                    boxShadow: isAdmin ? '0 0 10px rgba(232,149,109,.4)' : '0 0 10px rgba(139,92,246,.4)',
                  }}>
                    {isAdmin ? 'S' : '✦'}
                  </div>
                )}

                <div style={{ maxWidth: '74%' }}>
                  {!isMe && (
                    <div style={{ fontSize: '.55rem', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 2, color: isAdmin ? 'var(--rose)' : 'var(--violet2)' }}>
                      {isAdmin ? 'Shadab' : 'NOVA'}
                    </div>
                  )}
                  <div style={{
                    padding: '.72rem 1.05rem',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: isMe
                      ? 'rgba(232,149,109,.13)'
                      : isAdmin
                      ? 'rgba(232,149,109,.09)'
                      : 'rgba(139,92,246,.11)',
                    border: isMe
                      ? '1px solid rgba(232,149,109,.25)'
                      : isAdmin
                      ? '1px solid rgba(232,149,109,.22)'
                      : '1px solid rgba(139,92,246,.22)',
                    fontSize: '.83rem', lineHeight: 1.8, color: 'var(--text)',
                    wordBreak: 'break-word',
                  }}>{m.content}</div>
                </div>
              </div>
            );
          })}

          {typing && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', animation: 'msgIn .3s ease both' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--rose),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: '#fff' }}>✦</div>
              <div style={{ padding: '.72rem 1rem', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.22)', borderRadius: '4px 18px 18px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, .18, .36].map((d, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet2)', animation: `dotBounce 1.2s ${d}s ease infinite` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div style={{
        flexShrink: 0, zIndex: 100,
        padding: '1rem 1.5rem 1.2rem',
        background: 'rgba(7,7,15,.93)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(139,92,246,.12)',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={sending ? 'NOVA is thinking…' : 'Ask NOVA anything…'}
              disabled={sending}
              style={{
                flex: 1, padding: '.75rem 1.2rem', borderRadius: 50,
                background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.18)',
                color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '.84rem',
                outline: 'none', transition: 'border-color .2s',
                opacity: sending ? .65 : 1,
              }}
              onFocus={e => e.target.style.borderColor='rgba(139,92,246,.5)'}
              onBlur={e => e.target.style.borderColor='rgba(139,92,246,.18)'}
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--rose),var(--violet))',
                border: 'none', color: '#fff', fontSize: '1.05rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: sending || !input.trim() ? .4 : 1, transition: 'all .2s',
                boxShadow: '0 4px 16px rgba(139,92,246,.4)',
              }}
              onMouseEnter={e => { if (!sending && input.trim()) e.currentTarget.style.transform='scale(1.1)'; }}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            >➤</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '.45rem', fontSize: '.58rem', color: 'rgba(90,90,120,.55)', letterSpacing: '.06em' }}>
            Shadab personally reads every conversation and will follow up on project enquiries
          </div>
        </div>
      </div>
    </div>
  );
}
