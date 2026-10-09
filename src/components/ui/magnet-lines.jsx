'use client';

import React, { useRef, useEffect } from 'react';

/**
 * MagnetLines
 * High-performance magnetic lines field with proximity illumination and cursor glow.
 *
 * Architecture:
 * - Single requestAnimationFrame loop driven by time delta factor `1 - exp(-dt * 12)`.
 * - Window-level pointermove listener writes strictly to ref without triggering React state or DOM writes.
 * - Center coordinates are measured in batch on mount, resize, and scroll (no per-frame layout thrashing).
 * - Per-frame proximity to cursor via smoothstep (R = 280px):
 *   * Near lines: opacity ~0.9, violet tint (#A78BFA), slightly thicker (scale 1.12x).
 *   * Far lines: opacity ~0.20, dim grey-blue.
 * - Soft violet radial glow smoothly tracks behind lines using same easing.
 * - Loop automatically suspends when all lines settle (|delta| <= 0.05 deg) and restarts on pointer move.
 * - Idle / reduced-motion renders a static radial swirl aimed at container center without running the rAF loop.
 */
export function MagnetLines({
  rows = 9,
  columns = 14,
  containerSize = '100%',
  lineWidth = '5.5px',
  lineHeight = '58px',
  baseAngle = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const lineElsRef = useRef([]);
  const centersRef = useRef([]);
  const anglesRef = useRef([]);
  const containerRectRef = useRef(null);
  const pointerRef = useRef({ x: null, y: null, active: false });
  const glowPosRef = useRef({ x: 0, y: 0 });
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

    // 2. Measure centers in batch (READ phase), then initialize angles & styles (WRITE phase)
    const measureAndInit = () => {
      if (!containerRef.current) return;
      const count = rows * columns;
      const centers = [];

      // Cache container bounding rect once
      const containerRect = containerRef.current.getBoundingClientRect();
      containerRectRef.current = containerRect;

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
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;
      const targetX = pointerRef.current.active && pointerRef.current.x !== null
        ? pointerRef.current.x
        : centerX;
      const targetY = pointerRef.current.active && pointerRef.current.y !== null
        ? pointerRef.current.y
        : centerY;

      glowPosRef.current = { x: targetX, y: targetY };
      if (glowRef.current) {
        const relX = targetX - containerRect.left - 280;
        const relY = targetY - containerRect.top - 280;
        glowRef.current.style.transform = `translate3d(${relX.toFixed(1)}px, ${relY.toFixed(1)}px, 0)`;
      }

      // Batch write initial transforms & proximity colors
      const R = 280;
      for (let i = 0; i < count; i++) {
        const c = centers[i];
        const el = lineElsRef.current[i];
        if (c && el) {
          const dx = targetX - c.x;
          const dy = targetY - c.y;
          const dist = Math.hypot(dx, dy);

          // Smoothstep Hermite curve: 1 at center, 0 at R
          const x = Math.max(0, Math.min(1, 1 - dist / R));
          const p = x * x * (3 - 2 * x);

          const r = Math.round(155 + (167 - 155) * p);
          const g = Math.round(165 + (139 - 165) * p);
          const b = Math.round(195 + (250 - 195) * p);
          const a = (0.20 + (0.90 - 0.20) * p).toFixed(2);
          const scale = (1 + 0.12 * p).toFixed(2);

          const angle = (Math.atan2(dy, dx) * 180) / Math.PI + baseAngle;
          anglesRef.current[i] = angle;
          el.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${scale})`;
          el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
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
      const containerRect = containerRectRef.current;

      let targetX, targetY;
      if (pointerRef.current.active && pointerRef.current.x !== null) {
        targetX = pointerRef.current.x;
        targetY = pointerRef.current.y;
      } else {
        if (containerRect) {
          targetX = containerRect.left + containerRect.width / 2;
          targetY = containerRect.top + containerRect.height / 2;
        } else {
          targetX = window.innerWidth / 2;
          targetY = window.innerHeight / 2;
        }
      }

      // Smooth glow position following target
      glowPosRef.current.x += (targetX - glowPosRef.current.x) * factor;
      glowPosRef.current.y += (targetY - glowPosRef.current.y) * factor;
      if (glowRef.current && containerRect) {
        const relX = glowPosRef.current.x - containerRect.left - 280;
        const relY = glowPosRef.current.y - containerRect.top - 280;
        glowRef.current.style.transform = `translate3d(${relX.toFixed(1)}px, ${relY.toFixed(1)}px, 0)`;
      }

      let hasMovingLines = false;
      const R = 280;

      // Update lines
      for (let i = 0; i < count; i++) {
        const c = centers[i];
        const el = lineElsRef.current[i];
        if (!c || !el) continue;

        const dx = targetX - c.x;
        const dy = targetY - c.y;
        const dist = Math.hypot(dx, dy);

        // Smoothstep proximity
        const x = Math.max(0, Math.min(1, 1 - dist / R));
        const p = x * x * (3 - 2 * x);

        const r = Math.round(155 + (167 - 155) * p);
        const g = Math.round(165 + (139 - 165) * p);
        const b = Math.round(195 + (250 - 195) * p);
        const a = (0.20 + (0.90 - 0.20) * p).toFixed(2);
        const scale = (1 + 0.12 * p).toFixed(2);

        const target = (Math.atan2(dy, dx) * 180) / Math.PI + baseAngle;
        let current = anglesRef.current[i];
        if (typeof current !== 'number') {
          current = target;
          anglesRef.current[i] = current;
        }

        // Shortest angular path across +-180
        const delta = ((target - current + 540) % 360) - 180;

        if (Math.abs(delta) > 0.05 || pointerRef.current.active) {
          current += delta * factor;
          anglesRef.current[i] = current;
          el.style.transform = `rotate(${current.toFixed(2)}deg) scale(${scale})`;
          el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
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
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Soft violet radial glow following cursor behind lines */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at center, rgba(167, 139, 250, 0.15) 0%, rgba(139, 92, 246, 0.05) 45%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translate3d(-9999px, -9999px, 0)',
          zIndex: 0,
        }}
      />
      {spans.map((i) => (
        <div
          key={i}
          ref={(el) => {
            lineElsRef.current[i] = el;
          }}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: 'rgba(155, 165, 195, 0.20)',
            borderRadius: '9999px',
            willChange: 'transform',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default MagnetLines;
