/**
 * spiralConfig.js
 *
 * Authoritative Geometry & Interaction Constants for the Spiral Slider
 * Final merged specification implementation.
 *
 * Mathematical Helix:
 *   Δθ = π / 4  (8 panels per turn)
 *   turns = panelCount / 8
 *     Desktop: 24 panels -> 3.0 turns
 *     Tablet:  18 panels -> 2.25 turns
 *     Mobile:  12 panels -> 1.5 turns
 *
 *   x(θ) = R * cos(θ)
 *   z(θ) = R * sin(θ)
 *   y(θ) = pitch * (θ - θ_active) / (2 * π)
 *
 * Active panel: located at θ = 3π where y = 0
 * Camera: azimuth at θ = 3π offset by ~30° horizontally (θ_cam = 3π - π/6)
 */

export const SPIRAL_CONFIG = {
  // Primary Helix Geometry
  radius: 2.2,
  pitch: 1.4,
  deltaTheta: Math.PI / 4, // 45° per panel -> exactly 8 panels per turn

  // Responsive panel count configuration
  desktopPanelCount: 24, // 3.0 turns
  tabletPanelCount: 18,  // 2.25 turns
  mobilePanelCount: 12,  // 1.5 turns

  // Panel physical dimensions (constant across viewports)
  panelWidth: 0.88,
  panelHeight: 1.25,
  panelThickness: 0.025,
  cornerRadius: 0.04,

  // Active panel definition
  activeTheta: 3 * Math.PI, // Reference point on helix where y = 0
  activeLift: 0.1,          // Outward normal displacement (m)
  activeScale: 1.06,        // Scale boost

  // Camera azimuth coupled to active locus: θ = 3π offset by -30° (-π/6)
  camera: {
    fov: 40,
    distance: 5.8,
    elevation: 0.7,
    azimuthOffset: -Math.PI / 6, // 30° horizontal offset from θ = 3π
  },

  // Frosted acrylic material baseline
  material: {
    baseColor: 0xffffff,
    roughness: 0.25,
    metalness: 0.02,
    transmission: 0.85,
    thickness: 0.3,
    ior: 1.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    transparent: true,
  },

  // 4 Primary Portfolio System Destinations
  destinations: [
    {
      panelIndex: 4,
      id: 'finance',
      systemId: 'finance-manager',
      label: 'FINANCE',
    },
    {
      panelIndex: 10,
      id: 'trading',
      systemId: 'trading-intelligence',
      label: 'TRADING',
    },
    {
      panelIndex: 16,
      id: 'nova',
      systemId: 'nova-ai',
      label: 'NOVA',
    },
    {
      panelIndex: 22,
      id: 'forge',
      systemId: 'forge-ide',
      label: 'FORGE',
    },
  ],
};
