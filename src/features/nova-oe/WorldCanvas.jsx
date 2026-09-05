/**
 * WorldCanvas.jsx
 *
 * Configures the React Three Fiber Canvas with the exact camera near/far plane
 * matching WorldConfig.js to guarantee scene elements are not clipped.
 */

import { Canvas } from '@react-three/fiber';
import WorldScene from './WorldScene';

export default function WorldCanvas() {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.1, far: 600 }}
      gl={{ antialias: true, alpha: false }}
      shadows={false}
      style={{
        position: 'absolute',
        inset:    0,
        width:    '100%',
        height:   '100%',
      }}
    >
      <WorldScene />
    </Canvas>
  );
}
