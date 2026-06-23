import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top  = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const loop = () => {
      pos.current.rx += (pos.current.mx - pos.current.rx) * 0.1;
      pos.current.ry += (pos.current.my - pos.current.ry) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = pos.current.rx + 'px';
        ringRef.current.style.top  = pos.current.ry + 'px';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onEnter = () => {
      if (!dotRef.current) return;
      dotRef.current.style.width  = '16px';
      dotRef.current.style.height = '16px';
      dotRef.current.style.background = 'var(--violet2)';
    };
    const onLeave = () => {
      if (!dotRef.current) return;
      dotRef.current.style.width  = '7px';
      dotRef.current.style.height = '7px';
      dotRef.current.style.background = 'var(--rose)';
    };

    const addHover = () => {
      document.querySelectorAll('a, button, [data-hoverable]').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    addHover();
    const mo = new MutationObserver(addHover);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--rose)', transform: 'translate(-50%,-50%)',
        transition: 'width .2s, height .2s, background .2s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        width: 28, height: 28, borderRadius: '50%',
        border: '1px solid rgba(139,92,246,.5)',
        transform: 'translate(-50%,-50%)',
      }} />
    </>
  );
}
