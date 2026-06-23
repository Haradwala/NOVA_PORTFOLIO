import { useState, useEffect, useRef, memo } from 'react';
import { PreviewCard } from './PreviewCard';

export const ConversationBubble = memo(function ConversationBubble({
  text,
  isSpeaking,
  isThinking,
  previewCard,
  onOpenPreview
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [visible, setVisible] = useState(false);
  const fadeTimeout = useRef(null);

  useEffect(() => {
    if (isThinking) {
      setVisible(true);
      setDisplayedText('NOVA is processing...');
      clearTimeout(fadeTimeout.current);
    } else if (isSpeaking && text) {
      setVisible(true);
      clearTimeout(fadeTimeout.current);
      
      // Snappy progressive typing reveal
      let i = 0;
      setDisplayedText('');
      const rawText = text;
      const interval = setInterval(() => {
        setDisplayedText(prev => rawText.substring(0, i + 1));
        i++;
        if (i >= rawText.length) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      // Idle state: linger for 2.5 seconds, then fade out
      // However, if a preview card is visible, we DO NOT fade out immediately
      if (previewCard) {
        setVisible(true);
        clearTimeout(fadeTimeout.current);
      } else {
        fadeTimeout.current = setTimeout(() => {
          setVisible(false);
        }, 2500);
      }
    }
    return () => clearTimeout(fadeTimeout.current);
  }, [text, isSpeaking, isThinking, previewCard]);

  if (!visible) return null;

  const isActive = isSpeaking || isThinking || !!previewCard;

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 'calc(min(500px, 62vw) + 12px)', // position above the expanded core
        left: '50%',
        transform: isActive ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.96)',
        opacity: isActive ? 1 : 0,
        width: 'min(420px, 85vw)',
        background: 'rgba(10, 10, 18, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '14px',
        padding: '0.9rem 1.2rem',
        color: 'rgba(235, 235, 245, 0.95)',
        fontSize: '0.8rem',
        lineHeight: '1.45',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(167, 139, 250, 0.03)',
        zIndex: 20,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        textAlign: 'left',
      }}
    >
      {/* Title Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.58rem',
        color: isThinking ? '#2DD4BF' : '#A78BFA',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: '6px',
        fontWeight: '600'
      }}>
        <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: isThinking ? '#2DD4BF' : '#A78BFA',
          boxShadow: `0 0 6px ${isThinking ? '#2DD4BF' : '#A78BFA'}`,
          animation: 'pulse 1.5s infinite'
        }} />
        NOVA Engine v2.0
      </div>

      {/* Spoken / Typed Body text */}
      <div style={{
        fontWeight: 300,
        letterSpacing: '0.01em',
        wordBreak: 'break-word',
      }}>
        {isThinking ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            NOVA is processing
            <span className="pulse-dots">...</span>
          </span>
        ) : (
          displayedText
        )}
      </div>

      {/* Embedded Project / Skills Preview Card */}
      {previewCard && (
        <PreviewCard preview={previewCard} onOpen={onOpenPreview} />
      )}
    </div>
  );
});
