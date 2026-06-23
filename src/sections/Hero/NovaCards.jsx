import { memo } from 'react';
import { HUD_LEFT_ITEMS, HUD_RIGHT_ITEMS } from './constants';

export const NovaCards = memo(function NovaCards({ mouseOffset }) {
  const tx = mouseOffset.x * -22;
  const ty = mouseOffset.y * -22;

  const cardStyle = {
    position: 'absolute',
    top: '50%',
    width: '270px',
    background: 'rgba(10, 10, 18, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '14px',
    padding: '1.25rem',
    zIndex: 4,
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'left',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease-out, border 0.3s, background 0.3s, box-shadow 0.3s',
  };

  return (
    <>
      {/* Left Capabilities Card */}
      <div 
        style={{
          ...cardStyle,
          left: '5%',
          transform: `translateY(-50%) translate(${tx}px, ${ty}px)`,
        }}
        className="hud-card"
      >
        <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(167, 139, 250, 0.8)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
          Capabilities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 400, letterSpacing: '0.01em' }}>
            {HUD_LEFT_ITEMS[0]}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 400, letterSpacing: '0.01em' }}>
            {HUD_LEFT_ITEMS[1]}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 400, letterSpacing: '0.01em' }}>
            {HUD_LEFT_ITEMS[2]}
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'rgba(235, 235, 245, 0.55)', fontFamily: "'JetBrains Mono', monospace" }}>
            {HUD_LEFT_ITEMS[3]}
          </div>
        </div>
      </div>

      {/* Right Product Details Card */}
      <div 
        style={{
          ...cardStyle,
          right: '5%',
          transform: `translateY(-50%) translate(${tx}px, ${ty}px)`,
        }}
        className="hud-card"
      >
        <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(45, 212, 191, 0.8)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
          Architecture
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 'bold', letterSpacing: '0.02em' }}>
            {HUD_RIGHT_ITEMS[0]}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(235, 235, 245, 0.55)', lineHeight: '1.4' }}>
            {HUD_RIGHT_ITEMS[1]}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text)', fontWeight: 400 }}>
            {HUD_RIGHT_ITEMS[2]}
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'rgba(235, 235, 245, 0.55)', fontFamily: "'JetBrains Mono', monospace" }}>
            {HUD_RIGHT_ITEMS[3]}
          </div>
        </div>
      </div>
    </>
  );
});
