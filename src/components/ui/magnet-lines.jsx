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
  baseAngle = 0,
  active,
}) {
  const lineRef = useRef(null);
  const centerRef = useRef(null);
  const [rotate, setRotate] = useState(baseAngle);

  // Cache line center on mount, resize, and scroll to avoid layout thrashing
  useEffect(() => {
    const updateCenter = () => {
      if (lineRef.current) {
        const rect = lineRef.current.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    updateCenter();
    window.addEventListener('resize', updateCenter, { passive: true });
    window.addEventListener('scroll', updateCenter, { passive: true });

    return () => {
      window.removeEventListener('resize', updateCenter);
      window.removeEventListener('scroll', updateCenter);
    };
  }, []);

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
          if (!centerRef.current || !pendingEvent) {
            rafId = null;
            return;
          }

          const distanceX = pendingEvent.clientX - centerRef.current.x;
          const distanceY = pendingEvent.clientY - centerRef.current.y;
          const distance = Math.hypot(distanceX, distanceY);

          // Localized magnetic field radius (~320px)
          const maxDistance = 320;

          if (distance > maxDistance) {
            setRotate(baseAngle);
          } else {
            // Smooth magnetic influence falloff
            const influence = Math.pow(1 - distance / maxDistance, 1.6);

            // Compute angle toward cursor
            const targetAngle = (Math.atan2(distanceY, distanceX) * 180) / Math.PI;

            // Restrain deflection to organic subtle angle (max +/-18 degrees from baseAngle)
            let diff = ((targetAngle - baseAngle + 180) % 360) - 180;
            const maxRotation = 18;
            const clampedDiff = Math.max(-maxRotation, Math.min(maxRotation, diff));

            setRotate(baseAngle + clampedDiff * influence);
          }

          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [baseAngle, active]);

  return (
    <motion.div
      ref={lineRef}
      animate={{ rotate }}
      transition={{ type: 'spring', damping: 28, stiffness: 190 }}
      style={{
        width: lineWidth,
        height: lineHeight,
        backgroundColor: lineColor,
        borderRadius: '9999px',
        willChange: 'transform',
        touchAction: 'pan-y',
      }}
    />
  );
}

export default MagnetLines;
