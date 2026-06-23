import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { NOVASceneV3 } from '../../features/nova-v3/components/NOVASceneV3';
import { useNOVAV3 } from '../../features/nova-v3/hooks/useNOVAV3';
import { useNeuralBeams } from './useNeuralBeams';
import { useVoiceHalo } from './useVoiceHalo';
import { useTranscript } from './useTranscript';
import { NeuralBeams } from './NeuralBeams';
import { TranscriptStrip } from './TranscriptStrip';
import { CORE_NODES } from './constants';

export default function NovaCoreV2({
  duplexState = 'idle',
  onClickNode,
  activeSubNodes = [],
  highlightedNode = null,
}) {
  const [forcedState, setForcedState] = useState(null);
  const [forcedAmp, setForcedAmp] = useState(null);
  const [forcedText, setForcedText] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get('state');
    if (s && ['idle', 'listening', 'thinking', 'speaking', 'awareness'].includes(s)) {
      setForcedState(s);
    }
    const a = params.get('amp');
    if (a) {
      setForcedAmp(parseFloat(a));
    }
    const t = params.get('transcript');
    if (t) {
      setForcedText(t);
    }
  }, []);

  const activeDuplexState = forcedState || duplexState;
  const isForcedAwareness = forcedState === 'awareness';
  const effectiveState = isForcedAwareness ? 'listening' : activeDuplexState;

  const { stateRef, setState, setVoiceAmplitude, setAttention } = useNOVAV3();

  const parentRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRefs = useRef({});

  const [hoveredNode, setHoveredNode] = useState(null);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth > 1024);

  const leftNodes = ['About', 'Skills'];
  const rightNodes = ['Projects', 'Contact'];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { beamCoords } = useNeuralBeams({
    parentRef,
    canvasRef,
    labelRefs,
    activeSubNodes,
    isDesktop,
  });

  const { amp } = useVoiceHalo({
    duplexState: effectiveState,
    setState: (s) => {
      if (isForcedAwareness) {
        setState(1);
      } else {
        setState(s);
      }
    },
    setVoiceAmplitude: (a) => {
      if (isForcedAwareness) {
        setVoiceAmplitude(0.85);
      } else if (forcedAmp !== null) {
        setVoiceAmplitude(forcedAmp);
      } else {
        setVoiceAmplitude(a);
      }
    },
  });

  const effectiveAmp = isForcedAwareness ? 0.85 : (forcedAmp !== null ? forcedAmp : amp);

  const { liveText } = useTranscript({
    duplexState: effectiveState,
  });

  const effectiveText = forcedText || liveText;

  const renderNodeButton = (label) => {
    const isHovered = hoveredNode === label;
    const isActive = isHovered || highlightedNode === label;
    const nodeInfo = CORE_NODES.find((n) => n.label === label) || {};
    const alignLeft = isDesktop && leftNodes.includes(label);

    return (
      <button
        key={label}
        ref={(el) => (labelRefs.current[label] = el)}
        onMouseEnter={() => {
          setHoveredNode(label);
          const beam = beamCoords.find((b) => b.label === label);
          if (beam) {
            setAttention([Math.cos(beam.angle), Math.sin(beam.angle), 0.5], 0.8);
          }
        }}
        onMouseLeave={() => {
          setHoveredNode(null);
          setAttention([0, 0, 1], 0.0);
        }}
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

  const canvasW = canvasRef.current?.offsetWidth ?? 440;
  const canvasH = canvasRef.current?.offsetHeight ?? 440;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const radius = canvasW * 0.36;

  return (
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
        cx={cx}
        cy={cy}
        radius={radius}
        amp={effectiveAmp}
      />

      {isDesktop && (
        <div className="flex flex-col gap-[1.8rem] w-[220px] z-[5]">
          {leftNodes.map(renderNodeButton)}
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <div ref={canvasRef} className="w-[min(440px,58vw)] h-[min(440px,58vw)] drop-shadow-[0_0_40px_rgba(100,140,220,0.12)] z-[4]">
          <Canvas
            camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 3.6] }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          >
            <NOVASceneV3 novaRef={stateRef} />
          </Canvas>
        </div>

        <TranscriptStrip duplexState={effectiveState} liveText={effectiveText} />
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
  );
}
