/**
 * Spiral3DSlider
 *
 * Official Componentry Spiral 3D Slider adapted for Portfolio Project Navigation.
 * Reference: https://componentry.dev/docs/components/spiral-3d-slider
 *
 * Characteristics:
 *   - Black background
 *   - Floating image planes with subtle shader bend and depth-of-field blur falloff
 *   - Perspective camera (fov ~44)
 *   - Smooth scroll, drag, and keyboard interaction
 *   - Image-first presentation
 *   - Direct click-to-navigate on project slides
 */

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { WebGLErrorBoundary, WebGLFallback } from './webgl-error-boundary';
import { cn } from '../../lib/utils';

export const vertexShader = `
  uniform float uBend;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float curve = 1.0 - cos(position.x * 3.14159265);
    transformed.z -= curve * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBlur;
  uniform float uActiveFactor;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec2 stepSize = vec2(0.0065) * uBlur;
    vec4 color = texture2D(uTexture, uv) * 0.23;

    color += texture2D(uTexture, uv + vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv - vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv + vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv + stepSize) * 0.025;
    color += texture2D(uTexture, uv - stepSize) * 0.025;

    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luminance), color.rgb, 1.15);
    color.rgb = (color.rgb - 0.5) * 1.06 + 0.5;
    float brightness = 1.04 - min(uBlur * 0.025, 0.07);
    vec3 finalRgb = clamp(color.rgb * brightness, 0.0, 1.0);

    // ── Neutral card surface: rgba(28, 29, 38, 0.92) ──
    vec3 neutralSurface = vec3(0.1098, 0.1137, 0.1490); // rgb(28, 29, 38)
    finalRgb = max(mix(neutralSurface, finalRgb, 0.94), neutralSurface * 0.90);

    // Subtle soft light reflection across the card surface
    float lightReflection = (1.0 - vUv.y) * 0.045 + (1.0 - vUv.x) * 0.025;
    finalRgb += vec3(lightReflection);

    // Active card brightness & clarity boost (Hero card dominance)
    finalRgb *= (1.0 + uActiveFactor * 0.14);

    // ── Card border calculation with aspect ratio compensation ──
    float distY = min(vUv.y, 1.0 - vUv.y);
    float distX = min(vUv.x, 1.0 - vUv.x) * uPlaneAspect;
    float edgeDist = min(distX, distY);
    float borderMask = 1.0 - smoothstep(0.007, 0.013, edgeDist);

    // Base border: rgba(255, 255, 255, 0.16)
    vec3 baseBorder = vec3(1.0);
    float baseAlpha = 0.16;

    // Active border: subtle lavender → blue highlight (#A78BFA -> #38BDF8)
    vec3 lavender = vec3(0.655, 0.545, 0.980);
    vec3 skyBlue  = vec3(0.220, 0.741, 0.973);
    vec3 activeBorder = mix(lavender, skyBlue, vUv.x);
    float activeAlpha = 0.55;

    vec3 borderColor = mix(baseBorder, activeBorder, uActiveFactor);
    float borderAlpha = mix(baseAlpha, activeAlpha, uActiveFactor);

    finalRgb = mix(finalRgb, borderColor, borderMask * borderAlpha);

    gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), 1.0);
  }
`;

function wrappedPosition(value, length) {
  const wrapped = ((value % length) + length) % length;
  return wrapped > length / 2 ? wrapped - length : wrapped;
}

function imageAspect(texture) {
  const image = texture?.image;
  const width = image?.naturalWidth || image?.width || 1;
  const height = image?.naturalHeight || image?.height || 1;
  return width / Math.max(height, 1);
}

function SpiralScene({
  items,
  targetProgress,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  smoothing,
  blurStrength,
  bend,
  reducedMotion,
  lastInteraction,
  onSelectSlide,
  onActiveSlideChange,
}) {
  const sceneItems = useMemo(
    () =>
      Array.from(
        { length: Math.max(items.length, 16) },
        (_, index) => items[index % items.length]
      ),
    [items]
  );

  const textures = useLoader(
    TextureLoader,
    sceneItems.map((item) => item.src)
  );

  const { gl, viewport } = useThree();
  const progress = useRef(0);
  const meshes = useRef([]);
  const materials = useRef([]);
  const lastActiveIndex = useRef(-1);

  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: { value: imageAspect(texture) },
        uPlaneAspect: { value: cardAspectRatio },
        uBlur: { value: 0 },
        uBend: { value: 0 },
        uActiveFactor: { value: 0 },
      })),
    [cardAspectRatio, textures]
  );

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    });
  }, [gl, textures]);

  useFrame((_state, delta) => {
    if (
      autoRotate &&
      !reducedMotion.current &&
      performance.now() - lastInteraction.current > 450
    ) {
      targetProgress.current += autoSpeed * Math.min(delta, 0.05);
    }

    const frameScale = Math.min(delta * 60, 3);
    const ease = reducedMotion.current
      ? 1
      : 1 - Math.pow(1 - smoothing, frameScale);
    progress.current += (targetProgress.current - progress.current) * ease;

    const factor = Math.max(viewport.factor || 1, 1);
    const isSmall = viewport.width < 7;
    const planeWidth = Math.min(
      cardWidth / factor,
      viewport.width * (isSmall ? 0.75 : 0.36)
    );
    const planeHeight = planeWidth / cardAspectRatio;
    const spiralRadius = Math.min(
      radius / factor,
      viewport.width * (isSmall ? 0.44 : 0.35)
    );
    const gap = Math.min(
      verticalGap / factor,
      viewport.height * (isSmall ? 0.12 : 0.095)
    );
    const count = sceneItems.length;

    let minAbsPos = Infinity;
    let closestIdx = 0;

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;

      const position = wrappedPosition(index - progress.current, count);
      const absPos = Math.abs(position);
      if (absPos < minAbsPos) {
        minAbsPos = absPos;
        closestIdx = index;
      }

      const angle = position * 0.78;
      const depth = (Math.cos(angle) + 1) / 2;
      const distance = Math.min(Math.abs(position) / (count * 0.43), 1);

      // Active card dominance: active card scale ~1.10 (between 1.08 and 1.12)
      // Side cards smoothly taper down to ~0.94, back cards to ~0.72
      const activeFactor = Math.max(0, 1 - absPos * 1.25);
      const baseScale = 0.72 + depth * 0.26;
      const scale = baseScale + activeFactor * 0.12;

      mesh.position.set(
        Math.sin(angle) * spiralRadius,
        -position * gap,
        Math.cos(angle) * 2.55
      );
      mesh.rotation.set(0, Math.sin(angle) * -1.12, 0);
      mesh.scale.set(planeWidth * scale, planeHeight * scale, 1);

      material.uniforms.uBlur.value = Math.pow(distance, 1.28) * blurStrength;
      material.uniforms.uBend.value = planeWidth * bend;
      material.uniforms.uPlaneAspect.value = cardAspectRatio;
      material.uniforms.uActiveFactor.value = activeFactor;
    });

    if (closestIdx !== lastActiveIndex.current) {
      lastActiveIndex.current = closestIdx;
      if (onActiveSlideChange) {
        onActiveSlideChange(sceneItems[closestIdx], closestIdx % items.length);
      }
    }
  });

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          frustumCulled={false}
          onClick={(e) => {
            e.stopPropagation();
            onSelectSlide?.(item);
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[1, 1, 48, 2]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  );
}

export function Spiral3DSlider({
  items,
  className,
  radius = 340,
  verticalGap = 92,
  cardWidth = 380,
  cardAspectRatio = 1.5,
  autoRotate = true,
  autoSpeed = 0.13,
  scrollSensitivity = 0.0024,
  smoothing = 0.065,
  blurStrength = 1.65,
  bend = 0.17,
  fov = 44,
  ariaLabel = 'Spiral image gallery',
  onSelectSlide,
  onActiveSlideChange,
}) {
  const stageRef = useRef(null);
  const targetProgress = useRef(0);
  const previousScroll = useRef(0);
  const lastWheelTime = useRef(0);
  const lastInteraction = useRef(0);
  const visible = useRef(false);
  const reducedMotion = useRef(false);

  // Drag tracking
  const isDragging = useRef(false);
  const startDragX = useRef(0);
  const lastDragX = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    previousScroll.current = window.scrollY;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener('change', syncMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(stage);

    const handlePageScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - previousScroll.current;
      previousScroll.current = scrollY;
      if (visible.current && performance.now() - lastWheelTime.current > 80) {
        lastInteraction.current = performance.now();
        const boundedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 160);
        targetProgress.current += boundedDelta * scrollSensitivity;
      }
    };
    window.addEventListener('scroll', handlePageScroll, { passive: true });

    // Keyboard navigation (Arrow keys)
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        lastInteraction.current = performance.now();
        targetProgress.current += 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        lastInteraction.current = performance.now();
        targetProgress.current -= 1;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', syncMotionPreference);
      window.removeEventListener('scroll', handlePageScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollSensitivity]);

  const handleWheel = (event) => {
    lastWheelTime.current = performance.now();
    lastInteraction.current = lastWheelTime.current;
    const delta =
      Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 160);
    targetProgress.current += delta * scrollSensitivity;
  };

  // Pointer drag for mouse and touch swipe
  const handlePointerDown = (e) => {
    isDragging.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startDragX.current = clientX;
    lastDragX.current = clientX;
    lastInteraction.current = performance.now();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - lastDragX.current;
    lastDragX.current = clientX;
    lastInteraction.current = performance.now();
    targetProgress.current -= (deltaX / 300);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!items.length) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'relative min-h-[38rem] sm:min-h-[42rem] w-full overflow-hidden bg-transparent transition-colors duration-300 select-none',
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <WebGLErrorBoundary
        fallback={<WebGLFallback className="absolute inset-0 h-full w-full" />}
      >
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10], fov, near: 0.1, far: 100 }}
            style={{ background: 'transparent' }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={null}>
              <SpiralScene
                items={items}
                targetProgress={targetProgress}
                radius={radius}
                verticalGap={verticalGap}
                cardWidth={cardWidth}
                cardAspectRatio={cardAspectRatio}
                autoRotate={autoRotate}
                autoSpeed={autoSpeed}
                smoothing={smoothing}
                blurStrength={blurStrength}
                bend={bend}
                reducedMotion={reducedMotion}
                lastInteraction={lastInteraction}
                onSelectSlide={onSelectSlide}
                onActiveSlideChange={onActiveSlideChange}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>

      <div className="sr-only">
        <p>{ariaLabel}</p>
        <ul>
          {items.map((item, index) => (
            <li key={`${item.src}-description-${index}`}>{item.alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Spiral3DSlider;
