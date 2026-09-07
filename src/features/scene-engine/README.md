# Scene Engine — Developer Guide

This folder (`src/features/scene-engine/`) is the Phase 1 Shared Scene Foundation
for the NOVA Portfolio cinematic world. It manages environment rendering,
scroll-driven progress, camera choreography, and quality tiering.

---

## z-index & Pointer-Events Contract

**This contract is mandatory. Violating it causes invisible click-eating bugs.**

| Layer                        | z-index | pointer-events |
|------------------------------|---------|----------------|
| CinematicUniverseCanvas div  | 0       | none           |
| R3F canvas element           | —       | none           |
| CSS vignette overlays        | 1       | none           |
| NOVA Core Canvas             | 5 (relative, inside Hero section) | auto |
| Hero UI overlays             | 5–20    | auto           |
| NavBar                       | 100+    | auto           |

The environment canvas is `position: fixed`, `pointer-events: none` at both the
wrapper `<div>` and the `<canvas>` element. Any 3D element that requires interactivity
must use invisible HTML overlay elements positioned above z-index 5.

---

## How to Register a Future Scene Section

Inside your section component, call `registerSection` with the section's DOM ref:

```jsx
import { useScene } from '../features/scene-engine/SceneContext';

function IdentitySection() {
  const ref = useRef();
  const { registerSection } = useScene();

  useEffect(() => {
    registerSection('identity', ref.current);
    return () => registerSection('identity', null); // cleanup on unmount
  }, [registerSection]);

  return <section ref={ref}>...</section>;
}
```

The Scene Engine will:
- Begin tracking this section's scroll progress automatically.
- Set `activeScene` to `'identity'` when it is the most-visible section.

---

## How to Read Scroll Progress

```jsx
const { sceneProgress, activeScene } = useScene();

// 0 = section top at bottom of viewport, 1 = section fully scrolled through
const arrivalProgress = sceneProgress['arrival'] ?? 0;
const isActiveScene   = activeScene === 'arrival';
```

---

## How to Add a New Environment

1. Create `src/features/scene-engine/environments/YourEnvironment.jsx`.
2. Export a default R3F component accepting `{ qualityTier, reducedMotion }`.
3. In `CinematicUniverseCanvas.jsx`, add a conditional render:

```jsx
{activeScene === 'identity' && (
  <IdentityEnvironment qualityTier={qualityTier} reducedMotion={reducedMotion} />
)}
```

4. Your environment should use `depthWrite={false}` on transparent materials,
   `THREE.AdditiveBlending` for glow particles, and never exceed:
   - Desktop: 1000 particles per environment
   - Mobile: 250 particles per environment

---

## Camera Transition Rules

The `CameraController` runs inside the shared Canvas.
- On `arrival` mount: push-in from `[0, 0.5, 5.8]` → rest `[0, 0, 4.2]` over ~1.8s.
- After entrance: **fully static**. No idle camera drift or oscillation.
- `reducedMotion: true` → camera jumps directly to rest, no animation.
- Future scene cameras: pass target position/lookAt as props to `CameraController`,
  or create per-scene `useCameraTarget` hooks that lerp to new positions.

---

## Quality Tier Behaviour

| Tier    | Particle count | DPR cap | Antialias |
|---------|---------------|---------|-----------|
| desktop | 800           | 2×      | true      |
| mobile  | 220           | 1×      | false     |

Tier is determined by:
- `window.innerWidth < 768` → mobile
- `window.devicePixelRatio < 1.5` → mobile
- Otherwise → desktop

---

## Reduced-Motion Behaviour

When `(prefers-reduced-motion: reduce)` is active:
- Camera entrance animation is skipped; camera is placed at rest immediately.
- Ring rotation speeds are set to 0.
- `frameloop="demand"` is passed to the Canvas (renders only on state change).
- Star field twinkling uniforms still advance but have no camera motion.
- All CSS transitions in Hero UI are unaffected (they have their own media query).

---

## Performance Rules

- One environment renders at a time (only the `activeScene` environment is mounted).
- The `starField` component disposes geometry on unmount automatically (R3F/Three.js GC).
- Observatory rings use `depthWrite={false}` to avoid overdraw sorting issues.
- The Canvas uses `powerPreference: 'high-performance'` to request the discrete GPU on multi-GPU systems.
- The `frameloop` is set to `'always'` on desktop (star field needs per-frame updates for twinkling).
- On mobile, `frameloop="demand"` can be used if environments become purely static.

---

## Dual Canvas Architecture

The site uses **two separate R3F canvases** intentionally:

1. **CinematicUniverseCanvas** — environment background (this system)
   - `position: fixed`, `z-index: 0`, `pointer-events: none`
   - Camera: FOV 55, position `[0, 0, 4.2]` at rest
   - Renders: ArrivalObservatory (and future environments)

2. **NOVA Core Canvas** (inside `NovaCoreV2.jsx`)
   - `position: relative` inside Hero section, `z-index: 4` (inside Core wrapper)
   - Camera: FOV 42, position `[0, 0, 3.6]`
   - Renders: NOVASceneV3 (the GLSL shader sphere)

These canvases are NOT merged. Merging would require refactoring the NOVA Core's
camera, shader uniforms, and state system — which would break existing voice/state
functionality. The separate-canvas approach is the correct tradeoff for Phase 1–2.
