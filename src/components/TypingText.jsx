import { useState, useEffect } from 'react';

export default function TypingText({ text, speed = 16, onDone }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return (
    <span>
      {shown}
      {shown.length < text.length && (
        <span style={{ color: 'var(--violet2)', fontWeight: 400 }}>▋</span>
      )}
    </span>
  );
}
