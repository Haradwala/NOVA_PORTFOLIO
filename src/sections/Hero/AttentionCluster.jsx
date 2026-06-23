import { memo } from 'react';

export const AttentionCluster = memo(function AttentionCluster({ ax, ay }) {
  return (
    <g transform={`translate(${ax}, ${ay})`}>
      <circle r="3.5" fill="#2DD4BF" className="shadow-[0_0_8px_#2DD4BF]" />
      <circle className="animate-pulse-ring-1" r="7" fill="none" stroke="#2DD4BF" strokeWidth="1" />
      <circle className="animate-pulse-ring-2" r="12" fill="none" stroke="#2DD4BF" strokeWidth="0.5" />
    </g>
  );
});
