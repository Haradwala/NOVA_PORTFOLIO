import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSurfacePoints, getAdaptiveCountV2 } from '../../nova-v2/utils/geometryV2';

import vertRaw from '../shaders/novav3.vert?raw';
import fragRaw from '../shaders/novav3.frag?raw';
import noiseRaw from '../shaders/noise.glsl?raw';
import attentionRaw from '../shaders/attention.glsl?raw';
import listeningRaw from '../shaders/listening.glsl?raw';
import thinkingRaw from '../shaders/thinking.glsl?raw';
import speakingRaw from '../shaders/speaking.glsl?raw';

export function NOVASphereV3({ novaRef }) {
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

  const vertexShader = useMemo(() => {
    return vertRaw
      .replace('#include <noise>', noiseRaw)
      .replace('#include <attention>', attentionRaw)
      .replace('#include <listening>', listeningRaw)
      .replace('#include <thinking>', thinkingRaw)
      .replace('#include <speaking>', speakingRaw);
  }, []);

  const uniforms = useMemo(() => ({
    uTime:             { value: 0 },
    uStateIntensity:   { value: 0 },
    uVoiceAmplitude:   { value: 0 },
    uAttentionRegion:  { value: new THREE.Vector3(0, 0, 1) },
    uAttentionStrength:{ value: 0.0 },
    uPointSize:        { value: 3.2 },
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (!materialRef.current) return;
    const mat  = materialRef.current;
    const nova = novaRef.current;

    mat.uniforms.uStateIntensity.value +=
      (nova.currentState - mat.uniforms.uStateIntensity.value) * delta * 2.5;

    mat.uniforms.uVoiceAmplitude.value *= 0.90;
    mat.uniforms.uVoiceAmplitude.value += nova.voiceAmplitude * 0.14;
    nova.voiceAmplitude *= 0.86;

    if (nova.attentionRegion) {
      mat.uniforms.uAttentionRegion.value.lerp(
        new THREE.Vector3(
          nova.attentionRegion[0],
          nova.attentionRegion[1],
          nova.attentionRegion[2]
        ),
        delta * 6.0
      );
    }
    
    mat.uniforms.uAttentionStrength.value +=
      (nova.attentionStrength - mat.uniforms.uAttentionStrength.value) * delta * 4.0;

    mat.uniforms.uTime.value = timeRef.current;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragRaw}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
