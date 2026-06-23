import { Canvas, useThree } from '@react-three/fiber';
import { NOVASphere } from './NOVASphere';
import { useEffect } from 'react';

function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 3.5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

function Scene({ novaRef }) {
  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.1} />
      <NOVASphere novaRef={novaRef} />
    </>
  );
}

export function NOVAScene({ novaRef }) {
  return (
    <div className="nova-canvas-container">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 3.5] }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene novaRef={novaRef} />
      </Canvas>
    </div>
  );
}
