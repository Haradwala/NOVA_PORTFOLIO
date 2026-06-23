import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSurfacePoints, getAdaptiveCountV2 } from '../utils/geometryV2';
import vertexShader from '../shaders/novav2.vert?raw';
import fragmentShader from '../shaders/novav2.frag?raw';

export function NOVASphereV2({ novaRef }) {
  const meshRef     = useRef();
  const materialRef = useRef();
  const timeRef     = useRef(0);

  const pointCount  = useMemo(() => getAdaptiveCountV2(), []);

  const geometry    = useMemo(() => {
    const geo  = new THREE.BufferGeometry();
    const data = generateSurfacePoints(pointCount);

    geo.setAttribute('position',  new THREE.Float32BufferAttribute(data.positions, 3));
    geo.setAttribute('aRandom',   new THREE.Float32BufferAttribute(data.randoms, 1));
    geo.setAttribute('aSpherePos',new THREE.Float32BufferAttribute(data.spherePositions, 3));
    geo.setAttribute('aLayer',    new THREE.Float32BufferAttribute(data.layers, 1));

    return geo;
  }, [pointCount]);

  const uniforms = useMemo(() => ({
    uTime:            { value: 0 },
    uStateIntensity:  { value: 0 },
    uVoiceAmplitude:  { value: 0 },
    uPointSize:       { value: 3.0 },
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (!materialRef.current) return;
    const mat  = materialRef.current;
    const nova = novaRef.current;

    // Smooth state lerp
    mat.uniforms.uStateIntensity.value +=
      (nova.targetIntensity - mat.uniforms.uStateIntensity.value) * delta * 2.5;

    // Voice amplitude: additive + natural decay
    mat.uniforms.uVoiceAmplitude.value *= 0.90;
    mat.uniforms.uVoiceAmplitude.value += nova.voiceAmplitude * 0.14;
    nova.voiceAmplitude *= 0.86;

    mat.uniforms.uTime.value = timeRef.current;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
