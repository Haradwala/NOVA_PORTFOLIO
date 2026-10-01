'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * MagnetLines
 * Official Componentry Magnet Lines component.
 * Reference: @componentry/magnet-lines
 *
 * A grid of lines that rotate to face the cursor, creating a magnetic field effect.
 */
export function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Only listen when container is in viewport to ensure 60fps performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? true);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();
    };
  }, []);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => i);

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
        <Line
          key={i}
          containerRef={containerRef}
          lineColor={lineColor}
          lineWidth={lineWidth}
          lineHeight={lineHeight}
          baseAngle={baseAngle}
          active={isVisible && !reducedMotion}
        />
      ))}
    </div>
  );
}

function Line({
  containerRef,
  lineColor,
  lineWidth,
  lineHeight,
  baseAngle,
  active,
}) {
  const lineRef = useRef(null);
  const [rotate, setRotate] = useState(baseAngle);

  useEffect(() => {
    if (!active) {
      setRotate(baseAngle);
      return;
    }

    let rafId = null;
    let pendingEvent = null;

    const handleMouseMove = (e) => {
      pendingEvent = e;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (!lineRef.current || !containerRef.current || !pendingEvent) {
            rafId = null;
            return;
          }

          const rect = lineRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const distanceX = pendingEvent.clientX - centerX;
          const distanceY = pendingEvent.clientY - centerY;

          const angle = (Math.atan2(distanceY, distanceX) * 180) / Math.PI;
          setRotate(angle + baseAngle);
          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [baseAngle, containerRef, active]);

  return (
    <motion.div
      ref={lineRef}
      animate={{ rotate }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      style={{
        width: lineWidth,
        height: lineHeight,
        backgroundColor: lineColor,
        borderRadius: '9999px',
        willChange: 'transform',
      }}
    />
  );
}

export default MagnetLines;
