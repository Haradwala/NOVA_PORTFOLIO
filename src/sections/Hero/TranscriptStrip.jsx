import { memo } from 'react';

export const TranscriptStrip = memo(function TranscriptStrip({ duplexState, liveText }) {
  if (duplexState === 'idle' || !liveText) return null;

  return (
    <div
      className="mt-5 max-w-[350px] min-h-[28px] px-[18px] py-[8px] bg-black/45 border border-white/5 rounded-[24px] backdrop-blur-xl text-center font-sans text-xs leading-normal z-10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-[fadeUp_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{
        color: duplexState === 'listening' ? '#F3F4F6' : 'rgba(235, 235, 245, 0.75)',
      }}
    >
      {duplexState === 'listening' && (
        <span className="text-rose font-bold mr-2 animate-pulse">🎤</span>
      )}
      "{liveText}"
    </div>
  );
});
