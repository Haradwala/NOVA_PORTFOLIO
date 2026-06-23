import { Canvas, useThree } from '@react-three/fiber';
import { NOVASphereV2 } from './NOVASphereV2';
import { useEffect } from 'react';

function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 3.8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

function Scene({ novaRef }) {
  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.08} />
      <NOVASphereV2 novaRef={novaRef} />
    </>
  );
}

export function NOVASceneV2({ novaRef }) {
  return (
    <div className="nova-canvas-container">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 3.8] }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene novaRef={novaRef} />
      </Canvas>
    </div>
  );
}
