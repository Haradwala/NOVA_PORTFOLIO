import { useState, useEffect, useCallback } from 'react';
import { CORE_NODES } from './constants';

export function useNeuralBeams({ parentRef, canvasRef, labelRefs, activeSubNodes, isDesktop }) {
  const [beamCoords, setBeamCoords] = useState([]);

  const updateCoords = useCallback(() => {
    if (!parentRef.current || !canvasRef.current) return;
    const parentRect = parentRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const cx = canvasRect.left - parentRect.left + canvasRect.width / 2;
    const cy = canvasRect.top - parentRect.top + canvasRect.height / 2;
    const radius = Math.min(canvasRect.width, canvasRect.height) * 0.36;

    const coords = CORE_NODES.map((node) => {
      const el = labelRefs.current[node.label];
      if (!el) return null;
      const elRect = el.getBoundingClientRect();

      const lx = elRect.left - parentRect.left + elRect.width / 2;
      const ly = elRect.top - parentRect.top + elRect.height / 2;

      const dx = lx - cx;
      const dy = ly - cy;
      const angle = Math.atan2(dy, dx);

      const ax = cx + radius * Math.cos(angle);
      const ay = cy + radius * Math.sin(angle);

      let lxConnect = lx;
      let lyConnect = ly;

      if (window.innerWidth > 1024) {
        if (lx < cx) {
          lxConnect = elRect.right - parentRect.left;
        } else {
          lxConnect = elRect.left - parentRect.left;
        }
      } else {
        lyConnect = elRect.top - parentRect.top;
      }

      return {
        label: node.label,
        route: node.route,
        lx: lxConnect,
        ly: lyConnect,
        ax,
        ay,
        angle,
      };
    }).filter(Boolean);

    setBeamCoords(coords);
  }, [parentRef, canvasRef, labelRefs]);

  useEffect(() => {
    updateCoords();
    const t = setTimeout(updateCoords, 100);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateCoords);
    };
  }, [updateCoords, activeSubNodes, isDesktop]);

  return {
    beamCoords,
    updateCoords,
  };
}
