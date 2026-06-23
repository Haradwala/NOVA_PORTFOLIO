import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSpherePoints, getAdaptiveCount } from '../utils/geometry';
import vertexShader from '../shaders/nova.vert?raw';
import fragmentShader from '../shaders/nova.frag?raw';

export function NOVASphere({ novaRef }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const timeRef = useRef(0);

  const pointCount = useMemo(() => getAdaptiveCount(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const data = generateSpherePoints(pointCount);

    geo.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(data.randoms, 1));
    geo.setAttribute('aSpherePos', new THREE.Float32BufferAttribute(data.spherePositions, 3));
    geo.setAttribute('aLayer', new THREE.Float32BufferAttribute(data.layers, 1));

    return geo;
  }, [pointCount]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uStateIntensity: { value: 0 },
    uVoiceAmplitude: { value: 0 },
    uPointSize: { value: 2.5 },
    uAttentionRegion: { value: new THREE.Vector3(0, 0, 1) },
    uAttentionStrength: { value: 0 },
  }), []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (materialRef.current) {
      const mat = materialRef.current;
      const nova = novaRef.current;

      const target = nova.targetIntensity;
      mat.uniforms.uStateIntensity.value += (target - mat.uniforms.uStateIntensity.value) * delta * 3;

      mat.uniforms.uVoiceAmplitude.value *= 0.92;
      mat.uniforms.uVoiceAmplitude.value += nova.voiceAmplitude * 0.1;
      nova.voiceAmplitude *= 0.9;

      mat.uniforms.uAttentionStrength.value += (nova.attentionStrength - mat.uniforms.uAttentionStrength.value) * delta * 2;
      nova.attentionStrength *= 0.98;

      mat.uniforms.uTime.value = t;
      mat.uniforms.uAttentionRegion.value.set(
        nova.attentionRegion[0],
        nova.attentionRegion[1],
        nova.attentionRegion[2]
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
      meshRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;
    }
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
