/**
 * spiralConfig.js
 *
 * Authoritative Geometry & Configuration for the 3D Spiral Project Navigator
 * Phase 2 Specification:
 *   radius = 2.2
 *   pitch = 1.4
 *   turns = 3
 *   panelsPerTurn = 8 (desktop)
 *   panelCount = turns * panelsPerTurn = 24
 *   totalAngle = turns * 2 * Math.PI = 6 * Math.PI
 *   deltaTheta = (2 * Math.PI) / panelsPerTurn = Math.PI / 4
 *   arcLength = radius * deltaTheta = 2.2 * (Math.PI / 4) ≈ 1.728
 *   gap = 0.18
 *   panelWidth = arcLength - gap ≈ 1.55
 *   panelHeight = 1.2
 *
 * Middle turn active panel locus: θ = 3π where y = 0
 */

export const SPIRAL_CONFIG = {
  // Primary Helix Geometry
  radius: 2.2,
  pitch: 1.4,
  turns: 3,
  panelsPerTurn: 8,
  gap: 0.18,
  panelHeight: 1.2,
  panelThickness: 0.025,

  // Derived Desktop values
  desktopPanelCount: 24, // 3 turns * 8 panels/turn
  tabletPanelCount: 18,  // 3 turns * 6 panels/turn
  mobilePanelCount: 12,  // 3 turns * 4 panels/turn

  // Active panel definition
  activeTheta: 3 * Math.PI, // Middle turn locus where y = 0
  activeLift: 0.10,         // Outward normal displacement (≈ 0.10)
  activeScale: 1.06,        // Scale multiplier (≈ 1.06)

  // Camera specification
  camera: {
    fov: 44, // 42–48
    distance: 5.4,
    elevation: 0.65,
    azimuthOffset: -Math.PI / 7, // ~25° three-quarter perspective offset
  },

  // Environment and Material
  background: '#050505',
  material: {
    color: 0xf5f7fb,
    roughness: 0.28,
    metalness: 0.04,
    transmission: 0.82,
    thickness: 0.25,
    ior: 1.35,
    clearcoat: 0.25,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.94,
  },
};

/**
 * Calculates responsive helix parameters based on panelCount
 */
export function getHelixGeometry(panelCount = 24) {
  const turns = SPIRAL_CONFIG.turns; // 3
  const panelsPerTurn = panelCount / turns;
  const deltaTheta = (2 * Math.PI) / panelsPerTurn;
  const totalAngle = turns * 2 * Math.PI; // 6π
  const arcLength = SPIRAL_CONFIG.radius * deltaTheta;
  const panelWidth = Math.max(0.7, arcLength - SPIRAL_CONFIG.gap);
  const panelHeight = SPIRAL_CONFIG.panelHeight;

  return {
    panelCount,
    turns,
    panelsPerTurn,
    deltaTheta,
    totalAngle,
    arcLength,
    panelWidth,
    panelHeight,
    radius: SPIRAL_CONFIG.radius,
    pitch: SPIRAL_CONFIG.pitch,
  };
}
