import { memo } from 'react';

export const VoiceHalo = memo(function VoiceHalo({ cx, cy, radius, amp }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius + 12 + amp * 30}
        fill="none"
        stroke="rgba(232, 149, 109, 0.25)"
        strokeWidth="1.5"
        style={{
          transition: 'r 0.05s ease-out',
        }}
        className="drop-shadow-[0_0_6px_rgba(232,149,109,0.4)]"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius + 24 + amp * 55}
        fill="none"
        stroke="rgba(232, 149, 109, 0.1)"
        strokeWidth="1"
        style={{
          transition: 'r 0.05s ease-out',
        }}
        className="drop-shadow-[0_0_10px_rgba(232,149,109,0.2)]"
      />
    </g>
  );
});
