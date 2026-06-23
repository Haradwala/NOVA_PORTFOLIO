import { useEffect, useRef } from 'react';

export default function NovaBackground() {
  const canvasRef  = useRef(null);
  const warpRef    = useRef(0);    // current warp 0→1
  const targetRef  = useRef(0);   // desired warp
  const lastScroll = useRef(0);
  const lastTime   = useRef(Date.now());
  const decayTimer = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // ── 3D Grid Lines System ──────────────────────────────────
    const zLines = [];
    const numZLines = 20; 
    for (let i = 0; i < numZLines; i++) {
      const xRatio = (i / (numZLines - 1) - 0.5) * 14.0; 
      zLines.push({ xRatio });
    }

    const xLines = [];
    const numXLines = 8;
    for (let i = 0; i < numXLines; i++) {
      xLines.push({ z: (i / numXLines) * 8.0 });
    }

    // Floating linear data streams
    const dataStreams = Array.from({ length: 12 }, () => {
      const lineIdx = Math.floor(Math.random() * numZLines);
      return {
        xRatio: (lineIdx / (numZLines - 1) - 0.5) * 14.0,
        z: Math.random() * 8.0,
        speed: 0.02 + Math.random() * 0.04,
        len: 0.4 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.18,
      };
    });

    const onScroll = () => {
      const now    = Date.now();
      const dt     = Math.max(1, now - lastTime.current);
      const sy     = window.scrollY;
      const dy     = Math.abs(sy - lastScroll.current);
      const vel    = dy / dt; // px per ms

      lastScroll.current = sy;
      lastTime.current   = now;

      const raw = Math.min(vel / 1.8, 1);
      targetRef.current = raw;

      clearTimeout(decayTimer.current);
      decayTimer.current = setTimeout(() => {
        targetRef.current = 0;
      }, 180);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    let t = 0, rafId;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      t += 1;

      const forced = window.__warpForced || 0;
      const target = Math.max(targetRef.current, forced);
      const warp   = warpRef.current;
      warpRef.current += (target - warp) * (forced > 0 ? 0.18 : 0.09);
      const w = warpRef.current;

      const cx = W / 2, cy = H / 2;

      ctx.fillStyle = '#07070F';
      ctx.fillRect(0, 0, W, H);

      // Subtle out-of-focus background radial glows
      const radial1 = ctx.createRadialGradient(W * 0.15, H * 0.25, 0, W * 0.15, H * 0.25, Math.max(W, H) * 0.5);
      radial1.addColorStop(0, 'rgba(139, 92, 246, 0.02)'); 
      radial1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, W, H);

      const radial2 = ctx.createRadialGradient(W * 0.85, H * 0.75, 0, W * 0.85, H * 0.75, Math.max(W, H) * 0.5);
      radial2.addColorStop(0, 'rgba(45, 212, 191, 0.015)'); 
      radial2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, W, H);

      const scrollSpeed = 0.004 + w * 0.16;
      const fov = Math.min(W, H) * 0.9;

      const drawGridPlane = (planeY) => {
        ctx.lineWidth = 0.6;
        
        zLines.forEach(line => {
          const zNear = 0.18;
          const zFar = 8.0;

          const sx1 = cx + (line.xRatio / zNear) * fov;
          const sy1 = cy + (planeY / zNear) * fov;
          const sx2 = cx + (line.xRatio / zFar) * fov;
          const sy2 = cy + (planeY / zFar) * fov;

          const grad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
          grad.addColorStop(0, `rgba(167, 139, 250, ${0.045 + w * 0.05})`);
          grad.addColorStop(0.7, `rgba(167, 139, 250, 0.005)`);
          grad.addColorStop(1, `rgba(167, 139, 250, 0)`);

          ctx.strokeStyle = grad;
          ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
        });

        xLines.forEach(line => {
          line.z -= scrollSpeed;
          if (line.z < 0.18) line.z = 8.0;

          const z = line.z;
          const xSpan = 7.0;

          const sx1 = cx - (xSpan / z) * fov;
          const sy1 = cy + (planeY / z) * fov;
          const sx2 = cx + (xSpan / z) * fov;
          const sy2 = cy + (planeY / z) * fov;

          const fade = Math.max(0, 1.0 - z / 8.0);
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.02 * fade * (1.0 + w * 0.5)})`;
          ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
        });
      };

      drawGridPlane(1.8);
      drawGridPlane(-1.8);

      dataStreams.forEach(stream => {
        stream.z -= scrollSpeed * (1.2 + stream.speed * 6.0);
        if (stream.z < 0.18) {
          stream.z = 8.0;
          stream.xRatio = (Math.floor(Math.random() * numZLines) / (numZLines - 1) - 0.5) * 14.0;
        }

        const zStart = stream.z;
        const zEnd = Math.min(8.0, stream.z + stream.len * (1.0 + w * 2.8));

        const planeY = 1.8;
        const sx1 = cx + (stream.xRatio / zStart) * fov;
        const sy1 = cy + (planeY / zStart) * fov;
        const sx2 = cx + (stream.xRatio / zEnd) * fov;
        const sy2 = cy + (planeY / zEnd) * fov;

        const fade = Math.max(0, 1.0 - zStart / 8.0);
        const streamGrad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
        
        const col = stream.xRatio > 2.5 ? '232, 149, 109' : stream.xRatio < -2.5 ? '45, 212, 191' : '167, 139, 250';
        streamGrad.addColorStop(0, `rgba(${col}, ${stream.opacity * fade * (1.0 + w * 1.5)})`);
        streamGrad.addColorStop(1, `rgba(${col}, 0)`);

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 1.0 + w * 1.8;
        ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
      });

      if (w > 0.05) {
        const glowRadius = w * Math.min(W, H) * 0.5;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        glow.addColorStop(0,    `rgba(167,139,250,${w * 0.05})`);
        glow.addColorStop(0.5,  `rgba(45,212,191,${w * 0.015})`);
        glow.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      }
    };

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(decayTimer.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: -1,
        pointerEvents: 'none', display: 'block',
      }}
    />
  );
}
