import { memo } from 'react';
import { AttentionCluster } from './AttentionCluster';

export const NeuralBeams = memo(function NeuralBeams({
  beamCoords,
  isDesktop,
  hoveredNode,
  highlightedNode,
  duplexState,
  canvasRef,
  cx,
  cy,
  radius,
  amp,
}) {
  if (!beamCoords || beamCoords.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[2]">
      <defs>
        <linearGradient id="beamGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {beamCoords.map((beam) => {
        const isHovered = hoveredNode === beam.label;
        const isHighlighted = highlightedNode === beam.label;
        const isActive = isHovered || isHighlighted;

        const pathD = isDesktop
          ? `M ${beam.lx} ${beam.ly} C ${(beam.lx + beam.ax) / 2} ${beam.ly} ${(beam.lx + beam.ax) / 2} ${beam.ay} ${beam.ax} ${beam.ay}`
          : `M ${beam.lx} ${beam.ly} C ${beam.lx} ${(beam.ly + beam.ay) / 2} ${beam.ax} ${(beam.ly + beam.ay) / 2} ${beam.ax} ${beam.ay}`;

        return (
          <g key={beam.label}>
            <path
              d={pathD}
              fill="none"
              stroke={isActive ? 'rgba(45, 212, 191, 0.22)' : 'rgba(255, 255, 255, 0.04)'}
              strokeWidth={isActive ? 1.5 : 0.8}
              className="transition-all duration-300"
            />

            {isActive && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#beamGlow)"
                strokeWidth={1.6}
                strokeDasharray="6 12"
                className="animate-neural-flow shadow-[0_0_8px_#2DD4BF]"
              />
            )}

            {isHovered && <AttentionCluster ax={beam.ax} ay={beam.ay} />}
          </g>
        );
      })}

      {duplexState === 'listening' && canvasRef.current && (
        <g>
          <circle
            cx={canvasRef.current.offsetLeft + cx}
            cy={canvasRef.current.offsetTop + cy}
            r={radius + 12 + amp * 30}
            fill="none"
            stroke="rgba(232, 149, 109, 0.25)"
            strokeWidth="1.5"
            style={{ transition: 'r 0.05s ease-out' }}
            className="drop-shadow-[0_0_6px_rgba(232,149,109,0.4)]"
          />
          <circle
            cx={canvasRef.current.offsetLeft + cx}
            cy={canvasRef.current.offsetTop + cy}
            r={radius + 24 + amp * 55}
            fill="none"
            stroke="rgba(232, 149, 109, 0.1)"
            strokeWidth="1"
            style={{ transition: 'r 0.05s ease-out' }}
            className="drop-shadow-[0_0_10px_rgba(232,149,109,0.2)]"
          />
        </g>
      )}
    </svg>
  );
});
