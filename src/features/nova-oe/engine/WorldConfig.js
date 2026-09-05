/**
 * WorldConfig.js
 * Global constants for the NOVA Operating Environment.
 *
 * Creative direction: Interstellar · Dune · Blade Runner 2049 · Tron · Apple
 * Every value serves the rule: darkness is content, light has one source.
 */

// ─── Cinematic Palette ────────────────────────────────────────────────────────
/** Use these instead of ad-hoc hex strings inside environments. */
export const CP = {
  void:      '#000005',   // near-perfect black — negative space IS the content
  coldWhite: '#c0d4f0',   // the single beam: cold, intelligent, from above
  amber:     '#b87333',   // purpose, journey, warmth (Dune / Interstellar)
  deepAmber: '#6b3f10',   // material warmth, subdued
  iceBlue:   '#1e4a8a',   // cold intelligence, space light
  ghost:     '#080e1c',   // barely-visible surfaces — felt more than seen
  silver:    '#7080a0',   // metallic edges, structural lines
  gold:      '#c09040',   // knowledge, accumulated wisdom
};

// ─── World Geometry ──────────────────────────────────────────────────────────
/** Total scrollable height as a multiplier of viewport height */
export const WORLD_SCROLL_MULTIPLIER = 7;

/** World depth along negative Z axis (Three.js units) */
export const WORLD_DEPTH = 280;

/** Y spread — camera rises and dips across the journey */
export const WORLD_Y_SPREAD = 12;

// ─── Camera ──────────────────────────────────────────────────────────────────
export const CAMERA_CONFIG = {
  fov:  55,   // slightly narrower than 60 — more cinematic, less game-like

  near: 0.1,
  far:  600,

  /** Lower = more inertia — the camera should feel weighted */
  damping: 0.042,

  /** Breathing gives the world a pulse */
  breathAmplitude:  0.10,
  breathFrequency:  0.22,

  /** Camera rolls subtly on corners — like a Steadicam */
  bankStrength: 0.14,
  bankDamping:  0.05,

  /** Lookahead keeps the horizon steady */
  lookAheadOffset: 0.025,
};

// ─── Spline Control Points ────────────────────────────────────────────────────
/**
 * Camera path through all 7 scenes.
 * Positioned so the camera travels through, not past, each environment.
 * [x, y, z]
 */
export const CAMERA_SPLINE_POINTS = [
  [  0.0,   1.6,    6.0],   // 0 — Pre-arrival (outside the Gate, close enough to see walls)
  [  0.0,   1.6,   -2.0],   // 1 — Scene 1: The Gate (ArrivalZone)
  [ -4.0,   1.6,  -38.0],   // 2 — Scene 2: The Corridor (IdentityHall)
  [  0.0,   1.6,  -78.0],   // 3 — Scene 3: The Monolith (CapabilityReactor)
  [ -2.0,   2.0, -118.0],   // 4 — Scene 4: The Vault (ProjectVault)
  [  0.0,   1.6, -158.0],   // 5 — Scene 5: The Canyon (TimelineCorridor)
  [  0.0,   1.6, -198.0],   // 6 — Scene 6: The Chamber (KnowledgeArchive)
  [  0.0,   1.6, -240.0],   // 7 — Scene 7: The Threshold (CommunicationBridge)
  [  0.0,   1.6, -268.0],   // 8 — Exit beat
];

// ─── Atmosphere ───────────────────────────────────────────────────────────────
export const ATMOSPHERE_CONFIG = {
  /**
   * Dense fog is story: it limits how much the visitor can see at once.
   * The world is revealed incrementally — you cannot skip ahead.
   */
  fogColor:   '#020208',
  fogDensity: 0.009,    // exp2 — reduced from 0.013 so the Gate walls are visible at entry

  /** Minimal ambient — scenes provide their own single light sources */
  ambientIntensity: 0.035,

  /** Sparse starfield — silence between environments */
  starCount: 2200,

  /** Almost no dust — only gate dust is narrative-justified */
  dustCount: 180,
  dustDriftSpeed: 0.018,
};

// ─── Lighting ────────────────────────────────────────────────────────────────
export const LIGHTING_CONFIG = {
  /**
   * Landmark lights — each tied to one scene.
   * Low intensity: the scene's own spotlights provide drama.
   * These fill the surrounding void softly.
   */
  landmarkLights: [
    { color: '#2040a0', intensity: 1.2, distance: 30, position: [  0, 4,    0] }, // Gate
    { color: '#b87333', intensity: 0.8, distance: 25, position: [ -4, 2,  -38] }, // Corridor
    { color: '#102050', intensity: 1.0, distance: 28, position: [  0, 4,  -78] }, // Monolith
    { color: '#7a4510', intensity: 1.4, distance: 22, position: [ -2, 3, -118] }, // Vault
    { color: '#6b3f10', intensity: 0.9, distance: 30, position: [  0, 2, -158] }, // Canyon
    { color: '#c09040', intensity: 1.1, distance: 26, position: [  0, 4, -198] }, // Chamber
    { color: '#b87333', intensity: 1.6, distance: 24, position: [  0, 3, -240] }, // Threshold
  ],
};

// ─── Post-Processing ─────────────────────────────────────────────────────────
export const POST_CONFIG = {
  bloom: {
    intensity:           0.45,    // subtle — real light doesn't bloom this much
    luminanceThreshold:  0.78,
    luminanceSmoothing:  0.04,
    radius:              0.35,
  },
  chromaticAberration: { offset: [0.0003, 0.0003] },
  vignette: {
    eskil:    false,
    offset:   0.22,
    darkness: 0.65,   // stronger vignette = more cinematic
  },
};

// ─── HUD ─────────────────────────────────────────────────────────────────────
export const HUD_CONFIG = {
  sceneLabels: [
    { id: 'arrival',    label: 'The Gate',      sub: 'NOVA Awakens',       progress: 0.00 },
    { id: 'identity',   label: 'The Corridor',  sub: 'Who I Am',           progress: 0.14 },
    { id: 'capability', label: 'The Monolith',  sub: 'What I Can Do',      progress: 0.28 },
    { id: 'projects',   label: 'The Vault',     sub: 'What I\'ve Built',   progress: 0.43 },
    { id: 'timeline',   label: 'The Canyon',    sub: 'The Journey',        progress: 0.57 },
    { id: 'archive',    label: 'The Chamber',   sub: 'What NOVA Knows',    progress: 0.71 },
    { id: 'terminal',   label: 'The Threshold', sub: 'Let\'s Begin',       progress: 0.86 },
  ],
};
