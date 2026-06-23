import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, ADMIN_PASSWORD } from '../lib/supabase';
import UniverseCanvas from '../components/UniverseCanvas';

export default function AdminDashboard() {
  const [authed,   setAuthed]   = useState(false);
  const [pw,       setPw]       = useState('');
  const [pwErr,    setPwErr]    = useState(false);
  const [convs,    setConvs]    = useState([]);
  const [active,   setActive]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [unread,   setUnread]   = useState({});
  const bottomRef = useRef(null);

  // ── Login ──────────────────────────────────────────────────
  const login = (e) => {
    e?.preventDefault?.();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwErr(false); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 2000); }
  };

  // ── Load all conversations ─────────────────────────────────
  useEffect(() => {
    if (!authed) return;

    const loadConvs = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, client_name, client_token, last_seen, created_at')
        .order('last_seen', { ascending: false });
      if (!error) setConvs(data || []);
    };

    loadConvs();

    const ch = supabase.channel('admin:convs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, loadConvs)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [authed]);

  // ── Load messages for active conversation ──────────────────
  useEffect(() => {
    if (!active) return;

    const loadMsgs = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', active.id)
        .order('created_at', { ascending: true });
      if (!error) setMessages(data || []);
      setUnread(u => ({ ...u, [active.id]: 0 }));
    };

    loadMsgs();

    const ch = supabase.channel(`admin:msgs:${active.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${active.id}`,
      }, ({ new: msg }) => {
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [active]);

  // ── Track unread from all convs ────────────────────────────
  useEffect(() => {
    if (!authed) return;
    const ch = supabase.channel('admin:all-msgs')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, ({ new: msg }) => {
        if (msg.role === 'admin') return;
        if (active?.id === msg.conversation_id) return;
        setUnread(u => ({ ...u, [msg.conversation_id]: (u[msg.conversation_id] || 0) + 1 }));
        setConvs(prev => {
          const idx = prev.findIndex(c => c.id === msg.conversation_id);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = { ...updated[idx], last_seen: new Date().toISOString() };
          return [...updated].sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));
        });
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [authed, active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send reply ─────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput('');
    await supabase.from('messages').insert({
      conversation_id: active.id, role: 'admin', content: text,
    });
    await supabase.from('conversations')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', active.id);
  }, [input, active]);

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date(), diff = now - d;
    if (diff < 60000)     return 'just now';
    if (diff < 3600000)   return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000)  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ── Get display info for client ────────────────────────────
  // client_token is the Supabase user ID (UUID) for auth-based clients
  const getClientInfo = (conv) => {
    const name = conv.client_name || 'Unknown';
    // Show initials from name
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    // Generate consistent color from name
    const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return { name, initials, hue };
  };

  // ── Login screen ───────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <UniverseCanvas />
      <form onSubmit={login} style={{
        position: 'relative', zIndex: 5, width: 360,
        background: 'rgba(14,10,35,.95)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,.22)', borderRadius: 24,
        padding: '2.5rem', textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,.6)',
        animation: 'fadeUp .5s ease both',
      }}>
        <div style={{ fontSize: '1.8rem', marginBottom: '.6rem' }}>🔐</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: '.3rem' }}>
          Admin Access
        </h2>
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '1.6rem' }}>
          Shadab's client dashboard
        </p>
        <input
          autoFocus type="password" placeholder="Password"
          value={pw} onChange={e => setPw(e.target.value)}
          style={{
            width: '100%', padding: '.72rem 1rem', borderRadius: 50,
            background: `rgba(139,92,246,.08)`,
            border: `1px solid ${pwErr ? 'rgba(248,113,113,.5)' : 'rgba(139,92,246,.22)'}`,
            color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem',
            outline: 'none', marginBottom: '.85rem', boxSizing: 'border-box',
            transition: 'border-color .2s',
          }}
        />
        {pwErr && (
          <div style={{ fontSize: '.72rem', color: '#F87171', marginBottom: '.85rem' }}>
            Incorrect password
          </div>
        )}
        <button type="submit" style={{
          width: '100%', padding: '.75rem', borderRadius: 50,
          background: 'linear-gradient(135deg,var(--rose),var(--violet))',
          border: 'none', color: '#fff',
          fontFamily: "'DM Sans',sans-serif", fontSize: '.82rem', fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,.35)',
        }}>
          Enter Dashboard
        </button>
      </form>
    </div>
  );

  // ── Dashboard ──────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
      <UniverseCanvas />

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 280, flexShrink: 0, zIndex: 10,
        background: 'rgba(10,7,26,.97)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(139,92,246,.14)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.2rem 1.1rem 1rem', borderBottom: '1px solid rgba(139,92,246,.1)' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
            Shadab<span style={{ color: 'var(--rose)' }}>.</span>
            <span style={{ fontSize: '.7rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--muted)', marginLeft: 5 }}>Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 5px #4ADE80' }} />
            <span style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#4ADE80' }}>
              {convs.length} client{convs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Client list */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,.15) transparent' }}>
          {convs.length === 0 ? (
            <div style={{ padding: '2.5rem 1.2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.78rem', lineHeight: 1.8 }}>
              No clients yet.<br />
              <span style={{ fontSize: '.68rem', opacity: .6 }}>Clients sign up at<br />/chat</span>
            </div>
          ) : convs.map(conv => {
            const { name, initials, hue } = getClientInfo(conv);
            const isActive  = active?.id === conv.id;
            const unreadCnt = unread[conv.id] || 0;
            return (
              <div key={conv.id}
                onClick={() => setActive(conv)}
                style={{
                  padding: '.9rem 1.1rem', cursor: 'pointer',
                  background: isActive ? 'rgba(139,92,246,.13)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--violet2)' : 'transparent'}`,
                  borderBottom: '1px solid rgba(139,92,246,.06)',
                  transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(139,92,246,.07)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${hue},55%,32%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.78rem', fontWeight: 700, color: '#fff',
                  border: isActive ? '2px solid rgba(139,92,246,.4)' : '2px solid transparent',
                  transition: 'border .15s',
                }}>{initials}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '.82rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </span>
                    <span style={{ fontSize: '.58rem', color: 'var(--muted)', flexShrink: 0, marginLeft: 4 }}>
                      {formatTime(conv.last_seen)}
                    </span>
                  </div>
                  <div style={{ fontSize: '.64rem', color: 'rgba(90,90,120,.7)' }}>
                    Joined {formatTime(conv.created_at)}
                  </div>
                </div>

                {unreadCnt > 0 && (
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--rose)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '.62rem', fontWeight: 700, color: '#fff',
                    boxShadow: '0 0 8px rgba(232,149,109,.5)',
                  }}>{unreadCnt > 9 ? '9+' : unreadCnt}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHAT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 5, position: 'relative', overflow: 'hidden' }}>

        {!active ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: .4, userSelect: 'none' }}>
            <div style={{ fontSize: '3.5rem' }}>✦</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', color: 'var(--muted)' }}>
              Select a client to view their chat
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              flexShrink: 0, padding: '1rem 1.5rem',
              background: 'rgba(10,7,26,.95)', backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(139,92,246,.12)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {(() => {
                const { name, initials, hue } = getClientInfo(active);
                return (
                  <>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `hsl(${hue},55%,32%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.85rem', flexShrink: 0 }}>{initials}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>{name}</div>
                      <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>Last active {formatTime(active.last_seen)}</div>
                    </div>
                  </>
                );
              })()}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/chat`;
                    navigator.clipboard.writeText(link).catch(() => {});
                    alert('Client portal link copied!');
                  }}
                  style={{
                    padding: '.38rem .9rem', borderRadius: 50, cursor: 'pointer',
                    border: '1px solid rgba(139,92,246,.2)', background: 'rgba(139,92,246,.07)',
                    color: 'var(--violet2)', fontSize: '.62rem', letterSpacing: '.08em',
                    textTransform: 'uppercase', transition: 'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,.07)'}
                >Copy Portal Link</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '1.5rem',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,.15) transparent',
            }}>
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {messages.map((m) => {
                  const isAdmin  = m.role === 'admin';
                  const isClient = m.role === 'client';
                  const { name, initials, hue } = getClientInfo(active);

                  return (
                    <div key={m.id} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-end',
                      flexDirection: isAdmin ? 'row-reverse' : 'row',
                      animation: 'msgIn .3s ease both',
                    }}>
                      {!isAdmin && (
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: isClient ? `hsl(${hue},55%,32%)` : 'linear-gradient(135deg,var(--rose),var(--violet))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.62rem', fontWeight: 700, color: '#fff',
                        }}>{isClient ? initials : '✦'}</div>
                      )}

                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ fontSize: '.54rem', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3, textAlign: isAdmin ? 'right' : 'left', color: isAdmin ? 'var(--rose)' : isClient ? 'rgba(160,160,192,.5)' : 'var(--violet2)' }}>
                          {isAdmin ? 'You' : isClient ? name : 'NOVA'} · {formatTime(m.created_at)}
                        </div>
                        <div style={{
                          padding: '.7rem 1rem',
                          borderRadius: isAdmin ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                          background: isAdmin
                            ? 'rgba(232,149,109,.12)'
                            : isClient
                            ? 'rgba(255,255,255,.05)'
                            : 'rgba(139,92,246,.1)',
                          border: isAdmin
                            ? '1px solid rgba(232,149,109,.22)'
                            : isClient
                            ? '1px solid rgba(255,255,255,.09)'
                            : '1px solid rgba(139,92,246,.2)',
                          fontSize: '.81rem', lineHeight: 1.8, color: 'var(--text)',
                          wordBreak: 'break-word',
                        }}>{m.content}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Reply input */}
            <div style={{
              flexShrink: 0, padding: '1rem 1.5rem',
              background: 'rgba(10,7,26,.95)', backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(139,92,246,.12)',
            }}>
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder={`Reply to ${active.client_name}…`}
                  style={{
                    flex: 1, padding: '.7rem 1.2rem', borderRadius: 50,
                    background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.18)',
                    color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '.83rem',
                    outline: 'none', transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor='rgba(139,92,246,.45)'}
                  onBlur={e => e.target.style.borderColor='rgba(139,92,246,.18)'}
                />
                <button onClick={sendReply} disabled={!input.trim()}
                  style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                    background: 'linear-gradient(135deg,var(--rose),var(--violet))',
                    border: 'none', color: '#fff', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: !input.trim() ? .4 : 1, transition: 'all .2s',
                    boxShadow: '0 4px 16px rgba(139,92,246,.35)',
                  }}
                  onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform='scale(1.1)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                >➤</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
