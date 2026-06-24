import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { NOVASceneV3 } from '../../features/nova-v3/components/NOVASceneV3';
import { useNOVAV3 } from '../../features/nova-v3/hooks/useNOVAV3';
import { useNeuralBeams } from './useNeuralBeams';
import { useVoiceHalo } from './useVoiceHalo';
import { useTranscript } from './useTranscript';
import { NeuralBeams } from './NeuralBeams';
import { CORE_NODES } from './constants';

/** State-driven styles for the clickable core overlay */
const CORE_STATE_STYLES = {
  idle: {
    ring:   'rgba(139,92,246,0)',
    glow:   '0 0 40px rgba(139,92,246,0.08)',
    cursor: 'pointer',
    scale:  'scale(1)',
  },
  hover: {
    ring:   'rgba(139,92,246,0.18)',
    glow:   '0 0 70px rgba(139,92,246,0.22), 0 0 120px rgba(232,149,109,0.08)',
    cursor: 'pointer',
    scale:  'scale(1.03)',
  },
  listening: {
    ring:   'rgba(232,149,109,0.35)',
    glow:   '0 0 60px rgba(232,149,109,0.5), 0 0 120px rgba(232,149,109,0.2)',
    cursor: 'pointer',
    scale:  'scale(1)',
  },
  thinking: {
    ring:   'rgba(45,212,191,0.25)',
    glow:   '0 0 60px rgba(45,212,191,0.35), 0 0 100px rgba(139,92,246,0.18)',
    cursor: 'default',
    scale:  'scale(0.97)',
  },
  speaking: {
    ring:   'rgba(45,212,191,0.4)',
    glow:   '0 0 80px rgba(45,212,191,0.5), 0 0 140px rgba(45,212,191,0.15)',
    cursor: 'pointer',
    scale:  'scale(1)',
  },
};

const SUBTITLE = {
  idle:      'Ask NOVA anything.',
  listening: 'Listening…',
  thinking:  'Thinking…',
  speaking:  'Speaking…',
};

const SUBTITLE_COLOR = {
  idle:      'rgba(140,130,175,0.7)',
  listening: '#E8956D',
  thinking:  '#2DD4BF',
  speaking:  '#2DD4BF',
};

/** Expanding pulse ring that fires when entering listening state */
function PulseRing({ active }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '1.5px solid rgba(232,149,109,0.55)',
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        animation: active ? 'novaPulseRing 1.4s cubic-bezier(0.16,1,0.3,1) infinite' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}

export default function NovaCoreV2({
  duplexState = 'idle',
  onClickNode,
  onCoreClick,
  activeSubNodes = [],
  highlightedNode = null,
}) {
  const [forcedState, setForcedState] = useState(null);
  const [forcedAmp,   setForcedAmp]   = useState(null);
  const [forcedText,  setForcedText]  = useState(null);
  const [hovered,     setHovered]     = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get('state');
    if (s && ['idle','listening','thinking','speaking','awareness'].includes(s)) setForcedState(s);
    const a = params.get('amp');
    if (a) setForcedAmp(parseFloat(a));
    const t = params.get('transcript');
    if (t) setForcedText(t);
  }, []);

  const activeDuplexState  = forcedState || duplexState;
  const isForcedAwareness  = forcedState === 'awareness';
  const effectiveState     = isForcedAwareness ? 'listening' : activeDuplexState;

  // Visual state key for styling (hover overrides idle only)
  const isInteractable = effectiveState === 'idle' || effectiveState === 'listening' || effectiveState === 'speaking';
  const visualKey = hovered && effectiveState === 'idle' ? 'hover' : effectiveState;
  const styles = CORE_STATE_STYLES[visualKey] || CORE_STATE_STYLES.idle;

  const { stateRef, setState, setVoiceAmplitude, setAttention } = useNOVAV3();

  const parentRef  = useRef(null);
  const canvasRef  = useRef(null);
  const labelRefs  = useRef({});

  const [hoveredNode, setHoveredNode] = useState(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth > 1024
  );

  const leftNodes  = ['About', 'Skills'];
  const rightNodes = ['Projects', 'Contact'];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { beamCoords } = useNeuralBeams({
    parentRef, canvasRef, labelRefs, activeSubNodes, isDesktop,
  });

  const { amp } = useVoiceHalo({
    duplexState: effectiveState,
    setState: (s) => {
      if (isForcedAwareness) setState(1);
      else setState(s);
    },
    setVoiceAmplitude: (a) => {
      if      (isForcedAwareness)     setVoiceAmplitude(0.85);
      else if (forcedAmp !== null)    setVoiceAmplitude(forcedAmp);
      else                            setVoiceAmplitude(a);
    },
  });

  const effectiveAmp  = isForcedAwareness ? 0.85 : (forcedAmp !== null ? forcedAmp : amp);
  const { liveText }  = useTranscript({ duplexState: effectiveState });
  const effectiveText = forcedText || liveText;

  // ── Node buttons ────────────────────────────────────────────────────────────
  const renderNodeButton = (label) => {
    const isHov    = hoveredNode === label;
    const isActive = isHov || highlightedNode === label;
    const nodeInfo = CORE_NODES.find((n) => n.label === label) || {};
    const alignLeft = isDesktop && leftNodes.includes(label);

    return (
      <button
        key={label}
        ref={(el) => (labelRefs.current[label] = el)}
        onMouseEnter={() => {
          setHoveredNode(label);
          const beam = beamCoords.find((b) => b.label === label);
          if (beam) setAttention([Math.cos(beam.angle), Math.sin(beam.angle), 0.5], 0.8);
        }}
        onMouseLeave={() => { setHoveredNode(null); setAttention([0,0,1], 0.0); }}
        onClick={() => onClickNode(label)}
        style={{ pointerEvents: 'auto' }}
        className={`flex flex-col bg-transparent border-none outline-none cursor-pointer p-2 select-none transition-all duration-300
          ${alignLeft ? 'items-end text-right' : isDesktop ? 'items-start text-left' : 'items-center text-center'}`}
      >
        <div
          className={`font-mono text-[9px] font-semibold tracking-[0.14em] uppercase flex items-center gap-2 transition-all duration-300
            ${alignLeft ? 'flex-row-reverse' : 'flex-row'}
            ${isActive ? 'text-[#2DD4BF] [text-shadow:0_0_10px_rgba(45,212,191,0.5)]' : 'text-[#A0A0C0]/70'}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300
              ${isActive ? 'bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]' : 'bg-[#A78BFA]/45'}`}
          />
          {label}
        </div>
        {isDesktop && (
          <div
            className={`font-sans text-[8px] transition-all duration-300
              ${isActive ? 'text-[#A0A0C0]/85' : 'text-[#A0A0C0]/45'}
              ${alignLeft ? 'pr-[13px] pl-0' : isDesktop ? 'pl-[13px] pr-0' : 'pl-0'}`}
          >
            {nodeInfo.description}
          </div>
        )}
      </button>
    );
  };

  const canvasW = canvasRef.current?.offsetWidth  ?? 440;
  const canvasH = canvasRef.current?.offsetHeight ?? 440;
  const cx     = canvasW / 2;
  const cy     = canvasH / 2;
  const radius = canvasW * 0.36;

  return (
    <>
      {/* ── Keyframe injection ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes novaPulseRing {
          0%   { transform: scale(0.88); opacity: 0.9; }
          100% { transform: scale(1.28); opacity: 0; }
        }
        @keyframes novaBreath {
          0%, 100% { box-shadow: 0 0 40px rgba(139,92,246,0.08); }
          50%       { box-shadow: 0 0 60px rgba(139,92,246,0.14); }
        }
        @keyframes novaListenRing {
          0%, 100% { box-shadow: 0 0 0 0px rgba(232,149,109,0.25); }
          50%       { box-shadow: 0 0 0 10px rgba(232,149,109,0.0); }
        }
        @keyframes novaSpeakRing {
          0%, 100% { box-shadow: 0 0 0 0px rgba(45,212,191,0.3); }
          50%       { box-shadow: 0 0 0 14px rgba(45,212,191,0.0); }
        }
        @keyframes subtitleFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        ref={parentRef}
        className={`relative flex items-center justify-center w-full max-w-[1000px] min-h-[520px]
          ${isDesktop ? 'flex-row gap-8' : 'flex-col gap-6'}`}
      >
        <NeuralBeams
          beamCoords={beamCoords}
          isDesktop={isDesktop}
          hoveredNode={hoveredNode}
          highlightedNode={highlightedNode}
          duplexState={effectiveState}
          canvasRef={canvasRef}
          cx={cx} cy={cy} radius={radius}
          amp={effectiveAmp}
        />

        {isDesktop && (
          <div className="flex flex-col gap-[1.8rem] w-[220px] z-[5]">
            {leftNodes.map(renderNodeButton)}
          </div>
        )}

        {/* ── Core column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center">

          {/* ── Clickable Core Wrapper ───────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              width:  'min(440px, 58vw)',
              height: 'min(440px, 58vw)',
              cursor: styles.cursor,
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), filter 0.35s ease',
              transform: styles.scale,
              filter: `drop-shadow(${styles.glow.replace(/box-shadow:|;/g, '')})`,
            }}
            onClick={isInteractable && onCoreClick ? onCoreClick : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role={onCoreClick ? 'button' : undefined}
            aria-label={onCoreClick ? 'Activate NOVA voice' : undefined}
          >
            {/* Expanding pulse ring on listening */}
            <PulseRing active={effectiveState === 'listening'} />

            {/* Secondary slower ring for speaking */}
            {effectiveState === 'speaking' && (
              <div style={{
                position: 'absolute', inset: '-8px',
                borderRadius: '50%',
                border: '1px solid rgba(45,212,191,0.25)',
                animation: 'novaSpeakRing 1.8s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}

            {/* Hover glow ring */}
            <div style={{
              position: 'absolute', inset: '-4px',
              borderRadius: '50%',
              border: `1px solid ${styles.ring}`,
              transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
              boxShadow: hovered && effectiveState === 'idle'
                ? '0 0 30px rgba(139,92,246,0.15)'
                : 'none',
              pointerEvents: 'none',
            }} />

            {/* Three.js Canvas */}
            <div
              ref={canvasRef}
              style={{
                width: '100%', height: '100%',
                filter: 'drop-shadow(0 0 40px rgba(100,140,220,0.12))',
                zIndex: 4,
              }}
            >
              <Canvas
                camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 3.6] }}
                gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent', width: '100%', height: '100%' }}
                dpr={[1, Math.min(window.devicePixelRatio, 2)]}
              >
                <NOVASceneV3 novaRef={stateRef} />
              </Canvas>
            </div>
          </div>

          {/* ── Transcript Strip (live speech) ─────────────────────────── */}
          {effectiveState !== 'idle' && effectiveText && (
            <div
              style={{
                marginTop: '1.2rem',
                maxWidth: 350, minHeight: 28,
                padding: '8px 18px',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 24,
                backdropFilter: 'blur(16px)',
                textAlign: 'center',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: effectiveState === 'listening' ? '#F3F4F6' : 'rgba(235,235,245,0.75)',
                animation: 'subtitleFadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
                zIndex: 10,
              }}
            >
              {effectiveState === 'listening' && (
                <span style={{ color: '#E8956D', fontWeight: 700, marginRight: 6 }}>🎤</span>
              )}
              "{effectiveText}"
            </div>
          )}

          {/* ── State Subtitle ─────────────────────────────────────────── */}
          <div
            key={effectiveState}
            style={{
              marginTop: effectiveText && effectiveState !== 'idle' ? '0.55rem' : '1.1rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.58rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: SUBTITLE_COLOR[effectiveState] || SUBTITLE_COLOR.idle,
              transition: 'color 0.4s ease',
              animation: 'subtitleFadeUp 0.4s ease both',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              userSelect: 'none',
            }}
          >
            {/* State indicator dot */}
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: SUBTITLE_COLOR[effectiveState] || SUBTITLE_COLOR.idle,
              boxShadow: `0 0 6px ${SUBTITLE_COLOR[effectiveState] || SUBTITLE_COLOR.idle}`,
              display: 'inline-block',
              animation: effectiveState !== 'idle'
                ? 'pulse 1.2s ease-in-out infinite'
                : 'novaBreath 3s ease-in-out infinite',
            }} />
            {SUBTITLE[effectiveState] || SUBTITLE.idle}
          </div>

          {/* ── Permission hint (idle only) ────────────────────────────── */}
          {effectiveState === 'idle' && onCoreClick && (
            <p style={{
              marginTop: '0.4rem',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.68rem',
              color: 'rgba(120,110,160,0.55)',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}>
              Click the core to speak
            </p>
          )}
        </div>

        {isDesktop && (
          <div className="flex flex-col gap-[1.8rem] w-[220px] z-[5]">
            {rightNodes.map(renderNodeButton)}
          </div>
        )}

        {!isDesktop && (
          <div className="flex flex-wrap justify-center items-center gap-[0.8rem_1rem] w-full max-w-[480px] mt-4 z-[5]">
            {CORE_NODES.map((n) => renderNodeButton(n.label))}
          </div>
        )}
      </div>
    </>
  );
}
