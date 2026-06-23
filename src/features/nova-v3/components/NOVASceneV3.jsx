import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { NOVASphereV3 } from './NOVASphereV3';

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 3.6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export function NOVASceneV3({ novaRef }) {
  return (
    <>
      <CameraSetup />
      <NOVASphereV3 novaRef={novaRef} />
    </>
  );
}
