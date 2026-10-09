'use client';

import React, { useRef, useEffect } from 'react';

/**
 * MagnetLines
 * High-performance magnetic lines field.
 *
 * Architecture:
 * - Single requestAnimationFrame loop driven by time delta factor `1 - exp(-dt * 12)`.
 * - Window-level pointermove listener writes strictly to ref without triggering React state or DOM writes.
 * - Center coordinates are measured in batch on mount, resize, and scroll (no per-frame layout thrashing).
 * - Loop automatically suspends when all lines settle (|delta| <= 0.05 deg) and restarts on pointer move.
 * - Idle / reduced-motion renders a static radial swirl aimed at container center without running the rAF loop.
 */
export function MagnetLines({
  rows = 9,
  columns = 14,
  containerSize = '100%',
  lineColor = 'currentColor',
  lineWidth = '5.5px',
  lineHeight = '58px',
  baseAngle = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const lineElsRef = useRef([]);
  const centersRef = useRef([]);
  const anglesRef = useRef([]);
  const pointerRef = useRef({ x: null, y: null, active: false });
  const animatingRef = useRef(false);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const isVisibleRef = useRef(true);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => i);

  useEffect(() => {
    // 1. Reduced motion check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;

    const handleMotionChange = (e) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        animatingRef.current = false;
        measureAndInit();
      } else {
        startLoop();
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // 2. Measure centers in batch (READ phase), then initialize angles (WRITE phase)
    const measureAndInit = () => {
      if (!containerRef.current) return;
      const count = rows * columns;
      const centers = [];

      // Batch read all line centers (no interleaving with writes)
      for (let i = 0; i < count; i++) {
        const el = lineElsRef.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          centers[i] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }
      centersRef.current = centers;

      // Determine initial target: pointer if active, otherwise container center
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetX = pointerRef.current.active && pointerRef.current.x !== null
        ? pointerRef.current.x
        : containerRect.left + containerRect.width / 2;
      const targetY = pointerRef.current.active && pointerRef.current.y !== null
        ? pointerRef.current.y
        : containerRect.top + containerRect.height / 2;

      // Batch write initial transforms
      for (let i = 0; i < count; i++) {
        const c = centers[i];
        const el = lineElsRef.current[i];
        if (c && el) {
          const dx = targetX - c.x;
          const dy = targetY - c.y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI + baseAngle;
          anglesRef.current[i] = angle;
          el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
        }
      }
    };

    // 3. Single rAF animation loop
    const tick = (now) => {
      if (!animatingRef.current) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      const factor = 1 - Math.exp(-dt * 12);

      const count = rows * columns;
      const centers = centersRef.current;

      let targetX, targetY;
      if (pointerRef.current.active && pointerRef.current.x !== null) {
        targetX = pointerRef.current.x;
        targetY = pointerRef.current.y;
      } else {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          targetX = containerRect.left + containerRect.width / 2;
          targetY = containerRect.top + containerRect.height / 2;
        } else {
          targetX = window.innerWidth / 2;
          targetY = window.innerHeight / 2;
        }
      }

      let hasMovingLines = false;

      // Write transforms only when delta > 0.05
      for (let i = 0; i < count; i++) {
        const c = centers[i];
        const el = lineElsRef.current[i];
        if (!c || !el) continue;

        const dx = targetX - c.x;
        const dy = targetY - c.y;
        const target = (Math.atan2(dy, dx) * 180) / Math.PI + baseAngle;
        let current = anglesRef.current[i];
        if (typeof current !== 'number') {
          current = target;
          anglesRef.current[i] = current;
        }

        // Shortest angular path across +-180
        const delta = ((target - current + 540) % 360) - 180;

        if (Math.abs(delta) > 0.05) {
          current += delta * factor;
          anglesRef.current[i] = current;
          el.style.transform = `rotate(${current.toFixed(2)}deg)`;
          hasMovingLines = true;
        }
      }

      if (hasMovingLines && isVisibleRef.current && !reducedMotionRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
        rafIdRef.current = null;
      }
    };

    const startLoop = () => {
      if (reducedMotionRef.current || !isVisibleRef.current) return;
      if (!animatingRef.current) {
        animatingRef.current = true;
        lastTimeRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    // 4. Pointer listeners (store in ref only, zero DOM/state in handler)
    const handlePointerMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.active = true;
      startLoop();
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
      startLoop();
    };

    const handleResizeOrScroll = () => {
      measureAndInit();
      startLoop();
    };

    // 5. Visibility observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true;
        isVisibleRef.current = visible;
        if (visible) {
          measureAndInit();
          startLoop();
        } else {
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          animatingRef.current = false;
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Initial measurement
    measureAndInit();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', handleResizeOrScroll, { passive: true });
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
      motionQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      animatingRef.current = false;
    };
  }, [rows, columns, baseAngle]);

  return (
    <div
      ref={containerRef}
      className={`relative grid place-items-center select-none pointer-events-none ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style,
      }}
      aria-hidden="true"
    >
      {spans.map((i) => (
        <div
          key={i}
          ref={(el) => {
            lineElsRef.current[i] = el;
          }}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
            borderRadius: '9999px',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default MagnetLines;
